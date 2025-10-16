'use client'

import { useParams } from 'next/navigation'

export default function JobPage() {
  const params = useParams()
  const jobId = params.id

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Job Details</h1>
      <p className="text-gray-600">
        Job ID: <span className="font-mono">{jobId}</span>
      </p>

      <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
        <p className="text-yellow-800">
          This is a placeholder. Job streaming and logs will be implemented next.
        </p>
      </div>

      <div className="border rounded p-4 bg-gray-50">
        <h2 className="font-semibold mb-2">Job Logs</h2>
        <div className="font-mono text-sm space-y-1">
          <div className="text-gray-500">[Placeholder] Job logs will stream here...</div>
        </div>
      </div>

      <div className="border rounded p-4">
        <h2 className="font-semibold mb-2">Result</h2>
        <p className="text-gray-500">Waiting for job to complete...</p>
      </div>
    </div>
  )
}
