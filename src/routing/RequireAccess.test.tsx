import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import type { Session } from '@supabase/supabase-js'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { RepositoryProvider } from '../data/RepositoryProvider'
import type { Repositories } from '../data'
import type { Profile, ProfileRole } from '../types/profile'
import { RequireAccess } from './RequireAccess'

/**
 * Exercises the whole auth path against injected fakes — no Supabase client, no
 * network. This is what the repository seam buys: without it, none of this is
 * reachable in a test.
 */
function fakeRepositories(role: ProfileRole | null): Repositories {
  const profile: Profile | null = role && {
    id: 'u1',
    organizationId: 'o1',
    role,
    fullName: 'Test User',
    avatarUrl: null,
    phone: null,
    isActive: true,
  }

  return {
    auth: {
      getSession: () =>
        Promise.resolve(role ? ({ user: { id: 'u1' } } as Session) : null),
      onAuthStateChange: () => () => {},
      signOut: () => Promise.resolve(),
    },
    profiles: {
      fetchById: () => Promise.resolve(profile),
    },
    modules: {
      fetchActiveModuleKeys: () => Promise.resolve([]),
    },
  } as unknown as Repositories
}

function renderAt(path: string, role: ProfileRole | null) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <RepositoryProvider repositories={fakeRepositories(role)}>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route
              path={path}
              element={
                <RequireAccess>
                  <p>protected content</p>
                </RequireAccess>
              }
            />
            <Route path="/login" element={<p>login page</p>} />
            <Route path="/mobile-only" element={<p>mobile only page</p>} />
            <Route path="/dashboard" element={<p>dashboard page</p>} />
          </Routes>
        </MemoryRouter>
      </RepositoryProvider>
    </QueryClientProvider>,
  )
}

describe('RequireAccess', () => {
  it('renders protected content for a contractor', async () => {
    renderAt('/projects', 'owner')
    expect(await screen.findByText('protected content')).toBeDefined()
  })

  it('sends a signed-out visitor to login', async () => {
    renderAt('/projects', null)
    expect(await screen.findByText('login page')).toBeDefined()
  })

  it('sends a client to the mobile-only explainer', async () => {
    renderAt('/projects', 'client')
    expect(await screen.findByText('mobile only page')).toBeDefined()
  })

  it('keeps a non-admin out of the admin area', async () => {
    renderAt('/admin', 'owner')
    expect(await screen.findByText('dashboard page')).toBeDefined()
  })

  it('lets a platform admin into the admin area', async () => {
    renderAt('/admin', 'platform_admin')
    expect(await screen.findByText('protected content')).toBeDefined()
  })

  it('shows a loading state before the profile resolves', () => {
    renderAt('/projects', 'owner')
    // Synchronous first paint: session is still pending, so the guard must not
    // decide yet — deciding here would bounce a logged-in user to /login.
    expect(screen.getByRole('status')).toBeDefined()
  })
})
