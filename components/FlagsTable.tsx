'use client'

import { useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Tag } from 'primereact/tag'
import { InputText } from 'primereact/inputtext'
import { ProgressSpinner } from 'primereact/progressspinner'
import type { Flag } from '@/types/flags'

interface FlagsTableProps {
  flags: Flag[]
  loading?: boolean
  onAnalyze: (flag: Flag) => void
  onRemove: (flag: Flag) => void
}

export function FlagsTable({ flags, loading, onAnalyze, onRemove }: FlagsTableProps) {
  const [globalFilter, setGlobalFilter] = useState('')

  if (loading) {
    return (
      <div className="flex flex-column align-items-center justify-content-center p-8">
        <ProgressSpinner style={{ width: '50px', height: '50px' }} />
        <p className="mt-3 text-gray-600">Loading flags...</p>
      </div>
    )
  }

  if (flags.length === 0) {
    return (
      <div className="text-center p-8 border-round bg-gray-50">
        <i className="pi pi-inbox text-6xl text-gray-400 mb-3"></i>
        <p className="text-xl text-gray-600 font-semibold">No flags found</p>
        <p className="text-gray-500">Check your registry path and try again</p>
      </div>
    )
  }

  const keyBodyTemplate = (flag: Flag) => {
    return (
      <div className="flex align-items-center gap-2">
        <i className="pi pi-flag text-blue-600"></i>
        <code className="font-semibold">{flag.key}</code>
      </div>
    )
  }

  const stateBodyTemplate = (flag: Flag) => {
    const getSeverity = (state: string) => {
      switch (state) {
        case 'enabled':
          return 'success'
        case 'disabled':
          return 'secondary'
        default:
          return 'warning'
      }
    }

    return (
      <Tag
        value={flag.state}
        severity={getSeverity(flag.state)}
        icon={flag.state === 'enabled' ? 'pi pi-check-circle' : 'pi pi-times-circle'}
      />
    )
  }

  const descriptionBodyTemplate = (flag: Flag) => {
    return (
      <div className="text-gray-700">
        {flag.description || <span className="text-gray-400 italic">No description</span>}
      </div>
    )
  }

  const dateBodyTemplate = (flag: Flag) => {
    if (!flag.lastModified) {
      return <span className="text-gray-400">-</span>
    }

    const date = new Date(flag.lastModified)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    let dateDisplay = date.toLocaleDateString()
    let timeAgo = ''

    if (diffDays === 0) {
      timeAgo = 'Today'
    } else if (diffDays === 1) {
      timeAgo = 'Yesterday'
    } else if (diffDays < 30) {
      timeAgo = `${diffDays} days ago`
    } else if (diffDays < 365) {
      timeAgo = `${Math.floor(diffDays / 30)} months ago`
    } else {
      timeAgo = `${Math.floor(diffDays / 365)} years ago`
    }

    return (
      <div>
        <div className="text-gray-700">{dateDisplay}</div>
        <div className="text-xs text-gray-500">{timeAgo}</div>
      </div>
    )
  }

  const actionsBodyTemplate = (flag: Flag) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-search"
          label="Analyze"
          size="small"
          onClick={() => onAnalyze(flag)}
          className="p-button-info"
          tooltip="Analyze flag usage"
          tooltipOptions={{ position: 'top' }}
        />
        <Button
          icon="pi pi-trash"
          label="Remove"
          size="small"
          severity="danger"
          onClick={() => onRemove(flag)}
          tooltip="Remove flag and create PR"
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    )
  }

  const header = (
    <div className="flex flex-wrap align-items-center justify-content-between gap-3">
      <div className="flex align-items-center gap-2">
        <i className="pi pi-list text-2xl text-blue-600"></i>
        <span className="text-2xl font-bold">Feature Flags</span>
        <Tag value={`${flags.length} total`} severity="info" />
      </div>
      <div className="p-inputgroup" style={{ maxWidth: '300px' }}>
        <span className="p-inputgroup-addon">
          <i className="pi pi-search"></i>
        </span>
        <InputText
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search flags..."
        />
      </div>
    </div>
  )

  return (
    <div className="card">
      <DataTable
        value={flags}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        globalFilter={globalFilter}
        header={header}
        emptyMessage="No flags match your search"
        className="p-datatable-sm"
        stripedRows
        showGridlines
        responsiveLayout="scroll"
        size="normal"
      >
        <Column
          field="key"
          header="Flag Key"
          body={keyBodyTemplate}
          sortable
          style={{ minWidth: '200px' }}
        />
        <Column
          field="state"
          header="State"
          body={stateBodyTemplate}
          sortable
          style={{ width: '150px' }}
        />
        <Column
          field="description"
          header="Description"
          body={descriptionBodyTemplate}
          style={{ minWidth: '250px' }}
        />
        <Column
          field="lastModified"
          header="Last Modified"
          body={dateBodyTemplate}
          sortable
          style={{ width: '180px' }}
        />
        <Column
          header="Actions"
          body={actionsBodyTemplate}
          exportable={false}
          style={{ width: '250px' }}
        />
      </DataTable>
    </div>
  )
}
