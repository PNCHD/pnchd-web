import { Link } from 'react-router-dom'

import { EmptyState } from '../../components/EmptyState'
import { formatCents } from '../../lib/money'

export interface BillingRecordRow {
  id: string
  title: string
  totalCents: number
  statusLabel: string
  statusClass: string
  secondary?: string | null
}

/**
 * Shared list body for proposals and invoices — the two differ only in status
 * vocabulary and route, so this stays one component rather than two nearly
 * identical ones.
 */
export function BillingRecordList({
  records,
  basePath,
  isLoading,
  error,
  emptyMessage,
}: {
  records: BillingRecordRow[]
  basePath: string
  isLoading: boolean
  error: Error | null
  emptyMessage: string
}) {
  if (error) return <EmptyState message={`Could not load. ${error.message}`} />
  if (isLoading) return <EmptyState message="Loading…" />
  if (records.length === 0) return <EmptyState message={emptyMessage} />

  return (
    <ul className="divide-navy/10 border-navy/10 divide-y overflow-hidden rounded-lg border bg-white">
      {records.map((record) => (
        <li key={record.id}>
          <Link
            to={`${basePath}/${record.id}`}
            className="hover:bg-app-bg flex flex-wrap items-center justify-between gap-3 px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-navy truncate font-medium">{record.title}</p>
              {record.secondary && (
                <p className="text-navy/50 truncate text-sm">{record.secondary}</p>
              )}
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${record.statusClass}`}
            >
              {record.statusLabel}
            </span>
            <span className="text-navy w-24 text-right font-medium tabular-nums">
              {formatCents(record.totalCents)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
