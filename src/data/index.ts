import { supabase, type TypedSupabaseClient } from '../lib/supabase'
import { AuthRepository } from './authRepository'
import { BillingRepository } from './billingRepository'
import { ModuleRepository } from './moduleRepository'
import { OrganizationRepository } from './organizationRepository'
import { ProjectRepository } from './projectRepository'
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
  projects: ProjectRepository
  billing: BillingRepository
}

export function createRepositories(
  client: TypedSupabaseClient = supabase,
): Repositories {
  return {
    auth: new AuthRepository(client),
    profiles: new ProfileRepository(client),
    modules: new ModuleRepository(client),
    organizations: new OrganizationRepository(client),
    projects: new ProjectRepository(client),
    billing: new BillingRepository(client),
  }
}

export { AuthRepository } from './authRepository'
export { BillingRepository } from './billingRepository'
export { ModuleRepository } from './moduleRepository'
export { OrganizationRepository } from './organizationRepository'
export { ProjectRepository } from './projectRepository'
export { ProfileRepository } from './profileRepository'
