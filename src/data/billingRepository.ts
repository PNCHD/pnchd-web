import { supabase, type TypedSupabaseClient } from '../lib/supabase'
import {
  mapInvoice,
  mapLineItem,
  mapProposal,
  type Invoice,
  type InvoiceStatus,
  type LineItem,
  type LineItemParentType,
  type Proposal,
  type ProposalStatus,
} from '../types/billing'

// Single string literals — supabase-js parses these at the type level, and a
// concatenation widens to `string` and drops row typing entirely.
const PROPOSAL_COLUMNS =
  'id, organization_id, project_id, client_id, title, status, subtotal_cents, tax_rate_percent, tax_cents, total_cents, notes, valid_until, approved_at, created_at' as const
const INVOICE_COLUMNS =
  'id, organization_id, project_id, proposal_id, client_id, title, stripe_payment_intent_id, subtotal_cents, tax_cents, total_cents, status, due_date, paid_at, created_at' as const
const LINE_ITEM_COLUMNS =
  'id, organization_id, parent_type, parent_id, description, quantity, unit_price_cents, total_cents, sort_order' as const

export interface LineItemDraft {
  description: string
  quantity: number
  unitPriceCents: number
  totalCents: number
}

export class BillingRepository {
  private readonly client: TypedSupabaseClient

  constructor(client: TypedSupabaseClient = supabase) {
    this.client = client
  }

  // ---- proposals ----------------------------------------------------------

  async listProposals(): Promise<Proposal[]> {
    const { data, error } = await this.client
      .from('proposals')
      .select(PROPOSAL_COLUMNS)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`could not load proposals: ${error.message}`)
    return (data ?? []).map(mapProposal)
  }

  async getProposal(id: string): Promise<Proposal | null> {
    const { data, error } = await this.client
      .from('proposals')
      .select(PROPOSAL_COLUMNS)
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(`could not load proposal: ${error.message}`)
    return data ? mapProposal(data) : null
  }

  async createProposal(input: {
    organizationId: string
    clientId: string
    title: string
    projectId?: string | null
  }): Promise<Proposal> {
    const { data, error } = await this.client
      .from('proposals')
      .insert({
        organization_id: input.organizationId,
        client_id: input.clientId,
        title: input.title,
        project_id: input.projectId ?? null,
        status: 'draft',
        subtotal_cents: 0,
        total_cents: 0,
      })
      .select(PROPOSAL_COLUMNS)
      .single()

    if (error) throw new Error(`could not create proposal: ${error.message}`)
    return mapProposal(data)
  }

  async updateProposalStatus(id: string, status: ProposalStatus): Promise<void> {
    const { error } = await this.client
      .from('proposals')
      .update({ status })
      .eq('id', id)

    if (error) throw new Error(`could not update proposal: ${error.message}`)
  }

  // ---- invoices -----------------------------------------------------------

  async listInvoices(): Promise<Invoice[]> {
    const { data, error } = await this.client
      .from('invoices')
      .select(INVOICE_COLUMNS)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`could not load invoices: ${error.message}`)
    return (data ?? []).map(mapInvoice)
  }

  async getInvoice(id: string): Promise<Invoice | null> {
    const { data, error } = await this.client
      .from('invoices')
      .select(INVOICE_COLUMNS)
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(`could not load invoice: ${error.message}`)
    return data ? mapInvoice(data) : null
  }

  async createInvoice(input: {
    organizationId: string
    clientId: string
    title: string
    projectId?: string | null
    proposalId?: string | null
  }): Promise<Invoice> {
    const { data, error } = await this.client
      .from('invoices')
      .insert({
        organization_id: input.organizationId,
        client_id: input.clientId,
        title: input.title,
        project_id: input.projectId ?? null,
        proposal_id: input.proposalId ?? null,
        status: 'draft',
        subtotal_cents: 0,
        total_cents: 0,
      })
      .select(INVOICE_COLUMNS)
      .single()

    if (error) throw new Error(`could not create invoice: ${error.message}`)
    return mapInvoice(data)
  }

  async updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<void> {
    // `paid` is intentionally not reachable here — it is set exclusively by the
    // payment_intent.succeeded Edge Function via the service role. Sending it
    // from the client would be rejected by RLS anyway; failing early makes the
    // reason obvious.
    if (status === 'paid') {
      throw new Error('Invoices are marked paid by the payment webhook, not the app.')
    }

    const { error } = await this.client
      .from('invoices')
      .update({ status })
      .eq('id', id)

    if (error) throw new Error(`could not update invoice: ${error.message}`)
  }

  // ---- line items ---------------------------------------------------------

  async listLineItems(
    parentType: LineItemParentType,
    parentId: string,
  ): Promise<LineItem[]> {
    const { data, error } = await this.client
      .from('line_items')
      .select(LINE_ITEM_COLUMNS)
      .eq('parent_type', parentType)
      .eq('parent_id', parentId)
      .order('sort_order', { ascending: true })

    if (error) throw new Error(`could not load line items: ${error.message}`)
    return (data ?? []).map(mapLineItem)
  }

  /**
   * Replaces a parent's line items and rewrites its stored totals.
   *
   * Delete-then-insert rather than diffing: line items have no stable client-side
   * identity while being edited, and the parent's totals must end up consistent
   * with whatever rows exist. Not a transaction — PostgREST has no multi-statement
   * transaction — so a failure between the steps can leave a parent with fewer
   * items and stale totals. It is recoverable by saving again, and the amounts
   * are recomputed from the rows on every save. A SECURITY DEFINER function doing
   * all three writes atomically is the real fix; tracked in HANDOFF.
   */
  async replaceLineItems(params: {
    organizationId: string
    parentType: LineItemParentType
    parentId: string
    items: LineItemDraft[]
    subtotalCents: number
    taxCents: number | null
    totalCents: number
  }): Promise<void> {
    const { error: deleteError } = await this.client
      .from('line_items')
      .delete()
      .eq('parent_type', params.parentType)
      .eq('parent_id', params.parentId)

    if (deleteError) {
      throw new Error(`could not clear line items: ${deleteError.message}`)
    }

    if (params.items.length > 0) {
      const { error: insertError } = await this.client.from('line_items').insert(
        params.items.map((item, index) => ({
          organization_id: params.organizationId,
          parent_type: params.parentType,
          parent_id: params.parentId,
          description: item.description,
          quantity: item.quantity,
          unit_price_cents: item.unitPriceCents,
          total_cents: item.totalCents,
          sort_order: index,
        })),
      )

      if (insertError) {
        throw new Error(`could not save line items: ${insertError.message}`)
      }
    }

    const table = params.parentType === 'proposal' ? 'proposals' : 'invoices'
    const { error: totalsError } = await this.client
      .from(table)
      .update({
        subtotal_cents: params.subtotalCents,
        tax_cents: params.taxCents,
        total_cents: params.totalCents,
      })
      .eq('id', params.parentId)

    if (totalsError) {
      throw new Error(`could not update totals: ${totalsError.message}`)
    }
  }
}
