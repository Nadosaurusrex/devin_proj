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
  result?: AnalysisResult | RemovalResult
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

/**
 * Remove session parameters
 */
export interface RemoveSessionParams {
  owner: string
  repo: string
  branch: string
  flags: string[] // Array of flag keys to remove
  targetBehavior: 'on' | 'off' // Inline flags as always on or always off
  registryFiles: string[] // Registry files to update
  testCommand?: string // Command to run tests (e.g., "npm test")
  buildCommand?: string // Command to build (e.g., "npm run build")
  workingDir?: string
}

/**
 * Removal result from Devin
 */
export interface RemovalResult {
  pr_url?: string // GitHub PR URL if successfully created
  branch?: string // Branch name where changes were pushed
  diff?: string // Unified diff if PR creation failed
  commit_message?: string // Proposed commit message
  summary: {
    flags_removed: number
    files_modified: number
    tests_passed: boolean
    build_passed: boolean
  }
  errors?: string[] // Any errors encountered
}
