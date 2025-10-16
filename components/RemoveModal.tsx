'use client'

import { useState } from 'react'
import type { Flag } from '@/types/flags'

interface RemoveModalProps {
  flag: Flag | null
  repoConfig: {
    owner: string
    repo: string
    branch: string
    registryPath: string
  }
  onClose: () => void
  onSubmit: (params: {
    flags: string[]
    targetBehavior: 'on' | 'off'
    registryFiles: string[]
    testCommand?: string
    buildCommand?: string
    workingDir?: string
  }) => void
}

export function RemoveModal({ flag, repoConfig, onClose, onSubmit }: RemoveModalProps) {
  const [targetBehavior, setTargetBehavior] = useState<'on' | 'off'>('on')
  const [registryFiles, setRegistryFiles] = useState(repoConfig.registryPath)
  const [testCommand, setTestCommand] = useState('npm test')
  const [buildCommand, setBuildCommand] = useState('npm run build')
  const [workingDir, setWorkingDir] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!flag) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const params = {
      flags: [flag.key],
      targetBehavior,
      registryFiles: registryFiles.split(',').map(f => f.trim()).filter(Boolean),
      testCommand: testCommand || undefined,
      buildCommand: buildCommand || undefined,
      workingDir: workingDir || undefined,
    }

    onSubmit(params)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">Remove Flag</h2>
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
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-sm text-red-800">
              <strong>Flag:</strong> <code className="font-mono">{flag.key}</code>
            </p>
            <p className="text-sm text-red-800 mt-1">
              <strong>Current State:</strong> {flag.state}
            </p>
            {flag.description && (
              <p className="text-sm text-red-800 mt-1">
                <strong>Description:</strong> {flag.description}
              </p>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> This will create a PR that removes the flag and inlines its behavior.
              Make sure you have reviewed the analysis results first.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Target Behavior
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="on"
                  checked={targetBehavior === 'on'}
                  onChange={() => setTargetBehavior('on')}
                  className="mr-2"
                />
                <span className="text-sm">
                  <strong>ON</strong> - Replace with enabled behavior (true)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="off"
                  checked={targetBehavior === 'off'}
                  onChange={() => setTargetBehavior('off')}
                  className="mr-2"
                />
                <span className="text-sm">
                  <strong>OFF</strong> - Replace with disabled behavior (false)
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Registry Files
            </label>
            <input
              type="text"
              value={registryFiles}
              onChange={(e) => setRegistryFiles(e.target.value)}
              placeholder="e.g., config/flags.json"
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Comma-separated paths to registry files to update
            </p>
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
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Test Command (optional)
            </label>
            <input
              type="text"
              value={testCommand}
              onChange={(e) => setTestCommand(e.target.value)}
              placeholder="e.g., npm test"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Command to run tests before creating PR
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Build Command (optional)
            </label>
            <input
              type="text"
              value={buildCommand}
              onChange={(e) => setBuildCommand(e.target.value)}
              placeholder="e.g., npm run build"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Command to build the project before creating PR
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Starting Removal...' : 'Remove Flag & Create PR'}
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
