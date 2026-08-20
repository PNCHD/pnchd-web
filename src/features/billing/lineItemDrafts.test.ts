import { describe, expect, it } from 'vitest'

import {
  computeTotals,
  isBlankRow,
  toPersistable,
  validateDraft,
  type LineItemDraftRow,
} from './lineItemDrafts'

function row(overrides: Partial<LineItemDraftRow> = {}): LineItemDraftRow {
  return {
    key: 'k1',
    description: 'Labor',
    quantity: '2',
    unitPrice: '50.00',
    ...overrides,
  }
}

describe('computeTotals', () => {
  it('totals a simple draft', () => {
    const totals = computeTotals([row()], null)
    expect(totals.rowTotals).toEqual([10000])
    expect(totals.subtotalCents).toBe(10000)
    expect(totals.totalCents).toBe(10000)
  })

  it('applies a tax rate', () => {
    const totals = computeTotals([row()], 8.25)
    expect(totals.taxCents).toBe(825)
    expect(totals.totalCents).toBe(10825)
  })

  it('treats a half-typed row as zero rather than NaN', () => {
    // Mid-typing the field is "12." — the total must stay a number so the UI
    // doesn't render "$NaN".
    const totals = computeTotals([row({ unitPrice: '12.' })], null)
    expect(totals.rowTotals).toEqual([0])
    expect(Number.isNaN(totals.totalCents)).toBe(false)
  })

  it('keeps valid rows counted when another row is invalid', () => {
    const totals = computeTotals(
      [row({ key: 'a' }), row({ key: 'b', unitPrice: 'abc' })],
      null,
    )
    expect(totals.rowTotals).toEqual([10000, 0])
    expect(totals.subtotalCents).toBe(10000)
  })

  it('handles fractional quantities without float drift', () => {
    const totals = computeTotals([row({ quantity: '0.1', unitPrice: '3.00' })], null)
    expect(totals.rowTotals).toEqual([30])
    expect(Number.isInteger(totals.subtotalCents)).toBe(true)
  })

  it('is zero for an empty draft', () => {
    const totals = computeTotals([], 8.25)
    expect(totals.subtotalCents).toBe(0)
    expect(totals.taxCents).toBe(0)
    expect(totals.totalCents).toBe(0)
  })

  it('subtotal equals the sum of the displayed row totals', () => {
    const rows = ['0.33', '0.33', '0.33'].map((quantity, index) =>
      row({ key: `k${index}`, quantity, unitPrice: '1.00' }),
    )
    const totals = computeTotals(rows, null)
    expect(totals.rowTotals).toEqual([33, 33, 33])
    expect(totals.subtotalCents).toBe(99)
  })
})

describe('isBlankRow', () => {
  it('treats an untouched row as blank even with a default quantity', () => {
    expect(isBlankRow({ key: 'k', description: '', quantity: '1', unitPrice: '' })).toBe(
      true,
    )
  })

  it('is not blank once anything meaningful is entered', () => {
    expect(isBlankRow(row({ description: 'x', unitPrice: '' }))).toBe(false)
    expect(isBlankRow(row({ description: '', unitPrice: '5' }))).toBe(false)
  })
})

describe('validateDraft', () => {
  it('accepts a complete draft', () => {
    expect(validateDraft([row()]).valid).toBe(true)
  })

  it('rejects a draft with no meaningful rows', () => {
    const result = validateDraft([
      { key: 'k', description: '', quantity: '1', unitPrice: '' },
    ])
    expect(result.valid).toBe(false)
    expect(result.message).toMatch(/at least one/i)
  })

  it('ignores a trailing blank row', () => {
    const result = validateDraft([
      row(),
      { key: 'blank', description: '', quantity: '1', unitPrice: '' },
    ])
    expect(result.valid).toBe(true)
  })

  it('flags exactly the rows with problems', () => {
    const result = validateDraft([
      row({ key: 'good' }),
      row({ key: 'noDescription', description: '  ' }),
      row({ key: 'badPrice', unitPrice: '1.234' }),
    ])
    expect(result.valid).toBe(false)
    expect(result.invalidKeys.sort()).toEqual(['badPrice', 'noDescription'])
  })
})

describe('toPersistable', () => {
  it('drops blank rows and computes totals', () => {
    const items = toPersistable([
      row(),
      { key: 'blank', description: '', quantity: '1', unitPrice: '' },
    ])
    expect(items).toHaveLength(1)
    expect(items[0]).toEqual({
      description: 'Labor',
      quantity: 2,
      unitPriceCents: 5000,
      totalCents: 10000,
    })
  })

  it('trims descriptions', () => {
    expect(toPersistable([row({ description: '  Framing  ' })])[0].description).toBe(
      'Framing',
    )
  })

  it('emits integer cents for fractional quantities', () => {
    const [item] = toPersistable([row({ quantity: '1.5', unitPrice: '9.99' })])
    expect(item.totalCents).toBe(1499) // 1498.5 rounds away from zero
    expect(Number.isInteger(item.totalCents)).toBe(true)
  })
})
