import { NextRequest, NextResponse } from 'next/server'
import { createAnalyzeSession, isMockMode } from '@/lib/devin'
import { createJob, setJobDevinSession, addJobLog, updateJobStatus } from '@/lib/jobs'
import type { CreateJobResponse } from '@/types/jobs'
import type { ErrorResponse } from '@/types/flags'
import type { AnalyzeSessionParams } from '@/types/devin'

/**
 * POST /api/analyze
 *
 * Create a Devin session to analyze feature flags
 *
 * Body:
 * - owner: Repository owner (required)
 * - repo: Repository name (required)
 * - branch: Branch name (required)
 * - flags: Array of flag keys to analyze (required)
 * - workingDir: Working directory (optional)
 * - patterns: File patterns to search (optional)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { owner, repo, branch, flags, workingDir, patterns } = body

    if (!owner || !repo || !branch || !flags || !Array.isArray(flags) || flags.length === 0) {
      const errorResponse: ErrorResponse = {
        error: 'MISSING_PARAMETERS',
        message: 'Required parameters missing or invalid',
        suggestions: [
          'Provide "owner" (string)',
          'Provide "repo" (string)',
          'Provide "branch" (string)',
          'Provide "flags" (array of strings, non-empty)',
          'Example: {"owner": "facebook", "repo": "react", "branch": "main", "flags": ["new_feature"]}'
        ],
        statusCode: 400
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Create job
    const job = createJob('analyze', {
      owner,
      repo,
      branch,
      flags,
    })

    addJobLog(job.id, 'info', `Starting analysis for ${flags.length} flag(s) in ${owner}/${repo}`)
    addJobLog(job.id, 'info', isMockMode() ? 'Running in MOCK mode' : 'Using Devin API')

    // Create Devin session asynchronously
    const params: AnalyzeSessionParams = {
      owner,
      repo,
      branch,
      flags,
      workingDir,
      patterns,
    }

    // Start session in background
    createAnalyzeSession(params)
      .then(({ sessionId }) => {
        setJobDevinSession(job.id, sessionId)
        updateJobStatus(job.id, 'running')
        addJobLog(job.id, 'info', `Created Devin session: ${sessionId}`)
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Unknown error'
        addJobLog(job.id, 'error', `Failed to create Devin session: ${message}`)
        updateJobStatus(job.id, 'failed')
      })

    // Return job ID and stream URL
    const response: CreateJobResponse = {
      jobId: job.id,
      streamUrl: `/api/jobs/${job.id}/stream`,
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    const errorResponse: ErrorResponse = {
      error: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      statusCode: 500
    }
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
