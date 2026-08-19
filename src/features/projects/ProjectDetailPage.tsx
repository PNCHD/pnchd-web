import { Link, useParams } from 'react-router-dom'

import { EmptyState } from '../../components/EmptyState'
import { PageShell } from '../../components/PageShell'
import { StatusBadge } from '../../components/StatusBadge'
import { PROJECT_STATUSES, type ProjectStatus } from '../../types/project'
import { useProject, useUpdateProjectStatus } from './useProjects'

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { project, isLoading, error } = useProject(id)
  const updateStatus = useUpdateProjectStatus()

  if (isLoading) {
    return (
      <PageShell title="Project">
        <EmptyState message="Loading…" />
      </PageShell>
    )
  }

  if (error || !project) {
    // A project outside the caller's org is filtered out by RLS and arrives as
    // null, indistinguishable from one that doesn't exist. That's the correct
    // behaviour — saying "exists but forbidden" would leak that it exists.
    return (
      <PageShell title="Project">
        <EmptyState message="This project doesn't exist, or you don't have access to it.">
          <Link to="/projects" className="text-brand-red mt-3 inline-block text-sm font-semibold">
            Back to projects
          </Link>
        </EmptyState>
      </PageShell>
    )
  }

  return (
    <PageShell
      title={project.title}
      description={project.address ?? undefined}
      actions={<StatusBadge status={project.status} />}
    >
      <div className="border-navy/10 space-y-4 rounded-lg border bg-white p-5">
        <div>
          <h2 className="text-navy text-sm font-semibold">Status</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {PROJECT_STATUSES.map((status: ProjectStatus) => (
              <button
                key={status}
                type="button"
                disabled={status === project.status || updateStatus.isPending}
                onClick={() => updateStatus.mutate({ id: project.id, status })}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  status === project.status
                    ? 'bg-navy text-white'
                    : 'border-navy/15 text-navy/70 border'
                }`}
              >
                {status === project.status ? '✓ ' : ''}
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {project.description && (
          <div>
            <h2 className="text-navy text-sm font-semibold">Description</h2>
            <p className="text-navy/70 mt-1 text-sm">{project.description}</p>
          </div>
        )}
      </div>

      <p className="text-navy/40 mt-4 text-xs">
        Timeline, documents, team, and invoices are not built yet.
      </p>
    </PageShell>
  )
}
