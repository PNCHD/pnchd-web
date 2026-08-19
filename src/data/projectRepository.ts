import { supabase, type TypedSupabaseClient } from '../lib/supabase'
import {
  mapProject,
  type Project,
  type ProjectStatus,
} from '../types/project'

/**
 * Must be a single string literal, not a concatenation — supabase-js infers the
 * row type by parsing this at the type level, and a concatenated string widens
 * to `string` and loses inference entirely.
 */
const COLUMNS =
  'id, organization_id, title, description, status, client_id, address, start_date, end_date, created_by, created_at, updated_at' as const

export interface CreateProjectInput {
  organizationId: string
  createdBy: string
  title: string
  description?: string | null
  address?: string | null
  status?: ProjectStatus
}

export class ProjectRepository {
  private readonly client: TypedSupabaseClient

  constructor(client: TypedSupabaseClient = supabase) {
    this.client = client
  }

  /**
   * Explicit column list rather than select('*') — Section 13.3. Keeps the
   * payload predictable and stops a future column from silently widening what
   * ships to the browser.
   *
   * No organization filter: RLS scopes this to the caller's org already, and
   * adding a client-side filter would imply the isolation lives here rather
   * than in the database.
   */
  async list(): Promise<Project[]> {
    const { data, error } = await this.client
      .from('projects')
      .select(COLUMNS)
      .order('updated_at', { ascending: false })

    if (error) throw new Error(`could not load projects: ${error.message}`)
    return (data ?? []).map(mapProject)
  }

  async getById(id: string): Promise<Project | null> {
    const { data, error } = await this.client
      .from('projects')
      .select(COLUMNS)
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(`could not load project: ${error.message}`)
    return data ? mapProject(data) : null
  }

  async create(input: CreateProjectInput): Promise<Project> {
    const { data, error } = await this.client
      .from('projects')
      .insert({
        organization_id: input.organizationId,
        created_by: input.createdBy,
        title: input.title,
        description: input.description ?? null,
        address: input.address ?? null,
        status: input.status ?? 'draft',
      })
      .select(COLUMNS)
      .single()

    if (error) throw new Error(`could not create project: ${error.message}`)
    return mapProject(data)
  }

  async updateStatus(id: string, status: ProjectStatus): Promise<Project> {
    const { data, error } = await this.client
      .from('projects')
      .update({ status })
      .eq('id', id)
      .select(COLUMNS)
      .single()

    if (error) throw new Error(`could not update project: ${error.message}`)
    return mapProject(data)
  }
}
