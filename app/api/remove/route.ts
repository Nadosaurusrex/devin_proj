import { NextRequest, NextResponse } from 'next/server'
import { createRemoveSession, isMockMode } from '@/lib/devin'
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

    // Create Devin session (stateless - no job storage needed)
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

    try {
      const { sessionId } = await createRemoveSession(params)

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
        message: `Failed to create Devin removal session: ${message}`,
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
