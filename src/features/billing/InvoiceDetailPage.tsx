import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { EmptyState } from '../../components/EmptyState'
import { PageShell } from '../../components/PageShell'
import { formatCents } from '../../lib/money'
import { INVOICE_STATUS_LABELS, isInvoiceEditable } from '../../types/billing'
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
  useInvoice,
  useLineItems,
  useSaveLineItems,
  useUpdateInvoiceStatus,
} from './useBilling'

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { invoice, isLoading } = useInvoice(id)
  const { lineItems, isLoading: itemsLoading } = useLineItems('invoice', id)
  const saveItems = useSaveLineItems('invoice', id)
  const updateStatus = useUpdateInvoiceStatus()

  const [rows, setRows] = useState<LineItemDraftRow[]>([])
  const [invalidKeys, setInvalidKeys] = useState<string[]>([])
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!itemsLoading) {
      setRows(lineItems.length > 0 ? toDraftRows(lineItems) : [newDraftRow()])
    }
  }, [itemsLoading, lineItems])

  if (isLoading) {
    return (
      <PageShell title="Invoice">
        <EmptyState message="Loading…" />
      </PageShell>
    )
  }

  if (!invoice) {
    return (
      <PageShell title="Invoice">
        <EmptyState message="This invoice doesn't exist, or you don't have access to it.">
          <Link to="/invoices" className="text-brand-red mt-3 inline-block text-sm font-semibold">
            Back to invoices
          </Link>
        </EmptyState>
      </PageShell>
    )
  }

  const editable = isInvoiceEditable(invoice.status)

  async function handleSave() {
    const validation = validateDraft(rows)
    setInvalidKeys(validation.invalidKeys)
    setMessage(validation.message)
    if (!validation.valid || !invoice) return

    // Invoices carry tax_cents but no tax_rate_percent column, so there is no
    // rate to apply here — tax stays whatever was already stored.
    const totals = computeTotals(rows, null)
    try {
      await saveItems.mutateAsync({
        items: toPersistable(rows),
        subtotalCents: totals.subtotalCents,
        taxCents: invoice.taxCents,
        totalCents: totals.totalCents + (invoice.taxCents ?? 0),
      })
      setMessage('Saved.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save.')
    }
  }

  return (
    <PageShell
      title={invoice.title}
      actions={
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            STATUS_CLASSES[invoice.status] ?? STATUS_CLASSES.draft
          }`}
        >
          {INVOICE_STATUS_LABELS[invoice.status]}
        </span>
      }
    >
      <div className="border-navy/10 rounded-lg border bg-white p-5">
        <LineItemEditor
          rows={rows}
          onChange={setRows}
          taxRatePercent={null}
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
                invoice && updateStatus.mutate({ id: invoice.id, status: 'sent' })
              }
              disabled={updateStatus.isPending || invoice.totalCents === 0}
              title={
                invoice.totalCents === 0 ? 'Save line items before sending' : undefined
              }
              className="border-navy/20 text-navy rounded-md border px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              Send to client
            </button>
          </div>
        ) : (
          <p className="text-navy/50 mt-5 text-sm">
            This invoice has been sent and can no longer be edited.
          </p>
        )}

        {invoice.paidAt && (
          <p className="mt-4 text-sm text-emerald-700">
            Paid {formatCents(invoice.totalCents)} on{' '}
            {new Date(invoice.paidAt).toLocaleDateString()}.
          </p>
        )}
      </div>

      {/* `paid` is set only by the payment_intent.succeeded Edge Function via
          the service role — never from the app. */}
      <p className="text-navy/40 mt-4 text-xs">
        Payment status is updated automatically when the client pays.
      </p>
    </PageShell>
  )
}
