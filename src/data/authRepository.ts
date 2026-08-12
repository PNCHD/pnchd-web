import type { Session, SupabaseClient } from '@supabase/supabase-js'

import { supabase } from '../lib/supabase'

export type AuthStateListener = (session: Session | null) => void

/**
 * Wraps Supabase auth so nothing outside the data layer reaches the global
 * client. Without this, `useSession` is untestable — there's no seam to supply
 * a fake session through.
 */
export class AuthRepository {
  private readonly client: SupabaseClient

  constructor(client: SupabaseClient = supabase) {
    this.client = client
  }

  async getSession(): Promise<Session | null> {
    const { data } = await this.client.auth.getSession()
    return data.session
  }

  /** Returns an unsubscribe function. */
  onAuthStateChange(listener: AuthStateListener): () => void {
    const { data } = this.client.auth.onAuthStateChange((_event, session) => {
      listener(session)
    })
    return () => data.subscription.unsubscribe()
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut()
    if (error) throw new Error(`sign out failed: ${error.message}`)
  }
}
