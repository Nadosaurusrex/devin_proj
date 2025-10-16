/**
 * Devin API types for session management and analysis
 */

/**
 * Devin session creation request
 */
export interface CreateSessionRequest {
  instruction: string
  environment_variables?: Record<string, string>
  repository?: {
    url: string
    branch?: string
  }
}

/**
 * Devin session creation response
 */
export interface CreateSessionResponse {
  session_id: string
  status: 'created' | 'starting' | 'running'
}

/**
 * Devin session status
 */
export type DevinSessionStatus =
  | 'created'
  | 'starting'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'

/**
 * Devin session status response
 */
export interface SessionStatusResponse {
  session_id: string
  status: DevinSessionStatus
  output?: string
  error?: string
  result?: AnalysisResult
}

/**
 * Analysis result from Devin
 */
export interface AnalysisResult {
  flags: FlagAnalysis[]
  summary: {
    total_flags: number
    total_references: number
    estimated_effort_hours: number
  }
}

/**
 * Analysis details for a single flag
 */
export interface FlagAnalysis {
  key: string
  references: {
    file: string
    line: number
    context: string
  }[]
  reference_count: number
  affected_files: string[]
  risk_level: 'low' | 'medium' | 'high'
  confidence: number // 0-1
  recommendation: string
}

/**
 * Analyze session parameters
 */
export interface AnalyzeSessionParams {
  owner: string
  repo: string
  branch: string
  flags: string[] // Array of flag keys to analyze
  workingDir?: string
  patterns?: string[] // File patterns to search
}
