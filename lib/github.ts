import type { GitHubFileContent, GitHubError, GetFileContentOptions } from '@/types/github'

/**
 * GitHub API base URL
 */
const GITHUB_API_BASE = 'https://api.github.com'

/**
 * Custom error class for GitHub operations
 */
export class GitHubApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'GitHubApiError'
  }
}

/**
 * Sanitize error messages to prevent token leakage
 */
function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    // Remove any potential tokens from error messages
    return error.message.replace(/gh[ps]_[a-zA-Z0-9]{36,}/g, '[TOKEN_REDACTED]')
  }
  return 'Unknown error occurred'
}

/**
 * Fetch file content from GitHub repository
 *
 * @param options - Options for fetching file content
 * @returns Decoded file content as string
 * @throws GitHubApiError on failure
 */
export async function getFileContent(options: GetFileContentOptions): Promise<string> {
  const { owner, repo, path, ref, token } = options

  // Build URL with optional ref parameter
  const url = new URL(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`)
  if (ref) {
    url.searchParams.set('ref', ref)
  }

  // Prepare headers
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url.toString(), { headers })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as GitHubError

      if (response.status === 404) {
        throw new GitHubApiError(
          `File not found: ${path} in ${owner}/${repo}${ref ? ` (ref: ${ref})` : ''}`,
          404,
          errorData
        )
      }

      if (response.status === 403) {
        throw new GitHubApiError(
          'GitHub API rate limit exceeded or insufficient permissions',
          403,
          errorData
        )
      }

      throw new GitHubApiError(
        errorData.message || 'Failed to fetch file from GitHub',
        response.status,
        errorData
      )
    }

    const data = await response.json() as GitHubFileContent

    // GitHub returns base64-encoded content for files
    if (data.type !== 'file') {
      throw new GitHubApiError(
        `Path ${path} is not a file (type: ${data.type})`,
        400
      )
    }

    if (!data.content || !data.encoding) {
      throw new GitHubApiError(
        'File content not available from GitHub API',
        500
      )
    }

    if (data.encoding !== 'base64') {
      throw new GitHubApiError(
        `Unsupported encoding: ${data.encoding}`,
        500
      )
    }

    // Decode base64 content
    const decoded = Buffer.from(data.content, 'base64').toString('utf-8')
    return decoded

  } catch (error) {
    if (error instanceof GitHubApiError) {
      throw error
    }

    // Network or other errors
    const sanitized = sanitizeError(error)
    throw new GitHubApiError(
      `Failed to fetch from GitHub: ${sanitized}`,
      500,
      error
    )
  }
}

/**
 * Get the server-side GitHub token from environment
 */
export function getServerGitHubToken(): string | undefined {
  return process.env.GITHUB_TOKEN
}
