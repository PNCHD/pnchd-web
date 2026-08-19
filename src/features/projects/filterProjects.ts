import {
  isOpen,
  PROJECT_STATUS_LABELS,
  type Project,
  type ProjectStatus,
} from '../../types/project'

export type ProjectFilter = 'open' | 'all' | ProjectStatus

export function filterProjects(
  projects: readonly Project[],
  filter: ProjectFilter,
): Project[] {
  if (filter === 'all') return [...projects]
  if (filter === 'open') return projects.filter(isOpen)
  return projects.filter((project) => project.status === filter)
}

export function filterLabel(filter: ProjectFilter): string {
  if (filter === 'open') return 'Open'
  if (filter === 'all') return 'All'
  return PROJECT_STATUS_LABELS[filter]
}
