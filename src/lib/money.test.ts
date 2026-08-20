import { describe, expect, it } from 'vitest'

import {
  formatCents,
  lineItemTotalCents,
  parseCurrencyToCents,
  parseQuantity,
  subtotalCents,
  taxCents,
  totalCents,
} from './money'

describe('lineItemTotalCents', () => {
  it('multiplies whole quantities exactly', () => {
    expect(lineItemTotalCents(3, 1000)).toBe(3000)
    expect(lineItemTotalCents(1, 12345)).toBe(12345)
  })

  it('handles fractional quantities, which numeric(10,2) allows', () => {
    expect(lineItemTotalCents(2.5, 1000)).toBe(2500)
    expect(lineItemTotalCents(0.5, 999)).toBe(500) // 499.5 rounds away from zero
  })

  it('does not leak IEEE-754 error into the result', () => {
    // 0.1 * 3 === 0.30000000000000004 in floating point. The result must be a
    // clean integer, not 30.000000000000004.
    expect(lineItemTotalCents(0.1, 300)).toBe(30)
    expect(Number.isInteger(lineItemTotalCents(0.1, 300))).toBe(true)
    expect(lineItemTotalCents(1.1, 300)).toBe(330)
  })

  it('always returns an integer', () => {
    for (const quantity of [0.01, 0.33, 1.15, 7.77, 12.5]) {
      const result = lineItemTotalCents(quantity, 1337)
      expect(Number.isInteger(result)).toBe(true)
    }
  })

  it('rounds half away from zero rather than JS half-up', () => {
    // 0.5 * 1 = 0.5 cents. Math.round would give 1 for positive and 0 for
    // negative (biasing toward zero); this rounds symmetrically.
    expect(lineItemTotalCents(0.5, 1)).toBe(1)
    expect(lineItemTotalCents(-0.5, 1)).toBe(-1)
  })

  it('supports negative amounts for credits', () => {
    expect(lineItemTotalCents(2, -500)).toBe(-1000)
  })

  it('is zero for a zero quantity or price', () => {
    expect(lineItemTotalCents(0, 5000)).toBe(0)
    expect(lineItemTotalCents(5, 0)).toBe(0)
  })

  it('rejects a non-integer unit price rather than silently rounding', () => {
    expect(() => lineItemTotalCents(1, 10.5)).toThrow()
  })

  it('is zero for non-finite input rather than producing NaN', () => {
    expect(lineItemTotalCents(Number.NaN, 100)).toBe(0)
    expect(lineItemTotalCents(Number.POSITIVE_INFINITY, 100)).toBe(0)
  })
})

describe('subtotalCents', () => {
  it('sums already-rounded line totals', () => {
    expect(
      subtotalCents([{ totalCents: 1000 }, { totalCents: 2500 }, { totalCents: 33 }]),
    ).toBe(3533)
  })

  it('is zero for no line items', () => {
    expect(subtotalCents([])).toBe(0)
  })

  it('matches the sum of the displayed line totals exactly', () => {
    // The reason line totals are rounded individually: summing raw products and
    // rounding once can differ from the sum of what the user sees.
    const items = [0.33, 0.33, 0.33].map((quantity) => ({
      totalCents: lineItemTotalCents(quantity, 100),
    }))
    expect(items.map((i) => i.totalCents)).toEqual([33, 33, 33])
    expect(subtotalCents(items)).toBe(99)
  })
})

describe('taxCents', () => {
  it('applies a percentage rate', () => {
    expect(taxCents(10000, 8.25)).toBe(825)
    expect(taxCents(10000, 10)).toBe(1000)
  })

  it('rounds to a whole cent', () => {
    expect(Number.isInteger(taxCents(3333, 8.25))).toBe(true)
    expect(taxCents(3333, 8.25)).toBe(275) // 274.97 -> 275
  })

  it('is zero when no rate is set', () => {
    expect(taxCents(10000, null)).toBe(0)
    expect(taxCents(10000, 0)).toBe(0)
  })
})

describe('totalCents', () => {
  it('adds subtotal and tax', () => {
    expect(totalCents(10000, 825)).toBe(10825)
  })

  it('composes cleanly from the pieces', () => {
    const items = [
      { totalCents: lineItemTotalCents(2.5, 20000) },
      { totalCents: lineItemTotalCents(1, 7550) },
    ]
    const subtotal = subtotalCents(items)
    const tax = taxCents(subtotal, 8.25)
    expect(subtotal).toBe(57550)
    expect(tax).toBe(4748) // 4747.875 -> 4748
    expect(totalCents(subtotal, tax)).toBe(62298)
  })
})

describe('formatCents', () => {
  it('formats dollars and cents', () => {
    expect(formatCents(0)).toBe('$0.00')
    expect(formatCents(5)).toBe('$0.05')
    expect(formatCents(12345)).toBe('$123.45')
  })

  it('groups thousands', () => {
    expect(formatCents(123456789)).toBe('$1,234,567.89')
  })

  it('formats negatives', () => {
    expect(formatCents(-2500)).toBe('-$25.00')
  })
})

describe('parseCurrencyToCents', () => {
  it('parses plain and decorated input', () => {
    expect(parseCurrencyToCents('12.34')).toBe(1234)
    expect(parseCurrencyToCents('$12.34')).toBe(1234)
    expect(parseCurrencyToCents(' $1,234.56 ')).toBe(123456)
  })

  it('treats a bare number as whole dollars', () => {
    expect(parseCurrencyToCents('12')).toBe(1200)
  })

  it('pads a single decimal place', () => {
    expect(parseCurrencyToCents('12.5')).toBe(1250)
  })

  it('parses zero and negatives', () => {
    expect(parseCurrencyToCents('0')).toBe(0)
    expect(parseCurrencyToCents('-25.00')).toBe(-2500)
  })

  it('rejects more than two decimal places rather than rounding', () => {
    // Silently turning 10.005 into $10.01 on an invoice is a billing dispute.
    expect(parseCurrencyToCents('10.005')).toBeNull()
  })

  it('rejects junk instead of guessing', () => {
    for (const input of ['', '   ', 'abc', '1.2.3', '$', '-', '.', '12abc']) {
      expect(parseCurrencyToCents(input)).toBeNull()
    }
  })

  it('rejects amounts too large to represent exactly', () => {
    expect(parseCurrencyToCents('999999999999999999')).toBeNull()
  })

  it('round-trips with formatCents', () => {
    for (const cents of [0, 5, 99, 1234, 100000, 123456789]) {
      expect(parseCurrencyToCents(formatCents(cents))).toBe(cents)
    }
  })
})

describe('parseQuantity', () => {
  it('parses whole and fractional quantities', () => {
    expect(parseQuantity('3')).toBe(3)
    expect(parseQuantity('2.5')).toBe(2.5)
    expect(parseQuantity('0.25')).toBe(0.25)
  })

  it('rejects more than two decimals, matching numeric(10,2)', () => {
    expect(parseQuantity('1.234')).toBeNull()
  })

  it('rejects negatives, which are not a meaningful quantity', () => {
    expect(parseQuantity('-1')).toBeNull()
  })

  it('rejects junk', () => {
    for (const input of ['', 'abc', '1.2.3', '.']) {
      expect(parseQuantity(input)).toBeNull()
    }
  })
})
