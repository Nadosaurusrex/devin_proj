import { NextRequest, NextResponse } from 'next/server'
import { getFileContent, getServerGitHubToken, GitHubApiError } from '@/lib/github'
import { parseFlags } from '@/lib/flags-parser'
import type { FlagsResponse, ErrorResponse } from '@/types/flags'

/**
 * GET /api/flags
 *
 * Fetch and parse feature flags from a GitHub repository
 *
 * Query params:
 * - owner: Repository owner (required)
 * - repo: Repository name (required)
 * - branch: Branch name (optional, defaults to repo's default branch)
 * - registryPath: Path to flags file (optional, defaults to config/flags.json)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract and validate query parameters
    const owner = searchParams.get('owner')
    const repo = searchParams.get('repo')
    const branch = searchParams.get('branch') || undefined
    const registryPath = searchParams.get('registryPath') || 'config/flags.json'

    if (!owner || !repo) {
      const errorResponse: ErrorResponse = {
        error: 'MISSING_PARAMETERS',
        message: 'Required parameters missing',
        suggestions: [
          'Provide "owner" query parameter (repository owner)',
          'Provide "repo" query parameter (repository name)',
          'Example: /api/flags?owner=facebook&repo=react&registryPath=config/flags.json'
        ],
        statusCode: 400
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Get GitHub token from environment
    const token = getServerGitHubToken()

    if (!token) {
      const errorResponse: ErrorResponse = {
        error: 'MISSING_TOKEN',
        message: 'GitHub token not configured',
        suggestions: [
          'Set GITHUB_TOKEN environment variable',
          'Ensure .env file contains valid GitHub token'
        ],
        statusCode: 500
      }
      return NextResponse.json(errorResponse, { status: 500 })
    }

    // Fetch file content from GitHub
    const content = await getFileContent({
      owner,
      repo,
      path: registryPath,
      ref: branch,
      token
    })

    // Parse flags from content
    const flags = parseFlags(content, registryPath)

    // Return successful response
    const response: FlagsResponse = {
      flags,
      source: {
        owner,
        repo,
        branch: branch || 'default',
        path: registryPath
      }
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    // Handle GitHub API errors
    if (error instanceof GitHubApiError) {
      const errorResponse: ErrorResponse = {
        error: 'GITHUB_ERROR',
        message: error.message,
        suggestions: [
          error.statusCode === 404
            ? 'Check that the repository and file path are correct'
            : 'Verify GitHub token has appropriate permissions',
          'Ensure the repository is accessible with the provided credentials'
        ],
        statusCode: error.statusCode
      }
      return NextResponse.json(errorResponse, { status: error.statusCode })
    }

    // Handle parsing errors
    if (error instanceof Error && error.message.includes('parse')) {
      const errorResponse: ErrorResponse = {
        error: 'PARSE_ERROR',
        message: error.message,
        suggestions: [
          'Verify the file is valid JSON or YAML',
          'Check that the file structure matches expected format',
          'Expected format: array of flags or object with "flags" property'
        ],
        statusCode: 422
      }
      return NextResponse.json(errorResponse, { status: 422 })
    }

    // Generic error handler
    const errorResponse: ErrorResponse = {
      error: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      statusCode: 500
    }
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
