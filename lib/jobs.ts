import type { Job, JobStatus, JobType, LogEntry } from '@/types/jobs'
import type { AnalysisResult } from '@/types/devin'

/**
 * In-memory job storage
 * In production, this would be replaced with a database
 */
const jobs = new Map<string, Job>()

/**
 * Generate unique job ID
 */
function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Create a new job
 */
export function createJob(
  type: JobType,
  metadata: {
    owner: string
    repo: string
    branch: string
    flags: string[]
  }
): Job {
  const id = generateJobId()
  const now = new Date().toISOString()

  const job: Job = {
    id,
    type,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    logs: [],
    metadata,
  }

  jobs.set(id, job)
  return job
}

/**
 * Get job by ID
 */
export function getJob(id: string): Job | undefined {
  return jobs.get(id)
}

/**
 * Update job status
 */
export function updateJobStatus(id: string, status: JobStatus): void {
  const job = jobs.get(id)
  if (!job) {
    throw new Error(`Job not found: ${id}`)
  }

  job.status = status
  job.updatedAt = new Date().toISOString()
  jobs.set(id, job)
}

/**
 * Set job Devin session ID
 */
export function setJobDevinSession(id: string, sessionId: string): void {
  const job = jobs.get(id)
  if (!job) {
    throw new Error(`Job not found: ${id}`)
  }

  job.devinSessionId = sessionId
  job.updatedAt = new Date().toISOString()
  jobs.set(id, job)
}

/**
 * Add log entry to job
 */
export function addJobLog(
  id: string,
  level: LogEntry['level'],
  message: string
): void {
  const job = jobs.get(id)
  if (!job) {
    throw new Error(`Job not found: ${id}`)
  }

  job.logs.push({
    timestamp: new Date().toISOString(),
    level,
    message,
  })
  job.updatedAt = new Date().toISOString()
  jobs.set(id, job)
}

/**
 * Set job result
 */
export function setJobResult(id: string, result: AnalysisResult): void {
  const job = jobs.get(id)
  if (!job) {
    throw new Error(`Job not found: ${id}`)
  }

  job.result = result
  job.status = 'completed'
  job.updatedAt = new Date().toISOString()
  jobs.set(id, job)
}

/**
 * Set job error
 */
export function setJobError(id: string, error: string): void {
  const job = jobs.get(id)
  if (!job) {
    throw new Error(`Job not found: ${id}`)
  }

  job.error = error
  job.status = 'failed'
  job.updatedAt = new Date().toISOString()
  jobs.set(id, job)
}

/**
 * Get all jobs (for debugging/admin)
 */
export function getAllJobs(): Job[] {
  return Array.from(jobs.values())
}

/**
 * Clear all jobs (for testing)
 */
export function clearAllJobs(): void {
  jobs.clear()
}
