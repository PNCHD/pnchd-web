/**
 * Module-gated navigation, mirroring pnchd-mobile's ContractorShell. UI-level
 * only (Section 4.3) — hiding a link stops nothing on its own; RLS is what
 * actually denies an unsubscribed org's data.
 */

export interface NavItem {
  label: string
  path: string
  /** null = core feature, always visible. Otherwise the module_key required. */
  requiredModule: string | null
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', requiredModule: null },
  { label: 'Projects', path: '/projects', requiredModule: null },
  { label: 'Scheduling', path: '/scheduling', requiredModule: 'scheduling' },
  { label: 'Proposals', path: '/proposals', requiredModule: 'proposals_invoicing' },
  { label: 'Invoices', path: '/invoices', requiredModule: 'proposals_invoicing' },
  { label: 'Documents', path: '/documents', requiredModule: 'document_signing' },
  { label: 'Fleet', path: '/fleet', requiredModule: 'fleet_tracking' },
]

export function visibleNavItems(
  activeModules: readonly string[],
  items: readonly NavItem[] = NAV_ITEMS,
): NavItem[] {
  const active = new Set(activeModules)
  return items.filter(
    (item) => item.requiredModule === null || active.has(item.requiredModule),
  )
}

/** Whether a module-gated route may render, independent of nav visibility. */
export function isRouteUnlocked(
  path: string,
  activeModules: readonly string[],
  items: readonly NavItem[] = NAV_ITEMS,
): boolean {
  const item = items.find((candidate) => path.startsWith(candidate.path))
  if (!item || item.requiredModule === null) return true
  return activeModules.includes(item.requiredModule)
}
