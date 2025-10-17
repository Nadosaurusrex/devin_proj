'use client'

import { useState } from 'react'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { Chips } from 'primereact/chips'
import { Message } from 'primereact/message'
import { Card } from 'primereact/card'
import type { Flag } from '@/types/flags'

interface AnalyzeModalProps {
  flag: Flag | null
  repoConfig: {
    owner: string
    repo: string
    branch: string
  }
  onClose: () => void
  onSubmit: (params: {
    flags: string[]
    workingDir?: string
    patterns?: string[]
  }) => void
}

export function AnalyzeModal({ flag, repoConfig, onClose, onSubmit }: AnalyzeModalProps) {
  const [workingDir, setWorkingDir] = useState('')
  const [patterns, setPatterns] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  if (!flag) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const params = {
      flags: [flag.key],
      workingDir: workingDir || undefined,
      patterns: patterns.length > 0 ? patterns : undefined,
    }

    onSubmit(params)
  }

  const header = (
    <div className="flex align-items-center gap-3 p-3">
      <i className="pi pi-search text-3xl"></i>
      <div>
        <h2 className="text-2xl font-bold m-0">Analyze Flag</h2>
        <p className="text-sm text-gray-600 m-0 mt-2">
          <i className="pi pi-github mr-1"></i>
          {repoConfig.owner}/{repoConfig.repo}
        </p>
      </div>
    </div>
  )

  return (
    <Dialog
      visible={!!flag}
      onHide={onClose}
      header={header}
      style={{ width: '600px' }}
      modal
      draggable={false}
      dismissableMask={!submitting}
      closable={!submitting}
      blockScroll
    >
      <div className="p-5 pb-0">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 mb-4" style={{ padding: '1rem' }}>
          <div className="flex align-items-start gap-3">
            <i className="pi pi-bolt text-blue-600 text-xl"></i>
            <div className="flex-1 text-sm">
              <strong className="block mb-2">Behind the Scenes:</strong>
              <p className="text-slate-700 mb-2">
                When you start analysis, we send detailed instructions to <strong>Devin AI</strong> including the flag name,
                repository info, and search patterns. Devin autonomously explores your codebase and reports findings.
              </p>
              <details className="cursor-pointer">
                <summary className="text-blue-600 hover:text-blue-800 font-semibold select-none">
                  View the prompt sent to Devin <i className="pi pi-angle-down text-xs ml-1"></i>
                </summary>
                <pre className="text-xs bg-slate-800 text-white p-3 rounded mt-2 overflow-x-auto max-h-64 overflow-y-auto">
{`You are analyzing feature flags in a codebase.

Repository: ${repoConfig.owner}/${repoConfig.repo}
Branch: ${repoConfig.branch}
Flags to analyze: [${flag?.key}]

For each flag, provide:
1. All references (file paths, line numbers, context)
2. Count of total references
3. List of affected files
4. Risk assessment (low/medium/high)
5. Confidence score (0-1)
6. Recommendation for removal

Output as structured JSON with flags array.
DO NOT make any changes - analyze only.`}
                </pre>
              </details>
            </div>
          </div>
        </Card>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-5">
        <Message
          severity="info"
          className="w-full"
          content={
            <div className="space-y-2">
              <div className="flex flex-column gap-1">
                <strong>Flag:</strong> <code className="font-mono bg-white px-2 py-1 rounded mt-1">{flag.key}</code>
              </div>
              <div>
                <strong>Current State:</strong> <span className="capitalize ml-2">{flag.state}</span>
              </div>
              {flag.description && (
                <div className="flex flex-column gap-1">
                  <strong>Description:</strong>
                  <span className="mt-1">{flag.description}</span>
                </div>
              )}
            </div>
          }
        />

        <div>
          <label htmlFor="workingDir" className="block text-sm font-medium mb-3">
            <i className="pi pi-folder mr-2"></i>
            Working Directory (Optional)
          </label>
          <InputText
            id="workingDir"
            value={workingDir}
            onChange={(e) => setWorkingDir(e.target.value)}
            placeholder="e.g., packages/web"
            className="w-full"
          />
          <small className="text-gray-500 block mt-2">
            Specify a subdirectory to narrow the search scope
          </small>
        </div>

        <div>
          <label htmlFor="patterns" className="block text-sm font-medium mb-3">
            <i className="pi pi-filter mr-2"></i>
            File Patterns (Optional)
          </label>
          <Chips
            id="patterns"
            value={patterns}
            onChange={(e) => setPatterns(e.value || [])}
            placeholder="Add pattern (e.g., **/*.ts) and press Enter"
            className="w-full"
          />
          <small className="text-gray-500 block mt-2">
            Glob patterns to filter files. Press Enter after each pattern.
          </small>
        </div>

        <Message
          severity="info"
          className="w-full"
          content={
            <div className="space-y-2">
              <div>
                <strong>What happens during analysis:</strong>
              </div>
              <ul className="text-sm mt-2 mb-0 pl-4 space-y-1">
                <li><i className="pi pi-search text-blue-600 mr-2"></i>Devin scans your entire codebase for flag references</li>
                <li><i className="pi pi-file text-purple-600 mr-2"></i>Identifies affected files with line numbers and context</li>
                <li><i className="pi pi-chart-bar text-orange-600 mr-2"></i>Calculates risk levels and confidence scores</li>
                <li><i className="pi pi-check text-green-600 mr-2"></i>Provides removal recommendations</li>
              </ul>
            </div>
          }
        />

        <Message
          severity="warn"
          className="w-full"
          content={
            <div>
              <strong>Timeline:</strong> Analysis typically takes 2-5 minutes depending on repository size.
              You&apos;ll be redirected to watch real-time progress and view Devin&apos;s live output.
            </div>
          }
        />

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            label={submitting ? 'Starting Analysis...' : 'Start Analysis'}
            icon={submitting ? 'pi pi-spin pi-spinner' : 'pi pi-play'}
            loading={submitting}
            className="flex-1"
          />
          <Button
            type="button"
            label="Cancel"
            icon="pi pi-times"
            outlined
            onClick={onClose}
            disabled={submitting}
          />
        </div>
      </form>
    </Dialog>
  )
}
