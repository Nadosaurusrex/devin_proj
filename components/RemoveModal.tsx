'use client'

import { useState } from 'react'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { RadioButton } from 'primereact/radiobutton'
import { Chips } from 'primereact/chips'
import { Message } from 'primereact/message'
import { Divider } from 'primereact/divider'
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
    <div className="flex align-items-center gap-3">
      <i className="pi pi-trash text-3xl text-red-500"></i>
      <div>
        <h2 className="text-2xl font-bold m-0 text-red-600">Remove Flag</h2>
        <p className="text-sm text-gray-600 m-0 mt-1">
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <Message
          severity="error"
          className="w-full"
          content={
            <div className="space-y-1">
              <div>
                <strong>Flag:</strong> <code className="font-mono bg-white px-2 py-1 rounded">{flag.key}</code>
              </div>
              <div>
                <strong>Current State:</strong> <span className="capitalize">{flag.state}</span>
              </div>
              {flag.description && (
                <div>
                  <strong>Description:</strong> {flag.description}
                </div>
              )}
            </div>
          }
        />

        <Message
          severity="warn"
          className="w-full"
          content={
            <div>
              <strong>Warning:</strong> This will create a PR that removes the flag and inlines its behavior.
              Make sure you have reviewed the analysis results first.
            </div>
          }
        />

        <Divider />

        <div>
          <label className="block text-sm font-medium mb-3">
            <i className="pi pi-cog mr-2"></i>
            Target Behavior
          </label>
          <div className="flex flex-column gap-3">
            <div className="flex align-items-center">
              <RadioButton
                inputId="behavior-on"
                value="on"
                checked={targetBehavior === 'on'}
                onChange={(e) => setTargetBehavior(e.value)}
              />
              <label htmlFor="behavior-on" className="ml-2">
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
              <label htmlFor="behavior-off" className="ml-2">
                <strong className="text-gray-600">OFF</strong> - Replace with disabled behavior (false)
              </label>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="registryFiles" className="block text-sm font-medium mb-2">
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
          <small className="text-gray-500">
            Paths to registry files that need to be updated
          </small>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="workingDir" className="block text-sm font-medium mb-2">
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
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="testCommand" className="block text-sm font-medium mb-2">
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
            <small className="text-gray-500">
              Command to run tests before PR
            </small>
          </div>

          <div>
            <label htmlFor="buildCommand" className="block text-sm font-medium mb-2">
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
            <small className="text-gray-500">
              Command to build before PR
            </small>
          </div>
        </div>

        <Divider />

        <div className="flex gap-3">
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
