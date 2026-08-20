import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { EmptyState } from '../../components/EmptyState'
import { PageShell } from '../../components/PageShell'
import {
  isProposalEditable,
  PROPOSAL_STATUS_LABELS,
} from '../../types/billing'
import { STATUS_CLASSES } from './statusClasses'
import { LineItemEditor } from './LineItemEditor'
import {
  computeTotals,
  newDraftRow,
  toDraftRows,
  toPersistable,
  validateDraft,
  type LineItemDraftRow,
} from './lineItemDrafts'
import {
  useLineItems,
  useProposal,
  useSaveLineItems,
  useUpdateProposalStatus,
} from './useBilling'

export function ProposalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { proposal, isLoading } = useProposal(id)
  const { lineItems, isLoading: itemsLoading } = useLineItems('proposal', id)
  const saveItems = useSaveLineItems('proposal', id)
  const updateStatus = useUpdateProposalStatus()

  const [rows, setRows] = useState<LineItemDraftRow[]>([])
  const [invalidKeys, setInvalidKeys] = useState<string[]>([])
  const [message, setMessage] = useState<string | null>(null)

  // Seed the editor once the saved items arrive. Keyed on the fetched items so
  // a refetch after save re-syncs rather than leaving stale local state.
  useEffect(() => {
    if (!itemsLoading) {
      setRows(lineItems.length > 0 ? toDraftRows(lineItems) : [newDraftRow()])
    }
  }, [itemsLoading, lineItems])

  if (isLoading) {
    return (
      <PageShell title="Proposal">
        <EmptyState message="Loading…" />
      </PageShell>
    )
  }

  if (!proposal) {
    return (
      <PageShell title="Proposal">
        <EmptyState message="This proposal doesn't exist, or you don't have access to it.">
          <Link to="/proposals" className="text-brand-red mt-3 inline-block text-sm font-semibold">
            Back to proposals
          </Link>
        </EmptyState>
      </PageShell>
    )
  }

  const editable = isProposalEditable(proposal.status)

  async function handleSave() {
    const validation = validateDraft(rows)
    setInvalidKeys(validation.invalidKeys)
    setMessage(validation.message)
    if (!validation.valid || !proposal) return

    const totals = computeTotals(rows, proposal.taxRatePercent)
    try {
      await saveItems.mutateAsync({
        items: toPersistable(rows),
        subtotalCents: totals.subtotalCents,
        taxCents: proposal.taxRatePercent ? totals.taxCents : null,
        totalCents: totals.totalCents,
      })
      setMessage('Saved.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save.')
    }
  }

  return (
    <PageShell
      title={proposal.title}
      actions={
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            STATUS_CLASSES[proposal.status] ?? STATUS_CLASSES.draft
          }`}
        >
          {PROPOSAL_STATUS_LABELS[proposal.status]}
        </span>
      }
    >
      <div className="border-navy/10 rounded-lg border bg-white p-5">
        <LineItemEditor
          rows={rows}
          onChange={setRows}
          taxRatePercent={proposal.taxRatePercent}
          invalidKeys={invalidKeys}
          readOnly={!editable}
        />

        {message && (
          <p role="status" className="text-navy/70 mt-3 text-sm">
            {message}
          </p>
        )}

        {editable ? (
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saveItems.isPending}
              className="bg-navy rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saveItems.isPending ? 'Saving…' : 'Save line items'}
            </button>
            <button
              type="button"
              onClick={() =>
                proposal && updateStatus.mutate({ id: proposal.id, status: 'sent' })
              }
              disabled={updateStatus.isPending || proposal.totalCents === 0}
              title={
                proposal.totalCents === 0
                  ? 'Save line items before sending'
                  : undefined
              }
              className="border-navy/20 text-navy rounded-md border px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              Send to client
            </button>
          </div>
        ) : (
          // Amounts are frozen once the client can see them; changing them
          // underneath a client mid-review is how billing disputes start.
          <p className="text-navy/50 mt-5 text-sm">
            This proposal has been sent and can no longer be edited.
          </p>
        )}
      </div>
    </PageShell>
  )
}
