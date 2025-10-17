'use client'

import { useState } from 'react'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { RadioButton } from 'primereact/radiobutton'
import { Chips } from 'primereact/chips'
import { Message } from 'primereact/message'
import { Divider } from 'primereact/divider'
import { Card } from 'primereact/card'
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
  const [registryFiles, setRegistryFiles] = useState<string[]>([repoConfig.registryPath])
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
      registryFiles: registryFiles.filter(Boolean),
      testCommand: testCommand || undefined,
      buildCommand: buildCommand || undefined,
      workingDir: workingDir || undefined,
    }

    onSubmit(params)
  }

  const header = (
    <div className="flex align-items-center gap-3 p-3">
      <i className="pi pi-trash text-3xl text-red-500"></i>
      <div>
        <h2 className="text-2xl font-bold m-0 text-red-600">Remove Flag</h2>
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
      style={{ width: '700px', maxHeight: '90vh' }}
      modal
      draggable={false}
      dismissableMask={!submitting}
      closable={!submitting}
      blockScroll
    >
      <div className="p-5 pb-0">
        <Card className="bg-gradient-to-r from-red-50 to-orange-50 mb-4" style={{ padding: '1rem' }}>
          <div className="flex align-items-start gap-3">
            <i className="pi pi-cog text-red-600 text-xl"></i>
            <div className="flex-1 text-sm">
              <strong className="block mb-2">Behind the Scenes:</strong>
              <p className="text-slate-700 mb-2">
                <strong>Devin AI</strong> will autonomously scan your codebase, remove all flag references,
                inline the target behavior, update registry files, run tests/builds, and create a PR with a detailed summary.
              </p>
              <details className="cursor-pointer">
                <summary className="text-red-600 hover:text-red-800 font-semibold select-none">
                  View the instructions sent to Devin <i className="pi pi-angle-down text-xs ml-1"></i>
                </summary>
                <pre className="text-xs bg-slate-800 text-white p-3 rounded mt-2 overflow-x-auto max-h-64 overflow-y-auto">
{`You are removing deprecated feature flags safely.

Repository: ${repoConfig.owner}/${repoConfig.repo}
Branch: ${repoConfig.branch}
Flags to remove: [${flag?.key}]
Target Behavior: Replace with "${flag?.state === 'enabled' ? 'on' : 'off'}"
Registry Files: [${repoConfig.registryPath}]

Steps:
1. Scan codebase for all flag references
2. Inline target behavior (true/false)
3. Remove flags from registry files
4. Update tests referencing these flags
5. Run linter, tests, and build
6. Create branch and commit changes
7. Push to GitHub using GITHUB_TOKEN
8. Open Pull Request with summary

Output as structured JSON with pr_url.
DO NOT leak GITHUB_TOKEN in logs.`}
                </pre>
              </details>
            </div>
          </div>
        </Card>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-5">
        <Message
          severity="error"
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

        <Message
          severity="info"
          className="w-full"
          content={
            <div className="space-y-2">
              <div>
                <strong>What happens during removal:</strong>
              </div>
              <ul className="text-sm mt-2 mb-0 pl-4 space-y-1">
                <li><i className="pi pi-search text-blue-600 mr-2"></i>Finds all flag references in the codebase</li>
                <li><i className="pi pi-code text-purple-600 mr-2"></i>Inlines target behavior (replaces checks with true/false)</li>
                <li><i className="pi pi-trash text-red-600 mr-2"></i>Updates registry files to remove flag definitions</li>
                <li><i className="pi pi-check-square text-green-600 mr-2"></i>Runs tests and builds to ensure nothing breaks</li>
                <li><i className="pi pi-github text-slate-700 mr-2"></i>Creates a PR with detailed change summary</li>
              </ul>
            </div>
          }
        />

        <Message
          severity="warn"
          className="w-full"
          content={
            <div>
              <strong>Important:</strong> This will create a PR that removes the flag and inlines its behavior.
              Review the analysis results first. Typical completion time: 3-7 minutes.
            </div>
          }
        />

        <Divider />

        <div>
          <label className="block text-sm font-medium mb-4">
            <i className="pi pi-cog mr-2"></i>
            Target Behavior
          </label>
          <div className="flex flex-column gap-3 p-4 bg-gray-50 border-round">
            <div className="flex align-items-center">
              <RadioButton
                inputId="behavior-on"
                value="on"
                checked={targetBehavior === 'on'}
                onChange={(e) => setTargetBehavior(e.value)}
              />
              <label htmlFor="behavior-on" className="ml-3 cursor-pointer">
                <strong className="text-green-600">ON</strong> - Replace with enabled behavior (true)
              </label>
            </div>
            <div className="flex align-items-center">
              <RadioButton
                inputId="behavior-off"
                value="off"
                checked={targetBehavior === 'off'}
                onChange={(e) => setTargetBehavior(e.value)}
              />
              <label htmlFor="behavior-off" className="ml-3 cursor-pointer">
                <strong className="text-gray-600">OFF</strong> - Replace with disabled behavior (false)
              </label>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="registryFiles" className="block text-sm font-medium mb-3">
            <i className="pi pi-file mr-2"></i>
            Registry Files
          </label>
          <Chips
            id="registryFiles"
            value={registryFiles}
            onChange={(e) => setRegistryFiles(e.value || [])}
            placeholder="e.g., __fixtures__/flags.json"
            className="w-full"
          />
          <small className="text-gray-500 block mt-2">
            Paths to registry files that need to be updated
          </small>
        </div>

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
            Subdirectory to search for flag references
          </small>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="testCommand" className="block text-sm font-medium mb-3">
              <i className="pi pi-check-square mr-2"></i>
              Test Command (Optional)
            </label>
            <InputText
              id="testCommand"
              value={testCommand}
              onChange={(e) => setTestCommand(e.target.value)}
              placeholder="e.g., npm test"
              className="w-full"
            />
            <small className="text-gray-500 block mt-2">
              Command to run tests before PR
            </small>
          </div>

          <div>
            <label htmlFor="buildCommand" className="block text-sm font-medium mb-3">
              <i className="pi pi-wrench mr-2"></i>
              Build Command (Optional)
            </label>
            <InputText
              id="buildCommand"
              value={buildCommand}
              onChange={(e) => setBuildCommand(e.target.value)}
              placeholder="e.g., npm run build"
              className="w-full"
            />
            <small className="text-gray-500 block mt-2">
              Command to build before PR
            </small>
          </div>
        </div>

        <Divider />

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            label={submitting ? 'Starting Removal...' : 'Remove Flag & Create PR'}
            icon={submitting ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
            loading={submitting}
            severity="danger"
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
