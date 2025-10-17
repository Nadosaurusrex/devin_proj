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
    { owner: 'Nadosaurusrex', repo: 'devin_proj', icon: 'pi-star', hasTestData: true },
    { owner: 'test', repo: 'test-repo', icon: 'pi-code', hasTestData: false },
    { owner: 'facebook', repo: 'react', icon: 'pi-github', hasTestData: false }
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
            style={{ position: 'relative' }}
          >
            <Card
              className={`cursor-pointer hover:shadow-lg transition-all ${
                example.hasTestData ? 'border-2 border-blue-400' : ''
              }`}
              onClick={() => fillExample(example)}
              style={{
                background: example.hasTestData
                  ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                  : undefined,
                animation: example.hasTestData ? 'pulse-glow 2s ease-in-out infinite' : undefined
              }}
            >
              <div className="flex align-items-center justify-content-between gap-3">
                <div className="flex align-items-center gap-3">
                  <i className={`pi ${example.icon} text-2xl ${example.hasTestData ? 'text-blue-600' : 'text-purple-600'}`}></i>
                  <div>
                    <div className="font-bold">
                      {example.owner}
                    </div>
                    <div className="text-sm text-gray-600">{example.repo}</div>
                  </div>
                </div>
                {example.hasTestData && (
                  <i className="pi pi-arrow-right text-blue-600 text-xl"></i>
                )}
              </div>
            </Card>
            {example.hasTestData && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.4)',
                  zIndex: 10
                }}
              >
                ✨ Try this!
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(102, 126, 234, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(102, 126, 234, 0.5), 0 0 30px rgba(118, 75, 162, 0.3);
          }
        }
      `}</style>

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
                <i className="pi pi-code mr-2"></i>
                Branch
              </label>
              <div className="p-inputgroup">
                <span className="p-inputgroup-addon">
                  <i className="pi pi-code"></i>
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
              <small className="text-gray-500">Usually &apos;master&apos; or &apos;main&apos;</small>
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
                {owner && repo && registryPath && (
                  <Button
                    type="button"
                    icon="pi pi-external-link"
                    tooltip="View registry file on GitHub"
                    tooltipOptions={{ position: 'top' }}
                    outlined
                    onClick={() => window.open(`https://github.com/${owner}/${repo}/blob/${branch}/${registryPath}`, '_blank')}
                  />
                )}
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

      <div className="mt-6 space-y-4">
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200" style={{ padding: '1.5rem' }}>
          <div className="flex align-items-start gap-3">
            <i className="pi pi-info-circle text-purple-600 text-2xl flex-shrink-0"></i>
            <div className="flex-1">
              <strong className="text-purple-900 text-base block mb-2">Demo Information</strong>
              <div className="text-slate-700 text-sm space-y-2">
                <p className="mb-2">
                  <i className="pi pi-star-fill text-yellow-500 mr-2"></i>
                  The highlighted <strong>Nadosaurusrex/devin_proj</strong> repository contains pre-configured test data with sample feature flags, perfect for demonstrating the full workflow.
                </p>
                <p className="mb-2">
                  <i className="pi pi-shield text-green-600 mr-2"></i>
                  For demo convenience, the GitHub token is <strong>hardcoded</strong> with read-only access to this public repository. In production, you would use OAuth or secure environment variables.
                </p>
                <p className="mb-0">
                  <i className="pi pi-book text-blue-600 mr-2"></i>
                  The registry file contains a JSON structure with flag definitions (key, state, description).
                  {owner && repo && registryPath && (
                    <>
                      {' '}<a
                        href={`https://github.com/${owner}/${repo}/blob/${branch}/${registryPath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        View the registry file <i className="pi pi-external-link text-xs"></i>
                      </a>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-blue-50 border-blue-200" style={{ padding: '1.25rem' }}>
          <div className="flex align-items-start gap-3">
            <i className="pi pi-lightbulb text-yellow-600 text-2xl flex-shrink-0"></i>
            <div>
              <strong className="text-blue-900 text-base">Pro Tip:</strong>
              <p className="text-slate-700 text-sm mt-1 mb-0">
                To connect your own repository, ensure your GitHub token has <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">repo</code> scope to read the registry file.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  )
}
