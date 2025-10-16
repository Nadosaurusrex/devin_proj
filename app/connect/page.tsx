'use client'

import { useState } from 'react'

export default function ConnectPage() {
  const [owner, setOwner] = useState('')
  const [repo, setRepo] = useState('')
  const [branch, setBranch] = useState('main')
  const [registryPath, setRegistryPath] = useState('config/flags.json')

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault()
    // Store in localStorage for now (no DB in MVP)
    localStorage.setItem('repo_config', JSON.stringify({
      owner,
      repo,
      branch,
      registryPath,
    }))
    window.location.href = '/flags'
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-3xl font-bold">Connect Repository</h1>
      <p className="text-gray-600">
        Configure your GitHub repository to analyze feature flags.
      </p>

      <form onSubmit={handleConnect} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Repository Owner
          </label>
          <input
            type="text"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="e.g., facebook"
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Repository Name
          </label>
          <input
            type="text"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder="e.g., react"
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Branch
          </label>
          <input
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="e.g., main"
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Registry Path
          </label>
          <input
            type="text"
            value={registryPath}
            onChange={(e) => setRegistryPath(e.target.value)}
            placeholder="e.g., config/flags.json"
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Connect
        </button>
      </form>
    </div>
  )
}
