import type { AnalysisResult, RemovalResult } from './devin'

/**
 * Job types
 */
export type JobType = 'analyze' | 'remove'

/**
 * Job status
 */
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed'

/**
 * Log entry
 */
export interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
}

/**
 * Job metadata
 */
export interface Job {
  id: string
  type: JobType
  status: JobStatus
  createdAt: string
  updatedAt: string
  devinSessionId?: string
  logs: LogEntry[]
  result?: AnalysisResult | RemovalResult
  error?: string
  metadata: {
    owner: string
    repo: string
    branch: string
    flags: string[]
  }
}

/**
 * Response for job creation
 */
export interface CreateJobResponse {
  jobId: string
  streamUrl: string
}

/**
 * SSE message types
 */
export type SSEMessageType = 'log' | 'status' | 'result' | 'error' | 'complete'

/**
 * SSE message
 */
export interface SSEMessage {
  type: SSEMessageType
  data: unknown
  timestamp: string
}
