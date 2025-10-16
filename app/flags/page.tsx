'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from 'primereact/card'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import { Toast } from 'primereact/toast'
import { motion } from 'framer-motion'
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
  const toast = useRef<Toast>(null)
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
        registryPath: repoConfig.registryPath,
      })

      const response = await fetch(`/api/flags?${params}`)
      const data = await response.json()

      if (!response.ok) {
        const errorData = data as ErrorResponse
        throw new Error(errorData.message || 'Failed to fetch flags')
      }

      const flagsData = data as FlagsResponse
      setFlags(flagsData.flags)

      if (flagsData.flags.length > 0) {
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: `Loaded ${flagsData.flags.length} feature flags`,
          life: 3000
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load flags')
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err instanceof Error ? err.message : 'Failed to load flags',
        life: 5000
      })
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

      toast.current?.show({
        severity: 'success',
        summary: 'Analysis Started',
        detail: 'Redirecting to job page...',
        life: 2000
      })

      setTimeout(() => {
        router.push(`/jobs/${data.jobId}`)
      }, 500)
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err instanceof Error ? err.message : 'Failed to start analysis',
        life: 5000
      })
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

      toast.current?.show({
        severity: 'success',
        summary: 'Removal Started',
        detail: 'Redirecting to job page...',
        life: 2000
      })

      setTimeout(() => {
        router.push(`/jobs/${data.jobId}`)
      }, 500)
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err instanceof Error ? err.message : 'Failed to start removal',
        life: 5000
      })
      setShowRemoveModal(false)
    }
  }

  if (!config) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <Card>
          <i className="pi pi-inbox text-6xl text-gray-400 mb-4"></i>
          <h1 className="text-3xl font-bold mb-2">No Repository Connected</h1>
          <p className="text-gray-600 mb-6">
            Connect to a GitHub repository to view and manage feature flags
          </p>
          <Button
            label="Connect Repository"
            icon="pi pi-link"
            onClick={() => router.push('/connect')}
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
          />
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Toast ref={toast} />

      <div className="flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <div className="flex align-items-center gap-2 mb-2">
            <i className="pi pi-flag text-3xl text-blue-600"></i>
            <h1 className="text-4xl font-bold m-0">Feature Flags</h1>
          </div>
          <p className="text-gray-600 flex align-items-center gap-2">
            <i className="pi pi-github"></i>
            <span className="font-mono font-semibold">{config.owner}/{config.repo}</span>
            <span className="text-gray-400">|</span>
            <i className="pi pi-code-branch"></i>
            <span>{config.branch}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            label="Refresh"
            icon="pi pi-refresh"
            outlined
            onClick={() => loadFlags(config)}
            loading={loading}
          />
          <Button
            label="Change Repo"
            icon="pi pi-pencil"
            outlined
            onClick={() => router.push('/connect')}
          />
        </div>
      </div>

      {error && (
        <Message
          severity="error"
          className="w-full mb-4"
          content={
            <div className="flex align-items-center justify-content-between w-full">
              <div>
                <strong>Error:</strong> {error}
              </div>
              <Button
                label="Retry"
                icon="pi pi-refresh"
                text
                size="small"
                onClick={() => loadFlags(config)}
              />
            </div>
          }
        />
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
    </motion.div>
  )
}
