import { PageShell } from '../../components/PageShell'
import { INVOICE_STATUS_LABELS } from '../../types/billing'
import { BillingRecordList } from './BillingRecordList'
import { STATUS_CLASSES } from './statusClasses'
import { useInvoices } from './useBilling'

export function InvoicesPage() {
  const { invoices, isLoading, error } = useInvoices()

  return (
    <PageShell title="Invoices" description="Billing and payment status.">
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
    </PageShell>
  )
}
