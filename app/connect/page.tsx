'use client'

import { useState, useEffect } from 'react'
import { Card } from 'primereact/card'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function ConnectPage() {
  const router = useRouter()
  const [owner, setOwner] = useState('')
  const [repo, setRepo] = useState('')
  const [branch, setBranch] = useState('master')
  const [registryPath, setRegistryPath] = useState('__fixtures__/flags.json')
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    // Don't load from localStorage - always start fresh
    // This ensures users always see the correct defaults
  }, [])

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate connection delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800))

    // Store in localStorage for now (no DB in MVP)
    localStorage.setItem('repo_config', JSON.stringify({
      owner,
      repo,
      branch,
      registryPath,
    }))

    setShowSuccess(true)
    setTimeout(() => {
      router.push('/flags')
    }, 1500)
  }

  const popularRepos = [
    { owner: 'Nadosaurusrex', repo: 'devin_proj', icon: 'pi-star' },
    { owner: 'test', repo: 'test-repo', icon: 'pi-code' },
    { owner: 'facebook', repo: 'react', icon: 'pi-github' }
  ]

  const fillExample = (example: typeof popularRepos[0]) => {
    setOwner(example.owner)
    setRepo(example.repo)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-6">
        <i className="pi pi-link text-5xl text-blue-600 mb-3 block"></i>
        <h1 className="text-4xl font-bold mb-2">Connect Repository</h1>
        <p className="text-gray-600 text-lg">
          Configure your GitHub repository to analyze feature flags
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {popularRepos.map((example, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
          >
            <Card
              className="cursor-pointer hover:shadow-lg transition-all"
              onClick={() => fillExample(example)}
            >
              <div className="flex align-items-center gap-3">
                <i className={`pi ${example.icon} text-2xl text-purple-600`}></i>
                <div>
                  <div className="font-bold">{example.owner}</div>
                  <div className="text-sm text-gray-600">{example.repo}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card style={{ padding: '2rem' }}>
        {showSuccess && (
          <Message
            severity="success"
            text="Successfully connected! Redirecting to flags..."
            className="mb-4"
            style={{ width: '100%' }}
          />
        )}

        <form onSubmit={handleConnect} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="owner" className="block text-sm font-medium mb-2">
                <i className="pi pi-user mr-2"></i>
                Repository Owner
              </label>
              <div className="p-inputgroup">
                <span className="p-inputgroup-addon">
                  <i className="pi pi-github"></i>
                </span>
                <InputText
                  id="owner"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="e.g., facebook"
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label htmlFor="repo" className="block text-sm font-medium mb-2">
                <i className="pi pi-folder mr-2"></i>
                Repository Name
              </label>
              <div className="p-inputgroup">
                <span className="p-inputgroup-addon">
                  <i className="pi pi-code"></i>
                </span>
                <InputText
                  id="repo"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  placeholder="e.g., react"
                  required
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="branch" className="block text-sm font-medium mb-2">
                <i className="pi pi-code-branch mr-2"></i>
                Branch
              </label>
              <div className="p-inputgroup">
                <span className="p-inputgroup-addon">
                  <i className="pi pi-git-branch"></i>
                </span>
                <InputText
                  id="branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g., master or main"
                  required
                  className="w-full"
                />
              </div>
              <small className="text-gray-500">Usually 'master' or 'main'</small>
            </div>

            <div>
              <label htmlFor="registryPath" className="block text-sm font-medium mb-2">
                <i className="pi pi-file mr-2"></i>
                Registry Path
              </label>
              <div className="p-inputgroup">
                <span className="p-inputgroup-addon">
                  <i className="pi pi-file-edit"></i>
                </span>
                <InputText
                  id="registryPath"
                  value={registryPath}
                  onChange={(e) => setRegistryPath(e.target.value)}
                  placeholder="e.g., __fixtures__/flags.json"
                  required
                  className="w-full"
                />
              </div>
              <small className="text-gray-500">Path to your flags registry file</small>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="submit"
              label={loading ? 'Connecting...' : 'Connect Repository'}
              icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
              loading={loading}
              className="flex-1"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
            />
            <Button
              type="button"
              label="Reset"
              icon="pi pi-refresh"
              outlined
              onClick={() => {
                setOwner('')
                setRepo('')
                setBranch('master')
                setRegistryPath('__fixtures__/flags.json')
              }}
            />
          </div>
        </form>
      </Card>

      <div className="mt-6">
        <Card className="bg-blue-50 border-blue-200" style={{ padding: '1.25rem' }}>
          <div className="flex align-items-start gap-3">
            <i className="pi pi-info-circle text-blue-600 text-2xl flex-shrink-0"></i>
            <div>
              <strong className="text-blue-900 text-base">Pro Tip:</strong>
              <p className="text-slate-700 text-sm mt-1 mb-0">
                Make sure your GitHub token has <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">repo</code> scope to read the registry file.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  )
}
