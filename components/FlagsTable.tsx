'use client'

import type { Flag } from '@/types/flags'

interface FlagsTableProps {
  flags: Flag[]
  loading?: boolean
  onAnalyze: (flag: Flag) => void
  onRemove: (flag: Flag) => void
}

export function FlagsTable({ flags, loading, onAnalyze, onRemove }: FlagsTableProps) {
  if (loading) {
    return (
      <div className="border rounded overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Key</th>
              <th className="text-left p-3">State</th>
              <th className="text-left p-3">Description</th>
              <th className="text-left p-3">Last Modified</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="text-center p-8 text-gray-500">
                Loading flags...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  if (flags.length === 0) {
    return (
      <div className="border rounded overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Key</th>
              <th className="text-left p-3">State</th>
              <th className="text-left p-3">Description</th>
              <th className="text-left p-3">Last Modified</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="text-center p-8 text-gray-500">
                No flags found in registry
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="border rounded overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-3">Key</th>
            <th className="text-left p-3">State</th>
            <th className="text-left p-3">Description</th>
            <th className="text-left p-3">Last Modified</th>
            <th className="text-left p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {flags.map((flag, index) => (
            <tr key={flag.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="p-3">
                <code className="text-sm">{flag.key}</code>
              </td>
              <td className="p-3">
                <span
                  className={`inline-block px-2 py-1 text-xs rounded ${
                    flag.state === 'enabled'
                      ? 'bg-green-100 text-green-800'
                      : flag.state === 'disabled'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {flag.state}
                </span>
              </td>
              <td className="p-3 text-sm text-gray-700">
                {flag.description || '-'}
              </td>
              <td className="p-3 text-sm text-gray-600">
                {flag.lastModified
                  ? new Date(flag.lastModified).toLocaleDateString()
                  : '-'}
              </td>
              <td className="p-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => onAnalyze(flag)}
                    className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Analyze
                  </button>
                  <button
                    onClick={() => onRemove(flag)}
                    className="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
