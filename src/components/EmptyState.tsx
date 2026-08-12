import type { ReactNode } from 'react'

/** Placeholder body for routes whose real content isn't built yet. */
export function EmptyState({
  message,
  children,
}: {
  message: string
  children?: ReactNode
}) {
  return (
    <div className="border-navy/10 bg-white/40 rounded-lg border border-dashed p-10 text-center">
      <p className="text-navy/60 text-sm">{message}</p>
      {children}
    </div>
  )
}
