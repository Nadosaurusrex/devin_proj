/**
 * Feature flag representation
 */
export interface Flag {
  key: string
  state: 'enabled' | 'disabled' | 'deprecated'
  description?: string
  lastModified?: string
  createdAt?: string
  tags?: string[]
  owner?: string
}

/**
 * Successful flags API response
 */
export interface FlagsResponse {
  flags: Flag[]
  source: {
    owner: string
    repo: string
    branch: string
    path: string
  }
}

/**
 * Error response from flags API
 */
export interface ErrorResponse {
  error: string
  message: string
  suggestions?: string[]
  statusCode: number
}
