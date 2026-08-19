/** Mirrors the `status` check constraint on `projects` (migration 003). */
export const PROJECT_STATUSES = [
  'draft',
  'active',
  'on_hold',
  'completed',
  'archived',
] as const

export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  on_hold: 'On hold',
  completed: 'Completed',
  archived: 'Archived',
}

export interface Project {
  id: string
  organizationId: string
  title: string
  description: string | null
  status: ProjectStatus
  clientId: string | null
  address: string | null
  startDate: string | null
  endDate: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ProjectRow {
  id: string
  organization_id: string
  title: string
  description: string | null
  status: string
  client_id: string | null
  address: string | null
  start_date: string | null
  end_date: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export function isProjectStatus(value: string): value is ProjectStatus {
  return (PROJECT_STATUSES as readonly string[]).includes(value)
}

export function mapProject(row: ProjectRow): Project {
  if (!isProjectStatus(row.status)) {
    // The DB constraint should make this impossible; failing loudly beats
    // rendering an unknown status as if it were valid.
    throw new Error(`Unknown project status: ${row.status}`)
  }
  return {
    id: row.id,
    organizationId: row.organization_id,
    title: row.title,
    description: row.description,
    status: row.status,
    clientId: row.client_id,
    address: row.address,
    startDate: row.start_date,
    endDate: row.end_date,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** Statuses treated as "not finished" for the default list view. */
export const OPEN_STATUSES: readonly ProjectStatus[] = ['draft', 'active', 'on_hold']

export function isOpen(project: Project): boolean {
  return OPEN_STATUSES.includes(project.status)
}
