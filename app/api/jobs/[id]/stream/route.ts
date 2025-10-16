import { NextRequest } from 'next/server'
import { getJob, setJobResult, updateJobStatus } from '@/lib/jobs'
import { getSessionStatus } from '@/lib/devin'
import type { SSEMessage } from '@/types/jobs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/jobs/[id]/stream
 *
 * Server-Sent Events (SSE) endpoint for streaming job logs and results
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params

  // Get job
  const job = getJob(jobId)
  if (!job) {
    return new Response(
      JSON.stringify({ error: 'Job not found' }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  // Create SSE stream
  const encoder = new TextEncoder()
  let lastLogIndex = 0
  let lastDevinOutputLength = 0
  let completionSent = false
  let resultSent = false
  let completionTime: number | null = null
  const POST_COMPLETION_POLL_DURATION = 10000 // Continue polling for 10 seconds after completion

  const stream = new ReadableStream({
    async start(controller) {
      // Helper to send SSE message
      const sendMessage = (message: SSEMessage) => {
        const data = `data: ${JSON.stringify(message)}\n\n`
        controller.enqueue(encoder.encode(data))
      }

      // Send initial status
      sendMessage({
        type: 'status',
        data: { status: job.status },
        timestamp: new Date().toISOString(),
      })

      // Poll for updates
      const pollInterval = setInterval(async () => {
        try {
          const currentJob = getJob(jobId)
          if (!currentJob) {
            clearInterval(pollInterval)
            controller.close()
            return
          }

          // Send new logs
          if (currentJob.logs.length > lastLogIndex) {
            const newLogs = currentJob.logs.slice(lastLogIndex)
            for (const log of newLogs) {
              sendMessage({
                type: 'log',
                data: log,
                timestamp: log.timestamp,
              })
            }
            lastLogIndex = currentJob.logs.length
          }

          // Check Devin session status if session exists
          if (currentJob.devinSessionId && (currentJob.status === 'running' || (completionTime && Date.now() - completionTime < POST_COMPLETION_POLL_DURATION))) {
            try {
              const sessionStatus = await getSessionStatus(currentJob.devinSessionId)

              // Parse output for new logs (only send new output since last check)
              if (sessionStatus.output && sessionStatus.output.length > lastDevinOutputLength) {
                const newOutput = sessionStatus.output.substring(lastDevinOutputLength)
                const outputLines = newOutput.split('\n')
                for (const line of outputLines) {
                  if (line.trim()) {
                    sendMessage({
                      type: 'log',
                      data: {
                        timestamp: new Date().toISOString(),
                        level: 'info',
                        message: line,
                      },
                      timestamp: new Date().toISOString(),
                    })
                  }
                }
                lastDevinOutputLength = sessionStatus.output.length
              }

              // Check if result is available and hasn't been sent yet
              if (sessionStatus.result && !resultSent) {
                // Save result to job storage
                setJobResult(jobId, sessionStatus.result)

                sendMessage({
                  type: 'result',
                  data: sessionStatus.result,
                  timestamp: new Date().toISOString(),
                })

                resultSent = true
                console.log(`[Stream ${jobId}] Result sent successfully`)
              }

              // Check if completed - decouple from result availability
              if (sessionStatus.status === 'completed' && !completionSent) {
                // Update job status immediately
                updateJobStatus(jobId, 'completed')

                // Mark completion time to continue polling for result
                completionTime = Date.now()

                // Send complete message even if result not found yet
                sendMessage({
                  type: 'complete',
                  data: { status: 'completed' },
                  timestamp: new Date().toISOString(),
                })

                completionSent = true
                console.log(`[Stream ${jobId}] Completion sent, will continue polling for result`)

                // If result was already found, we can close now
                if (resultSent) {
                  console.log(`[Stream ${jobId}] Result already sent, closing stream`)
                  clearInterval(pollInterval)
                  controller.close()
                  return
                }
              }

              // Check if failed
              if (sessionStatus.status === 'failed' && !completionSent) {
                updateJobStatus(jobId, 'failed')

                sendMessage({
                  type: 'error',
                  data: { error: sessionStatus.error || 'Session failed' },
                  timestamp: new Date().toISOString(),
                })

                sendMessage({
                  type: 'complete',
                  data: { status: 'failed' },
                  timestamp: new Date().toISOString(),
                })

                completionSent = true
                clearInterval(pollInterval)
                controller.close()
                return
              }
            } catch (error) {
              // Log error but continue polling
              sendMessage({
                type: 'log',
                data: {
                  timestamp: new Date().toISOString(),
                  level: 'warn',
                  message: `Failed to get session status: ${error instanceof Error ? error.message : 'Unknown error'}`,
                },
                timestamp: new Date().toISOString(),
              })
            }
          }

          // Check if we should stop post-completion polling
          if (completionSent && completionTime && Date.now() - completionTime >= POST_COMPLETION_POLL_DURATION) {
            if (!resultSent) {
              console.warn(`[Stream ${jobId}] Closing stream after ${POST_COMPLETION_POLL_DURATION}ms - no result found`)
            }
            clearInterval(pollInterval)
            controller.close()
            return
          }

          // Send status update
          sendMessage({
            type: 'status',
            data: { status: currentJob.status },
            timestamp: new Date().toISOString(),
          })

          // If job is completed or failed without Devin session, close stream
          if (!currentJob.devinSessionId && (currentJob.status === 'completed' || currentJob.status === 'failed')) {
            if (currentJob.result && !resultSent) {
              sendMessage({
                type: 'result',
                data: currentJob.result,
                timestamp: new Date().toISOString(),
              })
              resultSent = true
            }

            if (currentJob.error) {
              sendMessage({
                type: 'error',
                data: { error: currentJob.error },
                timestamp: new Date().toISOString(),
              })
            }

            if (!completionSent) {
              sendMessage({
                type: 'complete',
                data: { status: currentJob.status },
                timestamp: new Date().toISOString(),
              })
              completionSent = true
            }

            clearInterval(pollInterval)
            controller.close()
          }
        } catch (error) {
          sendMessage({
            type: 'error',
            data: { error: error instanceof Error ? error.message : 'Unknown error' },
            timestamp: new Date().toISOString(),
          })
          clearInterval(pollInterval)
          controller.close()
        }
      }, 500) // Poll every 500ms

      // Clean up on client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(pollInterval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
