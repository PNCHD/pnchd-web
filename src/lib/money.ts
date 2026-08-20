/**
 * Money is integer cents everywhere — never floats (Section 13.3). These helpers
 * are the only place cents become decimals or vice versa.
 *
 * The subtle part is `quantity`, which is `numeric(10,2)` in the database and so
 * genuinely fractional. Multiplying a decimal quantity by an integer price in
 * IEEE-754 introduces error (0.1 * 3 === 0.30000000000000004), so every product
 * is rounded back to an integer immediately rather than accumulated and rounded
 * at the end — accumulating drift and rounding once produces off-by-a-cent
 * totals that don't match the sum of the visible line items.
 */

/** Rounds half away from zero, not JS's half-up (which biases negatives). */
function roundHalfAwayFromZero(value: number): number {
  return value < 0 ? -Math.round(-value) : Math.round(value)
}

export function lineItemTotalCents(
  quantity: number,
  unitPriceCents: number,
): number {
  if (!Number.isFinite(quantity) || !Number.isFinite(unitPriceCents)) return 0
  if (!Number.isInteger(unitPriceCents)) {
    throw new Error('unitPriceCents must be an integer number of cents')
  }
  return roundHalfAwayFromZero(quantity * unitPriceCents)
}

/** Sum of already-rounded line totals, so the total always matches what's shown. */
export function subtotalCents(
  lineItems: readonly { totalCents: number }[],
): number {
  return lineItems.reduce((sum, item) => sum + item.totalCents, 0)
}

export function taxCents(subtotal: number, taxRatePercent: number | null): number {
  if (!taxRatePercent || !Number.isFinite(taxRatePercent)) return 0
  return roundHalfAwayFromZero((subtotal * taxRatePercent) / 100)
}

export function totalCents(subtotal: number, tax: number): number {
  return subtotal + tax
}

const FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export function formatCents(cents: number): string {
  return FORMATTER.format(cents / 100)
}

/**
 * Parses user input into cents. Returns null for anything unparseable so the
 * caller can show a validation error rather than silently writing a wrong
 * amount.
 *
 * Deliberately strict: more than two decimal places is rejected rather than
 * rounded, because silently turning "10.005" into $10.01 on an invoice is the
 * kind of thing that surfaces as a billing dispute.
 */
export function parseCurrencyToCents(input: string): number | null {
  const cleaned = input.trim().replace(/[$,\s]/g, '')
  if (cleaned === '') return null
  if (!/^-?\d*(\.\d{1,2})?$/.test(cleaned)) return null
  if (cleaned === '-' || cleaned === '.' || cleaned === '-.') return null

  const [whole, fraction = ''] = cleaned.replace('-', '').split('.')
  const cents =
    Number(whole || '0') * 100 + Number(fraction.padEnd(2, '0').slice(0, 2))

  if (!Number.isSafeInteger(cents)) return null
  return cleaned.startsWith('-') ? -cents : cents
}

/** Parses a quantity, which may legitimately be fractional to two places. */
export function parseQuantity(input: string): number | null {
  const cleaned = input.trim().replace(/[,\s]/g, '')
  if (cleaned === '') return null
  if (!/^\d*(\.\d{1,2})?$/.test(cleaned) || cleaned === '.') return null

  const value = Number(cleaned)
  return Number.isFinite(value) ? value : null
}
