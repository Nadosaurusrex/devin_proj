import { NextRequest, NextResponse } from 'next/server'
import { createAnalyzeSession, isMockMode } from '@/lib/devin'
import type { ErrorResponse } from '@/types/flags'
import type { AnalyzeSessionParams } from '@/types/devin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

    // Create Devin session (stateless - no job storage needed)
    const params: AnalyzeSessionParams = {
      owner,
      repo,
      branch,
      flags,
      workingDir,
      patterns,
    }

    try {
      const { sessionId } = await createAnalyzeSession(params)

      // Return Devin session ID directly (no job storage)
      const response = {
        sessionId,
        pollUrl: `/api/sessions/${sessionId}`,
        mode: isMockMode() ? 'mock' : 'live',
      }

      return NextResponse.json(response, { status: 201 })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      const errorResponse: ErrorResponse = {
        error: 'SESSION_CREATE_FAILED',
        message: `Failed to create Devin session: ${message}`,
        statusCode: 500
      }
      return NextResponse.json(errorResponse, { status: 500 })
    }

  } catch (error) {
    const errorResponse: ErrorResponse = {
      error: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      statusCode: 500
    }
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
