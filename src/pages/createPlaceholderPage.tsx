import { EmptyState } from '../components/EmptyState'
import { PageShell } from '../components/PageShell'

/**
 * Builds a placeholder page. Section 10.2 defines ~18 routes and none have real
 * content yet; without this each would be an identical file differing only by
 * two strings. Replace a call with a real component as each page is built.
 */
export function createPlaceholderPage(title: string, description?: string) {
  function PlaceholderPage() {
    return (
      <PageShell title={title} description={description}>
        <EmptyState message={`${title} is not built yet.`} />
      </PageShell>
    )
  }
  PlaceholderPage.displayName = `${title.replace(/\W+/g, '')}Page`
  return PlaceholderPage
}
