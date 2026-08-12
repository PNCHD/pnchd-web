import { useMemo, type ReactNode } from 'react'

import { createRepositories, type Repositories } from './index'
import { RepositoryContext } from './repositoryContext'

/** Injection point for the data layer. Pass `repositories` to override in tests. */
export function RepositoryProvider({
  repositories,
  children,
}: {
  repositories?: Repositories
  children: ReactNode
}) {
  const value = useMemo(() => repositories ?? createRepositories(), [repositories])
  return (
    <RepositoryContext.Provider value={value}>{children}</RepositoryContext.Provider>
  )
}
