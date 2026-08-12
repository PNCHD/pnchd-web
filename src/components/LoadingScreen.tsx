export function LoadingScreen({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      className="bg-app-bg flex min-h-screen items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <p className="text-navy/60 text-sm">{label}</p>
    </div>
  )
}
