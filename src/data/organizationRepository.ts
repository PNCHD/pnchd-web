import { supabase, type TypedSupabaseClient } from '../lib/supabase'

export class OrganizationRepository {
  private readonly client: TypedSupabaseClient

  constructor(client: TypedSupabaseClient = supabase) {
    this.client = client
  }

  /**
   * Creates an organization and attaches the signing-up user to it.
   *
   * Two writes rather than one, and the order is forced by RLS: the insert
   * policy on organizations requires `owner_id = auth.uid()`, and the profile
   * can only point at an org that already exists.
   *
   * Not atomic. If the profile update fails the org row is orphaned, which
   * leaves the user still unattached and able to retry — the safe direction to
   * fail. Making it truly atomic needs a SECURITY DEFINER function doing both
   * in one transaction; worth doing before launch, noted in HANDOFF.
   */
  async createForOwner(params: {
    userId: string
    name: string
  }): Promise<{ organizationId: string }> {
    const { data: org, error: orgError } = await this.client
      .from('organizations')
      .insert({ name: params.name, owner_id: params.userId })
      .select('id')
      .single()

    if (orgError) throw new Error(`could not create organization: ${orgError.message}`)

    const { error: profileError } = await this.client
      .from('profiles')
      .update({ organization_id: org.id })
      .eq('id', params.userId)

    if (profileError) {
      throw new Error(`could not attach profile to organization: ${profileError.message}`)
    }

    return { organizationId: org.id }
  }
}
