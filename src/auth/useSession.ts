import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'

import { useRepositories } from '../data/repositoryContext'

export interface SessionState {
  session: Session | null
  /** True until the initial session has been resolved from storage. */
  isLoading: boolean
}

/**
 * Tracks the Supabase session via the auth repository, so tests can inject a
 * fake rather than reaching the global client.
 *
 * `isLoading` matters: on first paint the session is still being read from
 * localStorage, and treating "not yet known" as "signed out" would bounce a
 * logged-in user to /login on every refresh.
 */
export function useSession(): SessionState {
  const { auth } = useRepositories()
  const [state, setState] = useState<SessionState>({ session: null, isLoading: true })

  useEffect(() => {
    let active = true

    auth.getSession().then((session) => {
      if (active) setState({ session, isLoading: false })
    })

    const unsubscribe = auth.onAuthStateChange((session) => {
      if (active) setState({ session, isLoading: false })
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [auth])

  return state
}
