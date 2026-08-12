import { createContext, useContext } from 'react'

import type { Repositories } from './index'

export const RepositoryContext = createContext<Repositories | null>(null)

/**
 * Resolves the data layer from context rather than importing a singleton, so a
 * test can wrap a component with fakes and never touch the network.
 */
export function useRepositories(): Repositories {
  const repositories = useContext(RepositoryContext)
  if (!repositories) {
    throw new Error('useRepositories must be used within a RepositoryProvider')
  }
  return repositories
}
