import { NextRequest, NextResponse } from 'next/server'
import { getJob, setJobResult, updateJobStatus } from '@/lib/jobs'
import { getSessionStatus } from '@/lib/devin'
import type { ErrorResponse } from '@/types/flags'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/jobs/[id]
 *
 * Lightweight endpoint for polling job status (Vercel-compatible)
 * This endpoint is designed to be called repeatedly from the client
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params

  try {
    // Get job
    const job = getJob(jobId)
    if (!job) {
      const errorResponse: ErrorResponse = {
        error: 'JOB_NOT_FOUND',
        message: 'Job not found',
        statusCode: 404
      }
      return NextResponse.json(errorResponse, { status: 404 })
    }

    // Check Devin session status if session exists and job is running
    if (job.devinSessionId && (job.status === 'running' || job.status === 'pending')) {
      try {
        const sessionStatus = await getSessionStatus(job.devinSessionId)

        // Update job status if Devin session completed
        if (sessionStatus.status === 'completed') {
          updateJobStatus(jobId, 'completed')
        } else if (sessionStatus.status === 'failed') {
          updateJobStatus(jobId, 'failed')
        }

        // Store result if available
        if (sessionStatus.result && !job.result) {
          setJobResult(jobId, sessionStatus.result)
        }

        // Return combined status
        return NextResponse.json({
          jobId,
          status: sessionStatus.status,
          logs: job.logs,
          result: sessionStatus.result || job.result,
          error: job.error,
          devinOutput: sessionStatus.output,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
        })
      } catch (error) {
        // If Devin API call fails, still return job data
        console.error(`[Job ${jobId}] Failed to get Devin session status:`, error)
        return NextResponse.json({
          jobId,
          status: job.status,
          logs: job.logs,
          result: job.result,
          error: job.error || (error instanceof Error ? error.message : 'Failed to get session status'),
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
        })
      }
    }

    // Return job data without Devin status
    return NextResponse.json({
      jobId,
      status: job.status,
      logs: job.logs,
      result: job.result,
      error: job.error,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    })

  } catch (error) {
    const errorResponse: ErrorResponse = {
      error: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      statusCode: 500
    }
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
