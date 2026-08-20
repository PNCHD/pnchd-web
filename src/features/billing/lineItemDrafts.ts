import {
  lineItemTotalCents,
  parseCurrencyToCents,
  parseQuantity,
  subtotalCents,
  taxCents,
  totalCents,
} from '../../lib/money'
import type { LineItem } from '../../types/billing'

/**
 * Line items while being edited. Quantity and price stay as raw strings so the
 * user can type "1." or "" without the field fighting them; they're parsed on
 * every keystroke for totals and validated on save.
 */
export interface LineItemDraftRow {
  key: string
  description: string
  quantity: string
  unitPrice: string
}

export interface DraftTotals {
  subtotalCents: number
  taxCents: number
  totalCents: number
  /** Per-row totals, aligned by index, for display. */
  rowTotals: number[]
}

let nextKey = 0
export function newDraftRow(): LineItemDraftRow {
  nextKey += 1
  return { key: `draft-${nextKey}`, description: '', quantity: '1', unitPrice: '' }
}

export function toDraftRows(lineItems: readonly LineItem[]): LineItemDraftRow[] {
  return lineItems.map((item) => ({
    key: item.id,
    description: item.description,
    quantity: String(item.quantity),
    unitPrice: (item.unitPriceCents / 100).toFixed(2),
  }))
}

/**
 * Totals for the current draft. Unparseable rows contribute zero rather than
 * NaN, so a half-typed price shows a stale-but-sane total instead of "$NaN".
 */
export function computeTotals(
  rows: readonly LineItemDraftRow[],
  taxRatePercent: number | null,
): DraftTotals {
  const rowTotals = rows.map((row) => {
    const quantity = parseQuantity(row.quantity)
    const price = parseCurrencyToCents(row.unitPrice)
    if (quantity === null || price === null) return 0
    return lineItemTotalCents(quantity, price)
  })

  const subtotal = subtotalCents(rowTotals.map((total) => ({ totalCents: total })))
  const tax = taxCents(subtotal, taxRatePercent)

  return {
    subtotalCents: subtotal,
    taxCents: tax,
    totalCents: totalCents(subtotal, tax),
    rowTotals,
  }
}

export interface ValidationResult {
  valid: boolean
  /** Row keys with a problem, so the UI can mark just those. */
  invalidKeys: string[]
  message: string | null
}

/**
 * A row is only checked if the user has put something in it — an untouched
 * trailing blank row is dropped on save rather than treated as an error.
 */
export function isBlankRow(row: LineItemDraftRow): boolean {
  return row.description.trim() === '' && row.unitPrice.trim() === ''
}

export function validateDraft(rows: readonly LineItemDraftRow[]): ValidationResult {
  const meaningful = rows.filter((row) => !isBlankRow(row))

  if (meaningful.length === 0) {
    return { valid: false, invalidKeys: [], message: 'Add at least one line item.' }
  }

  const invalidKeys = meaningful
    .filter(
      (row) =>
        row.description.trim() === '' ||
        parseQuantity(row.quantity) === null ||
        parseCurrencyToCents(row.unitPrice) === null,
    )
    .map((row) => row.key)

  if (invalidKeys.length > 0) {
    return {
      valid: false,
      invalidKeys,
      message: 'Each line needs a description, a quantity, and a price.',
    }
  }

  return { valid: true, invalidKeys: [], message: null }
}

/** Drops blank rows and converts the rest into what the repository expects. */
export function toPersistable(rows: readonly LineItemDraftRow[]) {
  return rows
    .filter((row) => !isBlankRow(row))
    .map((row) => {
      const quantity = parseQuantity(row.quantity) ?? 0
      const unitPriceCents = parseCurrencyToCents(row.unitPrice) ?? 0
      return {
        description: row.description.trim(),
        quantity,
        unitPriceCents,
        totalCents: lineItemTotalCents(quantity, unitPriceCents),
      }
    })
}
