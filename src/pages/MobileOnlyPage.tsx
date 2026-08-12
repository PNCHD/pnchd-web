/**
 * Where clients and drivers land. They have no web surface (Section 10.3) until
 * the client_portal roadmap module ships, so this explains why rather than
 * bouncing them somewhere else they also can't use.
 */
export function MobileOnlyPage() {
  return (
    <div className="bg-app-bg flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-navy text-2xl font-bold">Use the PNCHD app</h1>
        <span className="bg-brand-red mx-auto mt-3 block h-1 w-12 rounded-full" />
        <p className="text-navy/70 mt-5 text-sm">
          Your account works in the PNCHD mobile app, where you can review
          projects, sign documents, and pay invoices. The web dashboard is for
          contractor accounts.
        </p>
        <a
          href="https://pnchd.app"
          className="bg-navy mt-6 inline-block rounded-md px-5 py-2.5 text-sm font-semibold text-white"
        >
          Get the app
        </a>
      </div>
    </div>
  )
}
