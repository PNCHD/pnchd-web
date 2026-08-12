import type { Profile, ProfileRole } from '../types/profile'

/**
 * Pure route-access logic, deliberately free of React Router types so it can be
 * unit tested without a router or a rendered tree — same reasoning as
 * pnchd-mobile's resolveRedirect.
 *
 * Web's rules differ from mobile's (Section 10.3): this app serves contractors
 * and the platform admin only. Clients and drivers have no web surface until
 * the client_portal roadmap module ships, so they are sent to an explainer page
 * rather than being silently bounced somewhere they also can't use.
 */

export const ROUTES = {
  landing: '/',
  pricing: '/pricing',
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
  mobileOnly: '/mobile-only',
  admin: '/admin',
} as const

/** Reachable without a session. */
const PUBLIC_PATHS = new Set<string>([
  ROUTES.landing,
  ROUTES.pricing,
  ROUTES.login,
  ROUTES.signup,
])

export function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.has(path)
}

export function isAdminPath(path: string): boolean {
  return path === ROUTES.admin || path.startsWith(`${ROUTES.admin}/`)
}

/** Roles with a web app at all (Section 10.3). */
export function hasWebAccess(role: ProfileRole): boolean {
  return role === 'owner' || role === 'pro' || role === 'platform_admin'
}

export function canAccessAdmin(role: ProfileRole): boolean {
  return role === 'platform_admin'
}

export type AccessDecision =
  | { type: 'allow' }
  | { type: 'redirect'; to: string }

/**
 * Where a request for `path` should end up.
 *
 * `profile === null` means signed out. While the profile is still loading the
 * caller should render a loading state rather than calling this — deciding on
 * incomplete data is what caused the mobile redirect stall
 * (ENGINEERING_NOTES.md §3.4).
 */
export function resolveAccess(profile: Profile | null, path: string): AccessDecision {
  if (!profile) {
    return isPublicPath(path)
      ? { type: 'allow' }
      : { type: 'redirect', to: ROUTES.login }
  }

  if (!hasWebAccess(profile.role)) {
    return path === ROUTES.mobileOnly
      ? { type: 'allow' }
      : { type: 'redirect', to: ROUTES.mobileOnly }
  }

  // A signed-in contractor landing on login/signup goes to their dashboard;
  // marketing pages stay reachable so they can read pricing while logged in.
  if (path === ROUTES.login || path === ROUTES.signup) {
    return { type: 'redirect', to: ROUTES.dashboard }
  }

  if (isAdminPath(path) && !canAccessAdmin(profile.role)) {
    return { type: 'redirect', to: ROUTES.dashboard }
  }

  return { type: 'allow' }
}
