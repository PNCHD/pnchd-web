import type { ReactNode } from 'react'

/**
 * Standard page frame: title, optional action slot, content area. Every page
 * uses this rather than repeating heading markup, so spacing and type scale
 * stay consistent and a change lands in one place.
 */
export function PageShell({
  title,
  description,
  actions,
  children,
}: {
  title: string
  description?: string
  actions?: ReactNode
  children?: ReactNode
}) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-8">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-navy text-2xl font-bold">{title}</h1>
          {description && <p className="text-navy/60 mt-1 text-sm">{description}</p>}
        </div>
        {actions}
      </header>
      {children}
    </section>
  )
}
