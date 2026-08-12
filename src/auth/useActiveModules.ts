import { useQuery } from '@tanstack/react-query'

import { useRepositories } from '../data/repositoryContext'
import { useProfile } from './useProfile'

/**
 * Active module keys for the signed-in user's org, driving nav visibility.
 * Empty while loading, so nav renders core items first and module-gated ones
 * appear once known — better than flashing every tab then removing some.
 */
export function useActiveModules(): { modules: string[]; isLoading: boolean } {
  const { profile, isLoading: profileLoading } = useProfile()
  const { modules } = useRepositories()
  const organizationId = profile?.organizationId ?? null

  const query = useQuery({
    queryKey: ['activeModules', organizationId],
    queryFn: () =>
      organizationId
        ? modules.fetchActiveModuleKeys(organizationId)
        : Promise.resolve<string[]>([]),
    enabled: !profileLoading && organizationId !== null,
    staleTime: 5 * 60 * 1000,
  })

  if (!profileLoading && organizationId === null) {
    return { modules: [], isLoading: false }
  }

  return { modules: query.data ?? [], isLoading: profileLoading || query.isPending }
}
