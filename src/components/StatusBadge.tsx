import {
  PROJECT_STATUS_LABELS,
  type ProjectStatus,
} from '../types/project'

/**
 * Colour carries meaning, so it never carries it alone — the label is always
 * present. Colour-only status indicators are unreadable for colour-blind users
 * and invisible to screen readers.
 */
const STYLES: Record<ProjectStatus, string> = {
  draft: 'bg-navy/10 text-navy',
  active: 'bg-emerald-100 text-emerald-800',
  on_hold: 'bg-amber-100 text-amber-800',
  completed: 'bg-navy text-white',
  archived: 'bg-navy/5 text-navy/50',
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      {PROJECT_STATUS_LABELS[status]}
    </span>
  )
}
