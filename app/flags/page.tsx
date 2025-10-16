'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FlagsTable } from '@/components/FlagsTable'
import { AnalyzeModal } from '@/components/AnalyzeModal'
import { RemoveModal } from '@/components/RemoveModal'
import type { Flag, FlagsResponse, ErrorResponse } from '@/types/flags'

interface RepoConfig {
  owner: string
  repo: string
  branch: string
  registryPath: string
}

export default function FlagsPage() {
  const router = useRouter()
  const [config, setConfig] = useState<RepoConfig | null>(null)
  const [flags, setFlags] = useState<Flag[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFlag, setSelectedFlag] = useState<Flag | null>(null)
  const [showAnalyzeModal, setShowAnalyzeModal] = useState(false)
  const [showRemoveModal, setShowRemoveModal] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('repo_config')
    if (stored) {
      const parsedConfig = JSON.parse(stored)
      setConfig(parsedConfig)
      loadFlags(parsedConfig)
    }
  }, [])

  const loadFlags = async (repoConfig: RepoConfig) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        owner: repoConfig.owner,
        repo: repoConfig.repo,
        branch: repoConfig.branch,
        path: repoConfig.registryPath,
      })

      const response = await fetch(`/api/flags?${params}`)
      const data = await response.json()

      if (!response.ok) {
        const errorData = data as ErrorResponse
        throw new Error(errorData.message || 'Failed to fetch flags')
      }

      const flagsData = data as FlagsResponse
      setFlags(flagsData.flags)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load flags')
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = (flag: Flag) => {
    setSelectedFlag(flag)
    setShowAnalyzeModal(true)
  }

  const handleRemove = (flag: Flag) => {
    setSelectedFlag(flag)
    setShowRemoveModal(true)
  }

  const handleAnalyzeSubmit = async (params: {
    flags: string[]
    workingDir?: string
    patterns?: string[]
  }) => {
    if (!config) return

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: config.owner,
          repo: config.repo,
          branch: config.branch,
          ...params,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorData = data as ErrorResponse
        throw new Error(errorData.message || 'Failed to start analysis')
      }

      // Navigate to job page
      router.push(`/jobs/${data.jobId}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to start analysis')
      setShowAnalyzeModal(false)
    }
  }

  const handleRemoveSubmit = async (params: {
    flags: string[]
    targetBehavior: 'on' | 'off'
    registryFiles: string[]
    testCommand?: string
    buildCommand?: string
    workingDir?: string
  }) => {
    if (!config) return

    try {
      const response = await fetch('/api/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: config.owner,
          repo: config.repo,
          branch: config.branch,
          ...params,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorData = data as ErrorResponse
        throw new Error(errorData.message || 'Failed to start removal')
      }

      // Navigate to job page
      router.push(`/jobs/${data.jobId}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to start removal')
      setShowRemoveModal(false)
    }
  }

  if (!config) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Feature Flags</h1>
        <p className="text-gray-600">
          No repository connected. <a href="/connect" className="text-blue-500 hover:underline">Connect one now</a>.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Feature Flags</h1>
          <p className="text-gray-600 mt-2">
            Repository: <span className="font-mono">{config.owner}/{config.repo}</span>
            {' '} ({config.branch})
          </p>
        </div>
        <a
          href="/connect"
          className="text-sm text-blue-500 hover:underline"
        >
          Change Repository
        </a>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800">
            <strong>Error:</strong> {error}
          </p>
          <button
            onClick={() => loadFlags(config)}
            className="mt-2 text-sm text-red-600 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      <FlagsTable
        flags={flags}
        loading={loading}
        onAnalyze={handleAnalyze}
        onRemove={handleRemove}
      />

      {showAnalyzeModal && (
        <AnalyzeModal
          flag={selectedFlag}
          repoConfig={config}
          onClose={() => setShowAnalyzeModal(false)}
          onSubmit={handleAnalyzeSubmit}
        />
      )}

      {showRemoveModal && (
        <RemoveModal
          flag={selectedFlag}
          repoConfig={config}
          onClose={() => setShowRemoveModal(false)}
          onSubmit={handleRemoveSubmit}
        />
      )}
    </div>
  )
}
