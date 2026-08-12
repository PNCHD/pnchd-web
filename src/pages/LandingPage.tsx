import { Link } from 'react-router-dom'

export function LandingPage() {
  return (
    <div className="bg-app-bg min-h-screen">
      <main className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-24 text-center">
        <h1 className="text-navy text-4xl font-bold tracking-tight sm:text-5xl">PNCHD</h1>
        <span className="bg-brand-red mt-4 h-1 w-16 rounded-full" />
        <p className="text-navy/70 mt-6 text-lg">
          Contractor management that bills only for what you use. Add and remove
          modules any time — client and driver accounts are always free.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/signup"
            className="bg-navy rounded-md px-5 py-2.5 text-sm font-semibold text-white"
          >
            Start 30-day free trial
          </Link>
          <Link
            to="/pricing"
            className="border-navy/20 text-navy rounded-md border px-5 py-2.5 text-sm font-semibold"
          >
            See pricing
          </Link>
        </div>
        <p className="text-navy/50 mt-4 text-xs">No credit card required.</p>
      </main>
    </div>
  )
}
