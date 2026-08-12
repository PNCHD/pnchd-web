import { describe, expect, it } from 'vitest'

import type { Profile, ProfileRole } from '../types/profile'
import { canAccessAdmin, hasWebAccess, isAdminPath, resolveAccess } from './access'

function profile(role: ProfileRole): Profile {
  return {
    id: 'u1',
    organizationId: 'o1',
    role,
    fullName: 'Test User',
    avatarUrl: null,
    phone: null,
    isActive: true,
  }
}

describe('signed out', () => {
  it('allows public marketing and auth routes', () => {
    for (const path of ['/', '/pricing', '/login', '/signup']) {
      expect(resolveAccess(null, path)).toEqual({ type: 'allow' })
    }
  })

  it('redirects protected routes to login', () => {
    expect(resolveAccess(null, '/dashboard')).toEqual({
      type: 'redirect',
      to: '/login',
    })
    expect(resolveAccess(null, '/admin')).toEqual({ type: 'redirect', to: '/login' })
  })
})

describe('contractor roles', () => {
  it.each(['owner', 'pro'] as const)('%s may use the contractor app', (role) => {
    expect(resolveAccess(profile(role), '/dashboard')).toEqual({ type: 'allow' })
    expect(resolveAccess(profile(role), '/projects')).toEqual({ type: 'allow' })
  })

  it('sends a signed-in contractor away from login and signup', () => {
    expect(resolveAccess(profile('owner'), '/login')).toEqual({
      type: 'redirect',
      to: '/dashboard',
    })
    expect(resolveAccess(profile('owner'), '/signup')).toEqual({
      type: 'redirect',
      to: '/dashboard',
    })
  })

  it('keeps marketing pages reachable while signed in', () => {
    expect(resolveAccess(profile('owner'), '/pricing')).toEqual({ type: 'allow' })
    expect(resolveAccess(profile('owner'), '/')).toEqual({ type: 'allow' })
  })

  it('blocks non-admins from the admin area', () => {
    expect(resolveAccess(profile('owner'), '/admin')).toEqual({
      type: 'redirect',
      to: '/dashboard',
    })
    expect(resolveAccess(profile('pro'), '/admin/organizations')).toEqual({
      type: 'redirect',
      to: '/dashboard',
    })
  })
})

describe('client and driver roles', () => {
  it.each(['client', 'driver'] as const)(
    '%s is redirected to the mobile-only explainer',
    (role) => {
      expect(resolveAccess(profile(role), '/dashboard')).toEqual({
        type: 'redirect',
        to: '/mobile-only',
      })
    },
  )

  it('allows the mobile-only page itself, avoiding a redirect loop', () => {
    expect(resolveAccess(profile('client'), '/mobile-only')).toEqual({ type: 'allow' })
  })

  it('is redirected even from public paths, since the app is not for them', () => {
    expect(resolveAccess(profile('driver'), '/pricing')).toEqual({
      type: 'redirect',
      to: '/mobile-only',
    })
  })
})

describe('platform admin', () => {
  it('may reach both the admin area and the contractor app', () => {
    expect(resolveAccess(profile('platform_admin'), '/admin')).toEqual({ type: 'allow' })
    expect(resolveAccess(profile('platform_admin'), '/admin/billing')).toEqual({
      type: 'allow',
    })
    expect(resolveAccess(profile('platform_admin'), '/dashboard')).toEqual({
      type: 'allow',
    })
  })
})

describe('helpers', () => {
  it('isAdminPath matches the admin area but not lookalikes', () => {
    expect(isAdminPath('/admin')).toBe(true)
    expect(isAdminPath('/admin/errors')).toBe(true)
    expect(isAdminPath('/administration')).toBe(false)
    expect(isAdminPath('/dashboard')).toBe(false)
  })

  it('hasWebAccess and canAccessAdmin agree with the role table', () => {
    expect(hasWebAccess('owner')).toBe(true)
    expect(hasWebAccess('platform_admin')).toBe(true)
    expect(hasWebAccess('client')).toBe(false)
    expect(canAccessAdmin('owner')).toBe(false)
    expect(canAccessAdmin('platform_admin')).toBe(true)
  })
})
