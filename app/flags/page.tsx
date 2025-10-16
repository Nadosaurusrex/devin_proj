'use client'

import { useEffect, useState } from 'react'

interface RepoConfig {
  owner: string
  repo: string
  branch: string
  registryPath: string
}

export default function FlagsPage() {
  const [config, setConfig] = useState<RepoConfig | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('repo_config')
    if (stored) {
      setConfig(JSON.parse(stored))
    }
  }, [])

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
      <div>
        <h1 className="text-3xl font-bold">Feature Flags</h1>
        <p className="text-gray-600 mt-2">
          Repository: <span className="font-mono">{config.owner}/{config.repo}</span>
          {' '} ({config.branch})
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
        <p className="text-yellow-800">
          This is a placeholder. The flags table and API integration will be implemented next.
        </p>
      </div>

      <div className="border rounded overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Key</th>
              <th className="text-left p-3">State</th>
              <th className="text-left p-3">Description</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="text-center p-8 text-gray-500">
                No flags loaded yet. API integration coming soon.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
