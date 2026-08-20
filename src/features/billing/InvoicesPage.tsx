import { useState } from 'react'

import { PageShell } from '../../components/PageShell'
import { NewBillingRecordDialog } from './NewBillingRecordDialog'
import { INVOICE_STATUS_LABELS } from '../../types/billing'
import { BillingRecordList } from './BillingRecordList'
import { STATUS_CLASSES } from './statusClasses'
import { useInvoices } from './useBilling'

export function InvoicesPage() {
  const [isCreating, setIsCreating] = useState(false)
  const { invoices, isLoading, error } = useInvoices()

  return (
    <PageShell
      title="Invoices"
      description="Billing and payment status."
      actions={
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="bg-navy rounded-md px-4 py-2 text-sm font-semibold text-white"
        >
          New invoice
        </button>
      }
    >
      <BillingRecordList
        basePath="/invoices"
        isLoading={isLoading}
        error={error}
        emptyMessage="No invoices yet."
        records={invoices.map((invoice) => ({
          id: invoice.id,
          title: invoice.title,
          totalCents: invoice.totalCents,
          statusLabel: INVOICE_STATUS_LABELS[invoice.status],
          statusClass: STATUS_CLASSES[invoice.status] ?? STATUS_CLASSES.draft,
          secondary: invoice.dueDate ? `Due ${invoice.dueDate}` : null,
        }))}
      />

      {isCreating && (
        <NewBillingRecordDialog kind="invoice" onClose={() => setIsCreating(false)} />
      )}
    </PageShell>
  )
}
