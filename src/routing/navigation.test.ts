import { describe, expect, it } from 'vitest'

import { isRouteUnlocked, NAV_ITEMS, visibleNavItems } from './navigation'

const labels = (modules: string[]) => visibleNavItems(modules).map((item) => item.label)

describe('visibleNavItems', () => {
  it('always shows core items with no modules active', () => {
    expect(labels([])).toEqual(['Dashboard', 'Projects'])
  })

  it('reveals a module item once its module is active', () => {
    expect(labels(['scheduling'])).toEqual(['Dashboard', 'Projects', 'Scheduling'])
  })

  it('shows both proposals and invoices for the single module gating them', () => {
    expect(labels(['proposals_invoicing'])).toEqual([
      'Dashboard',
      'Projects',
      'Proposals',
      'Invoices',
    ])
  })

  it('shows everything when all modules are active', () => {
    const all = NAV_ITEMS.map((item) => item.requiredModule).filter(
      (key): key is string => key !== null,
    )
    expect(visibleNavItems(all)).toHaveLength(NAV_ITEMS.length)
  })

  it('ignores module keys that gate nothing', () => {
    expect(labels(['budget_tracking'])).toEqual(['Dashboard', 'Projects'])
  })
})

describe('isRouteUnlocked', () => {
  it('always allows core routes', () => {
    expect(isRouteUnlocked('/dashboard', [])).toBe(true)
    expect(isRouteUnlocked('/projects/abc', [])).toBe(true)
  })

  it('locks a module route until its module is active', () => {
    expect(isRouteUnlocked('/fleet', [])).toBe(false)
    expect(isRouteUnlocked('/fleet', ['fleet_tracking'])).toBe(true)
  })

  it('applies the gate to nested detail routes', () => {
    expect(isRouteUnlocked('/invoices/inv_1', [])).toBe(false)
    expect(isRouteUnlocked('/invoices/inv_1', ['proposals_invoicing'])).toBe(true)
  })

  it('allows unknown routes rather than blocking them here', () => {
    // Unmatched paths are the router's 404 concern, not the module gate's.
    expect(isRouteUnlocked('/settings/account', [])).toBe(true)
  })
})
