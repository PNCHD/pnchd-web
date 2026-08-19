import { describe, expect, it } from 'vitest'

import type { Project, ProjectStatus } from '../../types/project'
import { filterLabel, filterProjects } from './filterProjects'

function project(id: string, status: ProjectStatus): Project {
  return {
    id,
    organizationId: 'o1',
    title: `Project ${id}`,
    description: null,
    status,
    clientId: null,
    address: null,
    startDate: null,
    endDate: null,
    createdBy: 'u1',
    createdAt: '2026-08-16T00:00:00Z',
    updatedAt: '2026-08-16T00:00:00Z',
  }
}

const all: Project[] = [
  project('a', 'draft'),
  project('b', 'active'),
  project('c', 'on_hold'),
  project('d', 'completed'),
  project('e', 'archived'),
]

const ids = (projects: Project[]) => projects.map((p) => p.id)

describe('filterProjects', () => {
  it('"open" covers draft, active, and on hold', () => {
    expect(ids(filterProjects(all, 'open'))).toEqual(['a', 'b', 'c'])
  })

  it('"open" excludes completed and archived', () => {
    const result = filterProjects(all, 'open')
    expect(result.some((p) => p.status === 'completed')).toBe(false)
    expect(result.some((p) => p.status === 'archived')).toBe(false)
  })

  it('"all" returns everything', () => {
    expect(ids(filterProjects(all, 'all'))).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  it('"all" does not hand back the caller\'s array', () => {
    // Guards against a caller sorting the result in place and mutating state.
    expect(filterProjects(all, 'all')).not.toBe(all)
  })

  it('a specific status returns only that status', () => {
    expect(ids(filterProjects(all, 'completed'))).toEqual(['d'])
    expect(ids(filterProjects(all, 'archived'))).toEqual(['e'])
  })

  it('returns empty rather than throwing when nothing matches', () => {
    expect(filterProjects([project('a', 'draft')], 'completed')).toEqual([])
  })
})

describe('filterLabel', () => {
  it('names the synthetic filters', () => {
    expect(filterLabel('open')).toBe('Open')
    expect(filterLabel('all')).toBe('All')
  })

  it('uses the human label for a status, not the raw enum value', () => {
    expect(filterLabel('on_hold')).toBe('On hold')
  })
})
