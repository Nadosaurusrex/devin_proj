'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import type { LogEntry, JobStatus, SSEMessage } from '@/types/jobs'
import type { AnalysisResult, RemovalResult } from '@/types/devin'

export default function JobPage() {
  const params = useParams()
  const jobId = params.id as string
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [status, setStatus] = useState<JobStatus>('pending')
  const [result, setResult] = useState<AnalysisResult | RemovalResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  // Connect to SSE stream
  useEffect(() => {
    const streamUrl = `/api/jobs/${jobId}/stream`
    const eventSource = new EventSource(streamUrl)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      try {
        const message: SSEMessage = JSON.parse(event.data)

        switch (message.type) {
          case 'log':
            setLogs((prev) => [...prev, message.data as LogEntry])
            break
          case 'status':
            setStatus((message.data as { status: JobStatus }).status)
            break
          case 'result':
            setResult(message.data as AnalysisResult | RemovalResult)
            break
          case 'error':
            setError((message.data as { error: string }).error)
            break
          case 'complete':
            setIsComplete(true)
            eventSource.close()
            break
        }
      } catch (err) {
        console.error('Failed to parse SSE message:', err)
      }
    }

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err)
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [jobId])

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getLogColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'text-red-600'
      case 'warn':
        return 'text-yellow-600'
      case 'info':
        return 'text-gray-700'
      case 'debug':
        return 'text-gray-500'
      default:
        return 'text-gray-700'
    }
  }

  const isAnalysisResult = (result: AnalysisResult | RemovalResult): result is AnalysisResult => {
    return 'flags' in result && Array.isArray(result.flags)
  }

  const isRemovalResult = (result: AnalysisResult | RemovalResult): result is RemovalResult => {
    return 'summary' in result && 'flags_removed' in result.summary
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Job Details</h1>
          <p className="text-gray-600 mt-1">
            Job ID: <span className="font-mono text-sm">{jobId}</span>
          </p>
        </div>
        <span className={`px-3 py-1 text-sm rounded ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      <div className="border rounded p-4 bg-gray-50">
        <h2 className="font-semibold mb-3">Job Logs</h2>
        <div className="font-mono text-xs space-y-1 max-h-96 overflow-y-auto bg-white p-3 rounded border">
          {logs.length === 0 ? (
            <div className="text-gray-500">Waiting for logs...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={getLogColor(log.level)}>
                <span className="text-gray-400">
                  [{new Date(log.timestamp).toLocaleTimeString()}]
                </span>{' '}
                <span className="font-semibold uppercase">[{log.level}]</span>{' '}
                {log.message}
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>

      {result && (
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-3">Result</h2>

          {isAnalysisResult(result) && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <h3 className="font-semibold mb-2">Summary</h3>
                <div className="text-sm space-y-1">
                  <p>Total Flags: {result.summary.total_flags}</p>
                  <p>Total References: {result.summary.total_references}</p>
                  <p>Estimated Effort: {result.summary.estimated_effort_hours} hours</p>
                </div>
              </div>

              {result.flags.map((flag) => (
                <div key={flag.key} className="border rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">
                      <code>{flag.key}</code>
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        flag.risk_level === 'low'
                          ? 'bg-green-100 text-green-800'
                          : flag.risk_level === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {flag.risk_level} risk
                    </span>
                  </div>

                  <div className="text-sm space-y-2">
                    <p>
                      <strong>References:</strong> {flag.reference_count} in {flag.affected_files.length} files
                    </p>
                    <p>
                      <strong>Confidence:</strong> {(flag.confidence * 100).toFixed(0)}%
                    </p>
                    <p>
                      <strong>Recommendation:</strong> {flag.recommendation}
                    </p>

                    {flag.affected_files.length > 0 && (
                      <div>
                        <strong>Affected Files:</strong>
                        <ul className="list-disc list-inside mt-1 text-xs font-mono">
                          {flag.affected_files.map((file, idx) => (
                            <li key={idx}>{file}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {isRemovalResult(result) && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <h3 className="font-semibold mb-2">Summary</h3>
                <div className="text-sm space-y-1">
                  <p>Flags Removed: {result.summary.flags_removed}</p>
                  <p>Files Modified: {result.summary.files_modified}</p>
                  <p>Tests Passed: {result.summary.tests_passed ? '✓' : '✗'}</p>
                  <p>Build Passed: {result.summary.build_passed ? '✓' : '✗'}</p>
                </div>
              </div>

              {result.pr_url && (
                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <h3 className="font-semibold mb-2">Pull Request</h3>
                  <div className="flex items-center gap-2">
                    <a
                      href={result.pr_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-mono text-sm"
                    >
                      {result.pr_url}
                    </a>
                    <button
                      onClick={() => copyToClipboard(result.pr_url!)}
                      className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Copy
                    </button>
                  </div>
                  {result.branch && (
                    <p className="text-sm mt-2">
                      Branch: <code className="font-mono">{result.branch}</code>
                    </p>
                  )}
                </div>
              )}

              {result.diff && (
                <div className="border rounded p-4">
                  <h3 className="font-semibold mb-2">Diff (PR creation failed)</h3>
                  <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto border">
                    {result.diff}
                  </pre>
                  {result.commit_message && (
                    <div className="mt-3">
                      <strong className="text-sm">Proposed Commit Message:</strong>
                      <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto border mt-1">
                        {result.commit_message}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {result.errors && result.errors.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                  <h3 className="font-semibold mb-2">Warnings</h3>
                  <ul className="text-sm space-y-1">
                    {result.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!result && isComplete && (
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-2">Result</h2>
          <p className="text-gray-500">
            Job completed but no result was returned.
          </p>
        </div>
      )}

      <div className="text-center">
        <a href="/flags" className="text-blue-500 hover:underline text-sm">
          ← Back to Flags
        </a>
      </div>
    </div>
  )
}
