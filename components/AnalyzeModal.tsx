'use client'

import { useState } from 'react'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { Chips } from 'primereact/chips'
import { Message } from 'primereact/message'
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
          severity="warn"
          className="w-full"
          content={
            <div>
              <strong>Note:</strong> Analysis may take a few minutes depending on repository size.
              You&apos;ll be redirected to the job page to view progress in real-time.
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
