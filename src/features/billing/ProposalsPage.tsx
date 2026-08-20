import { useState } from 'react'

import { PageShell } from '../../components/PageShell'
import { NewBillingRecordDialog } from './NewBillingRecordDialog'
import { PROPOSAL_STATUS_LABELS } from '../../types/billing'
import { BillingRecordList } from './BillingRecordList'
import { STATUS_CLASSES } from './statusClasses'
import { useProposals } from './useBilling'

export function ProposalsPage() {
  const [isCreating, setIsCreating] = useState(false)
  const { proposals, isLoading, error } = useProposals()

  return (
    <PageShell
      title="Proposals"
      description="Sent to clients for approval before work begins."
      actions={
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="bg-navy rounded-md px-4 py-2 text-sm font-semibold text-white"
        >
          New proposal
        </button>
      }
    >
      <BillingRecordList
        basePath="/proposals"
        isLoading={isLoading}
        error={error}
        emptyMessage="No proposals yet."
        records={proposals.map((proposal) => ({
          id: proposal.id,
          title: proposal.title,
          totalCents: proposal.totalCents,
          statusLabel: PROPOSAL_STATUS_LABELS[proposal.status],
          statusClass: STATUS_CLASSES[proposal.status] ?? STATUS_CLASSES.draft,
          secondary: proposal.validUntil ? `Valid until ${proposal.validUntil}` : null,
        }))}
      />

      {isCreating && (
        <NewBillingRecordDialog kind="proposal" onClose={() => setIsCreating(false)} />
      )}
    </PageShell>
  )
}
