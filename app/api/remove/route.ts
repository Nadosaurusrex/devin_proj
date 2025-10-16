import { NextRequest, NextResponse } from 'next/server'
import { createRemoveSession, isMockMode } from '@/lib/devin'
import { createJob, setJobDevinSession, addJobLog, updateJobStatus } from '@/lib/jobs'
import type { CreateJobResponse } from '@/types/jobs'
import type { ErrorResponse } from '@/types/flags'
import type { RemoveSessionParams } from '@/types/devin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/remove
 *
 * Create a Devin session to remove feature flags and create a PR
 *
 * Body:
 * - owner: Repository owner (required)
 * - repo: Repository name (required)
 * - branch: Branch name (required)
 * - flags: Array of flag keys to remove (required)
 * - targetBehavior: "on" | "off" - inline as true or false (required)
 * - registryFiles: Array of registry file paths to update (required)
 * - testCommand: Command to run tests (optional)
 * - buildCommand: Command to build (optional)
 * - workingDir: Working directory (optional)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const {
      owner,
      repo,
      branch,
      flags,
      targetBehavior,
      registryFiles,
      testCommand,
      buildCommand,
      workingDir,
    } = body

    if (
      !owner ||
      !repo ||
      !branch ||
      !flags ||
      !Array.isArray(flags) ||
      flags.length === 0 ||
      !targetBehavior ||
      !['on', 'off'].includes(targetBehavior) ||
      !registryFiles ||
      !Array.isArray(registryFiles) ||
      registryFiles.length === 0
    ) {
      const errorResponse: ErrorResponse = {
        error: 'MISSING_PARAMETERS',
        message: 'Required parameters missing or invalid',
        suggestions: [
          'Provide "owner" (string)',
          'Provide "repo" (string)',
          'Provide "branch" (string)',
          'Provide "flags" (array of strings, non-empty)',
          'Provide "targetBehavior" ("on" or "off")',
          'Provide "registryFiles" (array of strings, non-empty)',
          'Example: {"owner": "facebook", "repo": "react", "branch": "main", "flags": ["old_flag"], "targetBehavior": "on", "registryFiles": ["config/flags.json"]}'
        ],
        statusCode: 400
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Create job
    const job = createJob('remove', {
      owner,
      repo,
      branch,
      flags,
    })

    addJobLog(
      job.id,
      'info',
      `Starting removal of ${flags.length} flag(s) in ${owner}/${repo} (inline as "${targetBehavior}")`
    )
    addJobLog(job.id, 'info', isMockMode() ? 'Running in MOCK mode' : 'Using Devin API')
    addJobLog(job.id, 'info', `Registry files to update: ${registryFiles.join(', ')}`)

    if (testCommand) {
      addJobLog(job.id, 'info', `Will run tests: ${testCommand}`)
    }
    if (buildCommand) {
      addJobLog(job.id, 'info', `Will run build: ${buildCommand}`)
    }

    // Create Devin session asynchronously
    const params: RemoveSessionParams = {
      owner,
      repo,
      branch,
      flags,
      targetBehavior,
      registryFiles,
      testCommand,
      buildCommand,
      workingDir,
    }

    // Start session in background
    createRemoveSession(params)
      .then(({ sessionId }) => {
        setJobDevinSession(job.id, sessionId)
        updateJobStatus(job.id, 'running')
        addJobLog(job.id, 'info', `Created Devin removal session: ${sessionId}`)
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
