import { supabase, type TypedSupabaseClient } from '../lib/supabase'
import { mapProfile, type Profile } from '../types/profile'

/**
 * Mirrors pnchd-mobile/lib/core/data/profile_repository.dart. Client is
 * injectable so tests can supply a fake instead of hitting the network.
 */
export class ProfileRepository {
  // Explicit field rather than a constructor parameter property: the project's
  // tsconfig sets erasableSyntaxOnly, which disallows the shorthand.
  private readonly client: TypedSupabaseClient

  constructor(client: TypedSupabaseClient = supabase) {
    this.client = client
  }

  async fetchById(userId: string): Promise<Profile | null> {
    const { data, error } = await this.client
      .from('profiles')
      .select('id, organization_id, role, full_name, avatar_url, phone, is_active')
      .eq('id', userId)
      .maybeSingle()

    if (error) throw new Error(`profile lookup failed: ${error.message}`)
    return data ? mapProfile(data) : null
  }
}
