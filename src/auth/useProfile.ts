import { useQuery } from '@tanstack/react-query'

import { useRepositories } from '../data/repositoryContext'
import type { Profile } from '../types/profile'
import { useSession } from './useSession'

export interface ProfileState {
  profile: Profile | null
  isLoading: boolean
  error: Error | null
}

/**
 * The signed-in user's profile row. The JWT proves who, not what role — role
 * lives in `profiles` — so this is what every access decision reads.
 *
 * Client-side only for routing and UI. The authoritative check is the one RLS
 * performs inside Postgres on every query.
 */
export function useProfile(): ProfileState {
  const { session, isLoading: sessionLoading } = useSession()
  const { profiles } = useRepositories()
  const userId = session?.user.id ?? null

  const query = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => (userId ? profiles.fetchById(userId) : Promise.resolve(null)),
    enabled: !sessionLoading && userId !== null,
    staleTime: 5 * 60 * 1000,
  })

  // Signed out is a resolved answer, not a pending one — the query is disabled
  // in that case and would otherwise report loading forever.
  if (!sessionLoading && userId === null) {
    return { profile: null, isLoading: false, error: null }
  }

  return {
    profile: query.data ?? null,
    isLoading: sessionLoading || query.isPending,
    error: query.error,
  }
}
