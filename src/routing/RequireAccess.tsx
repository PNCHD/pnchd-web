import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useProfile } from '../auth/useProfile'
import { LoadingScreen } from '../components/LoadingScreen'
import { resolveAccess } from './access'

/**
 * Gates a subtree on the pure `resolveAccess` decision.
 *
 * Renders a loading screen rather than deciding while the profile is still
 * resolving — deciding on incomplete state is exactly the trap that stalled the
 * mobile router (ENGINEERING_NOTES.md §3.4).
 */
export function RequireAccess({ children }: { children: ReactNode }) {
  const { profile, isLoading } = useProfile()
  const location = useLocation()

  if (isLoading) return <LoadingScreen />

  const decision = resolveAccess(profile, location.pathname)
  if (decision.type === 'redirect') {
    return <Navigate to={decision.to} replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
