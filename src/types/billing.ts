/**
 * Proposals, invoices, and the line items shared by both. Money is integer
 * cents throughout — see lib/money.ts.
 */

/** Mirrors the `status` check constraint on `proposals` (migration 005). */
export const PROPOSAL_STATUSES = [
  'draft',
  'sent',
  'approved',
  'rejected',
  'expired',
] as const
export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number]

/** Mirrors the `status` check constraint on `invoices` (migration 006). */
export const INVOICE_STATUSES = [
  'draft',
  'sent',
  'approved',
  'paid',
  'voided',
  'refunded',
] as const
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  approved: 'Approved',
  rejected: 'Rejected',
  expired: 'Expired',
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  approved: 'Approved',
  paid: 'Paid',
  voided: 'Voided',
  refunded: 'Refunded',
}

/** Polymorphic parent of a line item (migration 007). */
export type LineItemParentType = 'proposal' | 'invoice'

export interface LineItem {
  id: string
  organizationId: string
  parentType: LineItemParentType
  parentId: string
  description: string
  quantity: number
  unitPriceCents: number
  totalCents: number
  sortOrder: number
}

export interface Proposal {
  id: string
  organizationId: string
  projectId: string | null
  clientId: string
  title: string
  status: ProposalStatus
  subtotalCents: number
  taxRatePercent: number | null
  taxCents: number | null
  totalCents: number
  notes: string | null
  validUntil: string | null
  approvedAt: string | null
  createdAt: string
}

export interface Invoice {
  id: string
  organizationId: string
  projectId: string | null
  proposalId: string | null
  clientId: string
  title: string
  stripePaymentIntentId: string | null
  subtotalCents: number
  taxCents: number | null
  totalCents: number
  status: InvoiceStatus
  dueDate: string | null
  paidAt: string | null
  createdAt: string
}

function assertStatus<T extends string>(
  value: string,
  allowed: readonly T[],
  kind: string,
): T {
  if (!(allowed as readonly string[]).includes(value)) {
    throw new Error(`Unknown ${kind} status: ${value}`)
  }
  return value as T
}

export function mapLineItem(row: {
  id: string
  organization_id: string
  parent_type: string
  parent_id: string
  description: string
  quantity: number
  unit_price_cents: number
  total_cents: number
  sort_order: number
}): LineItem {
  if (row.parent_type !== 'proposal' && row.parent_type !== 'invoice') {
    throw new Error(`Unknown line item parent type: ${row.parent_type}`)
  }
  return {
    id: row.id,
    organizationId: row.organization_id,
    parentType: row.parent_type,
    parentId: row.parent_id,
    description: row.description,
    // numeric(10,2) arrives as a number from PostgREST, but a string from some
    // drivers — coerce so arithmetic never silently concatenates.
    quantity: Number(row.quantity),
    unitPriceCents: row.unit_price_cents,
    totalCents: row.total_cents,
    sortOrder: row.sort_order,
  }
}

export function mapProposal(row: {
  id: string
  organization_id: string
  project_id: string | null
  client_id: string
  title: string
  status: string
  subtotal_cents: number
  tax_rate_percent: number | null
  tax_cents: number | null
  total_cents: number
  notes: string | null
  valid_until: string | null
  approved_at: string | null
  created_at: string
}): Proposal {
  return {
    id: row.id,
    organizationId: row.organization_id,
    projectId: row.project_id,
    clientId: row.client_id,
    title: row.title,
    status: assertStatus(row.status, PROPOSAL_STATUSES, 'proposal'),
    subtotalCents: row.subtotal_cents,
    taxRatePercent: row.tax_rate_percent === null ? null : Number(row.tax_rate_percent),
    taxCents: row.tax_cents,
    totalCents: row.total_cents,
    notes: row.notes,
    validUntil: row.valid_until,
    approvedAt: row.approved_at,
    createdAt: row.created_at,
  }
}

export function mapInvoice(row: {
  id: string
  organization_id: string
  project_id: string | null
  proposal_id: string | null
  client_id: string
  title: string
  stripe_payment_intent_id: string | null
  subtotal_cents: number
  tax_cents: number | null
  total_cents: number
  status: string
  due_date: string | null
  paid_at: string | null
  created_at: string
}): Invoice {
  return {
    id: row.id,
    organizationId: row.organization_id,
    projectId: row.project_id,
    proposalId: row.proposal_id,
    clientId: row.client_id,
    title: row.title,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    subtotalCents: row.subtotal_cents,
    taxCents: row.tax_cents,
    totalCents: row.total_cents,
    status: assertStatus(row.status, INVOICE_STATUSES, 'invoice'),
    dueDate: row.due_date,
    paidAt: row.paid_at,
    createdAt: row.created_at,
  }
}

/**
 * A proposal or invoice is only editable before it reaches the client. Once
 * sent, the amounts are what the client is looking at — changing them out from
 * under them is exactly the kind of thing that causes disputes.
 */
export function isProposalEditable(status: ProposalStatus): boolean {
  return status === 'draft'
}

export function isInvoiceEditable(status: InvoiceStatus): boolean {
  return status === 'draft'
}

/** Terminal states, where no further action is meaningful. */
export function isProposalClosed(status: ProposalStatus): boolean {
  return status === 'approved' || status === 'rejected' || status === 'expired'
}

export function isInvoiceClosed(status: InvoiceStatus): boolean {
  return status === 'paid' || status === 'voided' || status === 'refunded'
}
