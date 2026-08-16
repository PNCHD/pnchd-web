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
  /** Org setup, for a signed-in contractor whose profile has no org yet. */
  onboarding: '/welcome',
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

/** Signed in, but not yet attached to an organization. */
export function needsOrganizationSetup(profile: Profile): boolean {
  return profile.role !== 'platform_admin' && profile.organizationId === null
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

  // A contractor authenticated but not yet attached to an organization. The
  // handle_new_user trigger creates the profile with organization_id NULL, so
  // this is the normal state between clicking the magic link and finishing
  // setup — not an error. Everything else is unusable until it's resolved:
  // every org-scoped policy compares against an org this user doesn't have.
  //
  // platform_admin is exempt — that role is cross-org by nature and has no
  // organization of its own.
  if (needsOrganizationSetup(profile)) {
    return path === ROUTES.onboarding
      ? { type: 'allow' }
      : { type: 'redirect', to: ROUTES.onboarding }
  }

  // Finished setup — no reason to sit on the setup page.
  if (path === ROUTES.onboarding) {
    return { type: 'redirect', to: ROUTES.dashboard }
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
