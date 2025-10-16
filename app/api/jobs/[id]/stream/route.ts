import { NextRequest } from 'next/server'
import { getJob } from '@/lib/jobs'
import { getSessionStatus } from '@/lib/devin'
import type { SSEMessage } from '@/types/jobs'

/**
 * GET /api/jobs/[id]/stream
 *
 * Server-Sent Events (SSE) endpoint for streaming job logs and results
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const jobId = params.id

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

          // Check Devin session status if running
          if (currentJob.devinSessionId && currentJob.status === 'running') {
            try {
              const sessionStatus = await getSessionStatus(currentJob.devinSessionId)

              // Parse output for new logs
              if (sessionStatus.output) {
                const outputLines = sessionStatus.output.split('\n')
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
              }

              // Check if completed
              if (sessionStatus.status === 'completed' && sessionStatus.result) {
                sendMessage({
                  type: 'result',
                  data: sessionStatus.result,
                  timestamp: new Date().toISOString(),
                })

                sendMessage({
                  type: 'complete',
                  data: { status: 'completed' },
                  timestamp: new Date().toISOString(),
                })

                clearInterval(pollInterval)
                controller.close()
                return
              }

              // Check if failed
              if (sessionStatus.status === 'failed') {
                sendMessage({
                  type: 'error',
                  data: { error: sessionStatus.error || 'Session failed' },
                  timestamp: new Date().toISOString(),
                })

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

          // Send status update
          sendMessage({
            type: 'status',
            data: { status: currentJob.status },
            timestamp: new Date().toISOString(),
          })

          // If job is completed or failed, close stream
          if (currentJob.status === 'completed' || currentJob.status === 'failed') {
            if (currentJob.result) {
              sendMessage({
                type: 'result',
                data: currentJob.result,
                timestamp: new Date().toISOString(),
              })
            }

            if (currentJob.error) {
              sendMessage({
                type: 'error',
                data: { error: currentJob.error },
                timestamp: new Date().toISOString(),
              })
            }

            sendMessage({
              type: 'complete',
              data: { status: currentJob.status },
              timestamp: new Date().toISOString(),
            })

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
