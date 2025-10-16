'use client'

import { useState } from 'react'
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
  const [patterns, setPatterns] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!flag) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const params = {
      flags: [flag.key],
      workingDir: workingDir || undefined,
      patterns: patterns
        ? patterns.split(',').map(p => p.trim()).filter(Boolean)
        : undefined,
    }

    onSubmit(params)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">Analyze Flag</h2>
            <p className="text-gray-600 mt-1">
              Repository: <span className="font-mono">{repoConfig.owner}/{repoConfig.repo}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm text-blue-800">
              <strong>Flag:</strong> <code className="font-mono">{flag.key}</code>
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <strong>State:</strong> {flag.state}
            </p>
            {flag.description && (
              <p className="text-sm text-blue-800 mt-1">
                <strong>Description:</strong> {flag.description}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Working Directory (optional)
            </label>
            <input
              type="text"
              value={workingDir}
              onChange={(e) => setWorkingDir(e.target.value)}
              placeholder="e.g., packages/web"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Specify a subdirectory to search within
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              File Patterns (optional)
            </label>
            <input
              type="text"
              value={patterns}
              onChange={(e) => setPatterns(e.target.value)}
              placeholder="e.g., **/*.ts, **/*.tsx"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Comma-separated glob patterns (leave empty to search all files)
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Starting Analysis...' : 'Start Analysis'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
