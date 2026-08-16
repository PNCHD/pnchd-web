import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { useRepositories } from '../data/repositoryContext'

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'error'; message: string }

/**
 * Magic-link sign-in. Also the signup path — `shouldCreateUser` provisions the
 * account on first use, so a new contractor and a returning one take the same
 * route. What differs is what happens after: a new user has no organization
 * yet and gets routed to setup by resolveAccess.
 */
export function LoginPage() {
  const { auth } = useRepositories()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return

    setStatus({ kind: 'sending' })
    try {
      await auth.sendMagicLink(trimmed, `${window.location.origin}/dashboard`)
      setStatus({ kind: 'sent' })
    } catch (error) {
      setStatus({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Could not send the link.',
      })
    }
  }

  if (status.kind === 'sent') {
    return (
      <AuthFrame title="Check your email">
        <p className="text-navy/70 text-sm">
          We sent a sign-in link to <strong className="text-navy">{email}</strong>.
          Open it on this device to continue.
        </p>
        <button
          type="button"
          onClick={() => setStatus({ kind: 'idle' })}
          className="text-brand-red mt-6 text-sm font-semibold"
        >
          Use a different email
        </button>
      </AuthFrame>
    )
  }

  return (
    <AuthFrame title="Sign in to PNCHD">
      <p className="text-navy/60 mb-6 text-sm">
        We'll email you a link — no password needed. New here? This creates your
        account.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <label htmlFor="email" className="text-navy block text-sm font-medium">
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          className="border-navy/20 focus:border-navy w-full rounded-md border px-3 py-2 text-sm outline-none"
        />
        {status.kind === 'error' && (
          <p role="alert" className="text-brand-red text-sm">
            {status.message}
          </p>
        )}
        <button
          type="submit"
          disabled={status.kind === 'sending'}
          className="bg-navy w-full rounded-md px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {status.kind === 'sending' ? 'Sending…' : 'Email me a sign-in link'}
        </button>
      </form>
    </AuthFrame>
  )
}

function AuthFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-app-bg flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="text-navy text-xl font-bold">
          PNCHD
        </Link>
        <span className="bg-brand-red mt-3 mb-6 block h-1 w-12 rounded-full" />
        <h1 className="text-navy mb-2 text-xl font-bold">{title}</h1>
        {children}
      </div>
    </div>
  )
}
