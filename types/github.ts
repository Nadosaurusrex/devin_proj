/**
 * GitHub API Contents endpoint response
 * https://docs.github.com/en/rest/repos/contents
 */
export interface GitHubFileContent {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string | null
  type: 'file' | 'dir' | 'symlink' | 'submodule'
  content?: string // Base64 encoded
  encoding?: string // Usually 'base64'
  _links: {
    self: string
    git: string
    html: string
  }
}

/**
 * GitHub API error response
 */
export interface GitHubError {
  message: string
  documentation_url: string
  status?: string
}

/**
 * Options for fetching GitHub file content
 */
export interface GetFileContentOptions {
  owner: string
  repo: string
  path: string
  ref?: string // Branch, tag, or commit SHA
  token?: string
}
