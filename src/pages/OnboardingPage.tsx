import { useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'

import { useProfile } from '../auth/useProfile'
import { useRepositories } from '../data/repositoryContext'

/**
 * Org setup, shown once between first sign-in and having a usable account. The
 * handle_new_user trigger creates the profile with organization_id NULL and the
 * signup flow fills it in — this is that step.
 *
 * Stripe subscription creation belongs here too (Section 10.2: signup starts
 * the 30-day trial). Not wired yet — no Stripe keys — so a contractor lands in
 * the app with an org but no subscription record. Tracked in HANDOFF.
 */
export function OnboardingPage() {
  const { profile } = useProfile()
  const { organizations } = useRepositories()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || !profile) return

    setIsSubmitting(true)
    setError(null)
    try {
      await organizations.createForOwner({ userId: profile.id, name: trimmed })
      // The cached profile still has organization_id null; invalidate so the
      // route guard re-evaluates and releases us to the dashboard.
      await queryClient.invalidateQueries({ queryKey: ['profile'] })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not create your business.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-app-bg flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <span className="text-navy text-xl font-bold">PNCHD</span>
        <span className="bg-brand-red mt-3 mb-6 block h-1 w-12 rounded-full" />
        <h1 className="text-navy mb-2 text-xl font-bold">Name your business</h1>
        <p className="text-navy/60 mb-6 text-sm">
          This is what your clients will see on proposals, invoices, and
          documents. You can change it later.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <label htmlFor="orgName" className="text-navy block text-sm font-medium">
            Business name
          </label>
          <input
            id="orgName"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Acme Contracting"
            className="border-navy/20 focus:border-navy w-full rounded-md border px-3 py-2 text-sm outline-none"
          />
          {error && (
            <p role="alert" className="text-brand-red text-sm">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-navy w-full rounded-md px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSubmitting ? 'Setting up…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
