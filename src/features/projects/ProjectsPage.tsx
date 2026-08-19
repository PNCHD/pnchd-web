import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { EmptyState } from '../../components/EmptyState'
import { PageShell } from '../../components/PageShell'
import { StatusBadge } from '../../components/StatusBadge'
import { PROJECT_STATUSES } from '../../types/project'
import {
  filterLabel,
  filterProjects,
  type ProjectFilter,
} from './filterProjects'
import { NewProjectDialog } from './NewProjectDialog'
import { useProjects } from './useProjects'

export function ProjectsPage() {
  const { projects, isLoading, error } = useProjects()
  const [filter, setFilter] = useState<ProjectFilter>('open')
  const [isCreating, setIsCreating] = useState(false)

  const visible = useMemo(() => filterProjects(projects, filter), [projects, filter])

  return (
    <PageShell
      title="Projects"
      description="Everything your team is working on."
      actions={
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="bg-navy rounded-md px-4 py-2 text-sm font-semibold text-white"
        >
          New project
        </button>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {(['open', 'all', ...PROJECT_STATUSES] as ProjectFilter[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFilter(option)}
            aria-pressed={filter === option}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              filter === option
                ? 'bg-navy text-white'
                : 'border-navy/15 text-navy/70 border'
            }`}
          >
            {filterLabel(option)}
          </button>
        ))}
      </div>

      {error ? (
        <EmptyState message={`Could not load projects. ${error.message}`} />
      ) : isLoading ? (
        <EmptyState message="Loading projects…" />
      ) : visible.length === 0 ? (
        <EmptyState
          message={
            projects.length === 0
              ? 'No projects yet. Create your first one to get started.'
              : 'No projects match this filter.'
          }
        />
      ) : (
        <ul className="divide-navy/10 border-navy/10 divide-y overflow-hidden rounded-lg border bg-white">
          {visible.map((project) => (
            <li key={project.id}>
              <Link
                to={`/projects/${project.id}`}
                className="hover:bg-app-bg flex flex-wrap items-center justify-between gap-2 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-navy truncate font-medium">{project.title}</p>
                  {project.address && (
                    <p className="text-navy/50 truncate text-sm">{project.address}</p>
                  )}
                </div>
                <StatusBadge status={project.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {isCreating && <NewProjectDialog onClose={() => setIsCreating(false)} />}
    </PageShell>
  )
}
