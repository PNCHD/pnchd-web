import type { SupabaseClient } from '@supabase/supabase-js'

import { supabase } from '../lib/supabase'

export class ModuleRepository {
  private readonly client: SupabaseClient

  constructor(client: SupabaseClient = supabase) {
    this.client = client
  }

  /**
   * Active module keys for an org. UI-level gating only (Section 4.3) — RLS via
   * has_active_module() is the actual security boundary.
   */
  async fetchActiveModuleKeys(organizationId: string): Promise<string[]> {
    const { data, error } = await this.client
      .from('module_subscriptions')
      .select('module_key')
      .eq('organization_id', organizationId)
      .eq('is_active', true)

    if (error) throw new Error(`module lookup failed: ${error.message}`)
    return (data ?? []).map((row) => row.module_key as string)
  }
}
