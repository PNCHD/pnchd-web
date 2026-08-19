import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useProfile } from '../../auth/useProfile'
import { useRepositories } from '../../data/repositoryContext'
import type { CreateProjectInput } from '../../data/projectRepository'
import type { Project, ProjectStatus } from '../../types/project'

const PROJECTS_KEY = ['projects'] as const

export function useProjects() {
  const { projects } = useRepositories()
  const { profile, isLoading: profileLoading } = useProfile()

  const query = useQuery({
    queryKey: PROJECTS_KEY,
    queryFn: () => projects.list(),
    // Without an org every row is filtered out by RLS anyway; skipping the
    // request avoids a guaranteed-empty round trip during org setup.
    enabled: !profileLoading && Boolean(profile?.organizationId),
  })

  return {
    projects: query.data ?? [],
    isLoading: profileLoading || query.isPending,
    error: query.error,
  }
}

export function useProject(id: string | undefined) {
  const { projects } = useRepositories()

  const query = useQuery({
    queryKey: ['project', id],
    queryFn: () => (id ? projects.getById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  })

  return { project: query.data ?? null, isLoading: query.isPending, error: query.error }
}

export function useCreateProject() {
  const { projects } = useRepositories()
  const { profile } = useProfile()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: Omit<CreateProjectInput, 'organizationId' | 'createdBy'>) => {
      if (!profile?.organizationId) {
        throw new Error('You need an organization before creating a project.')
      }
      return projects.create({
        ...input,
        organizationId: profile.organizationId,
        createdBy: profile.id,
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROJECTS_KEY }),
  })
}

export function useUpdateProjectStatus() {
  const { projects } = useRepositories()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProjectStatus }) =>
      projects.updateStatus(id, status),
    onSuccess: (updated: Project) => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY })
      queryClient.invalidateQueries({ queryKey: ['project', updated.id] })
    },
  })
}
