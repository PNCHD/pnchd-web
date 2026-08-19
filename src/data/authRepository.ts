import type { Session } from '@supabase/supabase-js'

import { supabase, type TypedSupabaseClient } from '../lib/supabase'

export type AuthStateListener = (session: Session | null) => void

/**
 * Wraps Supabase auth so nothing outside the data layer reaches the global
 * client. Without this, `useSession` is untestable — there's no seam to supply
 * a fake session through.
 */
export class AuthRepository {
  private readonly client: TypedSupabaseClient

  constructor(client: TypedSupabaseClient = supabase) {
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

  /**
   * Sends a magic link. Doubles as signup: `shouldCreateUser` provisions the
   * account on first use, so there is no separate register call.
   *
   * `role` goes into user metadata because the handle_new_user trigger reads it
   * when creating the profiles row. It defaults to owner there, but passing it
   * explicitly keeps the intent visible rather than relying on that default.
   *
   * The trigger leaves organization_id NULL — attaching an org is a separate
   * step after first sign-in (see OrganizationRepository).
   */
  async sendMagicLink(email: string, redirectTo: string): Promise<void> {
    const { error } = await this.client.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: true,
        data: { role: 'owner' },
      },
    })
    if (error) throw new Error(error.message)
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut()
    if (error) throw new Error(`sign out failed: ${error.message}`)
  }
}
