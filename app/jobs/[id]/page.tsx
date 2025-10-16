'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { Card } from 'primereact/card'
import { Tag } from 'primereact/tag'
import { Button } from 'primereact/button'
import { Divider } from 'primereact/divider'
import { ProgressBar } from 'primereact/progressbar'
import { Badge } from 'primereact/badge'
import { motion } from 'framer-motion'
import type { LogEntry, JobStatus, SSEMessage } from '@/types/jobs'
import type { AnalysisResult, RemovalResult } from '@/types/devin'

export default function JobPage() {
  const params = useParams()
  const router = useRouter()
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

  const getStatusSeverity = (status: JobStatus) => {
    switch (status) {
      case 'pending': return 'secondary'
      case 'running': return 'info'
      case 'completed': return 'success'
      case 'failed': return 'danger'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: JobStatus) => {
    switch (status) {
      case 'pending': return 'pi-clock'
      case 'running': return 'pi-spin pi-spinner'
      case 'completed': return 'pi-check-circle'
      case 'failed': return 'pi-times-circle'
      default: return 'pi-question-circle'
    }
  }

  const getLogIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return { icon: 'pi-times-circle', color: 'text-red-400' }
      case 'warn': return { icon: 'pi-exclamation-triangle', color: 'text-yellow-400' }
      case 'info': return { icon: 'pi-info-circle', color: 'text-blue-400' }
      case 'debug': return { icon: 'pi-cog', color: 'text-gray-400' }
      default: return { icon: 'pi-circle', color: 'text-gray-300' }
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
  }

  const handleRemoveFlag = (flagKey: string) => {
    // Store the flag key in localStorage so the flags page can open the remove modal
    localStorage.setItem('pending_remove_flag', flagKey)
    router.push('/flags')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex justify-content-between align-items-start flex-wrap gap-3">
        <div>
          <div className="flex align-items-center gap-2 mb-2">
            <i className="pi pi-briefcase text-3xl text-blue-600"></i>
            <h1 className="text-4xl font-bold m-0">Job Details</h1>
          </div>
          <p className="text-gray-600 flex align-items-center gap-2">
            <i className="pi pi-hashtag"></i>
            <code className="font-mono text-sm">{jobId}</code>
          </p>
        </div>
        <div className="flex gap-2 align-items-center">
          <Tag
            value={status.toUpperCase()}
            severity={getStatusSeverity(status)}
            icon={`pi ${getStatusIcon(status)}`}
            style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}
          />
          <Button
            icon="pi pi-arrow-left"
            label="Back to Flags"
            outlined
            onClick={() => router.push('/flags')}
          />
        </div>
      </div>

      {/* Progress Bar for Running Status */}
      {status === 'running' && (
        <Card>
          <div className="text-center">
            <i className="pi pi-spin pi-cog text-4xl text-blue-600 mb-3"></i>
            <h3 className="text-xl font-semibold mb-2">Processing...</h3>
            <ProgressBar mode="indeterminate" style={{ height: '8px' }} />
          </div>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <div className="flex align-items-start gap-3">
            <i className="pi pi-exclamation-circle text-3xl text-red-600"></i>
            <div>
              <h3 className="text-lg font-semibold text-red-800 m-0 mb-2">Error Occurred</h3>
              <p className="text-red-700 m-0">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Logs Panel */}
      <Card style={{ padding: '1.5rem' }}>
        <div className="flex align-items-center justify-content-between mb-4">
          <div className="flex align-items-center gap-3">
            <i className="pi pi-list text-2xl text-blue-600"></i>
            <h2 className="text-2xl font-bold m-0 text-slate-800">Live Logs</h2>
            <Badge value={logs.length} severity="info" />
          </div>
        </div>

        <div
          className="font-mono text-sm p-4 bg-slate-900 text-white rounded-lg border border-slate-700"
          style={{ height: '450px', overflowY: 'auto' }}
        >
          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <i className="pi pi-spin pi-spinner text-2xl mb-2 block"></i>
              <p>Waiting for logs...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log, index) => {
                const { icon, color } = getLogIcon(log.level)
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex align-items-start gap-3 py-2 px-2 hover:bg-slate-800 rounded"
                  >
                    <i className={`pi ${icon} ${color} flex-shrink-0 mt-1`}></i>
                    <span className="text-gray-400 text-xs flex-shrink-0 mt-0.5" style={{ minWidth: '80px' }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`font-semibold uppercase text-xs ${color} flex-shrink-0 mt-0.5`} style={{ minWidth: '60px' }}>
                      [{log.level}]
                    </span>
                    <span className="flex-1 text-gray-200">{log.message}</span>
                  </motion.div>
                )
              })}
            </div>
          )}
          <div ref={logsEndRef} />
        </div>
      </Card>

      {/* Results Display */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card style={{ padding: '1.5rem' }}>
            <div className="flex align-items-center gap-3 mb-5">
              <i className="pi pi-check-circle text-3xl text-green-600"></i>
              <h2 className="text-2xl font-bold m-0 text-slate-800">Results</h2>
            </div>

            {isAnalysisResult(result) && (
              <div className="space-y-5">
                {result.flags.length > 0 && (
                  <div className="flex justify-content-end mb-3">
                    <Button
                      label={`Remove ${result.flags.length > 1 ? 'All Flags' : 'Flag'}`}
                      icon="pi pi-trash"
                      severity="danger"
                      outlined
                      onClick={() => {
                        if (result.flags.length === 1) {
                          handleRemoveFlag(result.flags[0].key)
                        } else {
                          // For multiple flags, just navigate to flags page
                          router.push('/flags')
                        }
                      }}
                      tooltip={result.flags.length > 1 ? 'Go to flags page to remove multiple flags' : 'Remove this flag'}
                      tooltipOptions={{ position: 'top' }}
                    />
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-blue-50 border-blue-200" style={{ padding: '1.5rem' }}>
                    <div className="text-center">
                      <i className="pi pi-flag text-4xl text-blue-600 mb-3"></i>
                      <div className="text-3xl font-bold text-blue-700 mb-1">{result.summary.total_flags}</div>
                      <div className="text-sm font-medium text-slate-600">Total Flags</div>
                    </div>
                  </Card>
                  <Card className="bg-purple-50 border-purple-200" style={{ padding: '1.5rem' }}>
                    <div className="text-center">
                      <i className="pi pi-code text-4xl text-purple-600 mb-3"></i>
                      <div className="text-3xl font-bold text-purple-700 mb-1">{result.summary.total_references}</div>
                      <div className="text-sm font-medium text-slate-600">References</div>
                    </div>
                  </Card>
                  <Card className="bg-orange-50 border-orange-200" style={{ padding: '1.5rem' }}>
                    <div className="text-center">
                      <i className="pi pi-clock text-4xl text-orange-600 mb-3"></i>
                      <div className="text-3xl font-bold text-orange-700 mb-1">{result.summary.estimated_effort_hours}h</div>
                      <div className="text-sm font-medium text-slate-600">Est. Effort</div>
                    </div>
                  </Card>
                </div>

                <Divider />

                {result.flags.map((flag, index) => (
                  <motion.div
                    key={flag.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="mb-3" style={{ padding: '1.5rem' }}>
                      <div className="flex justify-content-between align-items-start mb-3 gap-3">
                        <div className="flex align-items-center gap-2">
                          <i className="pi pi-flag text-2xl text-blue-600"></i>
                          <code className="text-lg font-bold">{flag.key}</code>
                        </div>
                        <div className="flex align-items-center gap-2">
                          <Tag
                            value={`${flag.risk_level} risk`}
                            severity={flag.risk_level === 'low' ? 'success' : flag.risk_level === 'medium' ? 'warning' : 'danger'}
                          />
                          <Button
                            label="Remove"
                            icon="pi pi-trash"
                            severity="danger"
                            size="small"
                            onClick={() => handleRemoveFlag(flag.key)}
                            tooltip="Remove this flag"
                            tooltipOptions={{ position: 'top' }}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <strong>References:</strong> {flag.reference_count} in {flag.affected_files.length} files
                        </div>
                        <div>
                          <strong>Confidence:</strong> {(flag.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div className="mb-2">
                        <strong>Recommendation:</strong> {flag.recommendation}
                      </div>
                      {flag.affected_files.length > 0 && (
                        <div>
                          <strong className="mb-2 block">Affected Files:</strong>
                          <ul className="list-disc list-inside text-sm font-mono m-0">
                            {flag.affected_files.slice(0, 5).map((file, idx) => (
                              <li key={idx} className="text-gray-700">{file}</li>
                            ))}
                            {flag.affected_files.length > 5 && (
                              <li className="text-gray-500">+ {flag.affected_files.length - 5} more...</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {isRemovalResult(result) && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Card className="bg-green-50" style={{ padding: '1.5rem' }}>
                    <div className="text-center">
                      <i className="pi pi-check text-3xl text-green-600 mb-2"></i>
                      <div className="text-3xl font-bold text-green-700">{result.summary.flags_removed}</div>
                      <div className="text-sm text-gray-600">Flags Removed</div>
                    </div>
                  </Card>
                  <Card className="bg-blue-50" style={{ padding: '1.5rem' }}>
                    <div className="text-center">
                      <i className="pi pi-file text-3xl text-blue-600 mb-2"></i>
                      <div className="text-3xl font-bold text-blue-700">{result.summary.files_modified}</div>
                      <div className="text-sm text-gray-600">Files Modified</div>
                    </div>
                  </Card>
                  <Card className={result.summary.tests_passed ? 'bg-green-50' : 'bg-red-50'} style={{ padding: '1.5rem' }}>
                    <div className="text-center">
                      <i className={`pi ${result.summary.tests_passed ? 'pi-check-circle' : 'pi-times-circle'} text-3xl ${result.summary.tests_passed ? 'text-green-600' : 'text-red-600'} mb-2`}></i>
                      <div className="text-3xl font-bold">{result.summary.tests_passed ? '✓' : '✗'}</div>
                      <div className="text-sm text-gray-600">Tests</div>
                    </div>
                  </Card>
                  <Card className={result.summary.build_passed ? 'bg-green-50' : 'bg-red-50'} style={{ padding: '1.5rem' }}>
                    <div className="text-center">
                      <i className={`pi ${result.summary.build_passed ? 'pi-check-circle' : 'pi-times-circle'} text-3xl ${result.summary.build_passed ? 'text-green-600' : 'text-red-600'} mb-2`}></i>
                      <div className="text-3xl font-bold">{result.summary.build_passed ? '✓' : '✗'}</div>
                      <div className="text-sm text-gray-600">Build</div>
                    </div>
                  </Card>
                </div>

                {result.pr_url && (
                  <Card className="bg-blue-50 border-blue-200" style={{ padding: '1.5rem' }}>
                    <div className="flex align-items-center gap-3 mb-3">
                      <i className="pi pi-github text-3xl text-blue-600"></i>
                      <div>
                        <h3 className="text-xl font-semibold m-0 mb-1">Pull Request Created</h3>
                        {result.branch && <p className="text-sm text-gray-600 m-0">Branch: <code>{result.branch}</code></p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        label="View PR"
                        icon="pi pi-external-link"
                        onClick={() => window.open(result.pr_url, '_blank')}
                      />
                      <Button
                        label="Copy Link"
                        icon="pi pi-copy"
                        outlined
                        onClick={() => copyToClipboard(result.pr_url!)}
                      />
                    </div>
                  </Card>
                )}

                {result.diff && (
                  <Card style={{ padding: '1.5rem' }}>
                    <h3 className="text-lg font-semibold mb-3 flex align-items-center gap-2 text-slate-800">
                      <i className="pi pi-code text-orange-600"></i>
                      Diff (PR Creation Failed)
                    </h3>
                    <pre className="text-xs bg-slate-900 text-white p-4 rounded overflow-x-auto border border-slate-700 max-h-96 overflow-y-auto">
                      {result.diff}
                    </pre>
                    {result.commit_message && (
                      <div className="mt-4">
                        <strong className="text-sm text-slate-800 block mb-2">Proposed Commit Message:</strong>
                        <pre className="text-xs bg-slate-100 text-slate-800 p-4 rounded overflow-x-auto border border-slate-300 mt-1">
                          {result.commit_message}
                        </pre>
                      </div>
                    )}
                  </Card>
                )}

                {result.errors && result.errors.length > 0 && (
                  <Card className="bg-yellow-50 border-yellow-200" style={{ padding: '1.5rem' }}>
                    <h3 className="text-lg font-semibold mb-2 flex align-items-center gap-2">
                      <i className="pi pi-exclamation-triangle text-yellow-600"></i>
                      Warnings
                    </h3>
                    <ul className="text-sm space-y-1 m-0">
                      {result.errors.map((err, idx) => (
                        <li key={idx} className="flex align-items-start gap-2">
                          <i className="pi pi-circle-fill text-xs text-yellow-600 mt-1"></i>
                          <span>{err}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {!result && isComplete && (
        <Card style={{ padding: '1.5rem' }} className="text-center">
          <i className="pi pi-info-circle text-5xl text-gray-400 mb-3"></i>
          <h3 className="text-xl font-semibold text-gray-600 m-0 mb-2">Job Completed</h3>
          <p className="text-gray-500 m-0">No result was returned from the job.</p>
        </Card>
      )}
    </motion.div>
  )
}
