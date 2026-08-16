import type { SupabaseClient } from '@supabase/supabase-js'

import { supabase } from '../lib/supabase'
import { AuthRepository } from './authRepository'
import { ModuleRepository } from './moduleRepository'
import { OrganizationRepository } from './organizationRepository'
import { ProfileRepository } from './profileRepository'

/**
 * The data layer's public surface. Consumers depend on this interface, never on
 * a concrete repository or on supabase-js directly, so the whole layer can be
 * substituted in tests or swapped for a different backend.
 */
export interface Repositories {
  auth: AuthRepository
  profiles: ProfileRepository
  modules: ModuleRepository
  organizations: OrganizationRepository
}

export function createRepositories(
  client: SupabaseClient = supabase,
): Repositories {
  return {
    auth: new AuthRepository(client),
    profiles: new ProfileRepository(client),
    modules: new ModuleRepository(client),
    organizations: new OrganizationRepository(client),
  }
}

export { AuthRepository } from './authRepository'
export { ModuleRepository } from './moduleRepository'
export { OrganizationRepository } from './organizationRepository'
export { ProfileRepository } from './profileRepository'
