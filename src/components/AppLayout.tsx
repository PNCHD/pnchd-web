import { useQueryClient } from '@tanstack/react-query'
import { NavLink, Outlet } from 'react-router-dom'

import { useActiveModules } from '../auth/useActiveModules'
import { useProfile } from '../auth/useProfile'
import { useRepositories } from '../data/repositoryContext'
import { canAccessAdmin } from '../routing/access'
import { visibleNavItems } from '../routing/navigation'

/**
 * Shell for authenticated contractor routes: module-gated primary nav plus the
 * routed page. Mirrors pnchd-mobile's ContractorShell.
 */
export function AppLayout() {
  const { modules } = useActiveModules()
  const { profile } = useProfile()
  const { auth } = useRepositories()
  const queryClient = useQueryClient()
  const items = visibleNavItems(modules)

  async function handleSignOut() {
    await auth.signOut()
    // Drop cached profile/module data so the next user can't briefly see the
    // previous one's — the auth listener re-renders faster than a refetch.
    queryClient.clear()
  }

  return (
    <div className="bg-app-bg min-h-screen">
      <header className="bg-navy text-white">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3">
          <span className="text-lg font-bold tracking-wide">PNCHD</span>
          <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  isActive ? 'text-white underline underline-offset-4' : 'text-white/70'
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4 text-sm">
            {profile && canAccessAdmin(profile.role) && (
              <NavLink to="/admin" className="text-white/70">
                Admin
              </NavLink>
            )}
            <NavLink to="/settings/account" className="text-white/70">
              Settings
            </NavLink>
            <button type="button" onClick={handleSignOut} className="text-white/70">
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
