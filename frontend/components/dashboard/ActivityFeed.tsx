import { timeAgo } from '@/lib/utils'
import type { ActivityLog } from '@/types'

const STATUS_LABEL: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
}

const PRIORITY_LABEL: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function describeAction(log: ActivityLog): { verb: string; detail: string | null } {
  const p = log.payload as Record<string, string>

  if (log.action === 'task.created') {
    return { verb: 'created task', detail: p.title ?? null }
  }

  if (log.action === 'task.deleted') {
    return { verb: 'deleted task', detail: p.title ?? null }
  }

  if (log.action === 'task.updated') {
    const parts: string[] = []
    if (p.status)   parts.push(`status → ${STATUS_LABEL[p.status] ?? p.status}`)
    if (p.priority) parts.push(`priority → ${PRIORITY_LABEL[p.priority] ?? p.priority}`)
    if (p.due_date) parts.push(`due ${fmtDate(p.due_date)}`)
    if (p.title)    parts.push(`renamed to "${p.title}"`)
    if (p.assignee_id) parts.push('reassigned')

    const shown = parts.slice(0, 2)
    const rest  = parts.length - shown.length
    const detail = rest > 0
      ? `${shown.join(', ')} +${rest} more`
      : shown.join(', ')
    return { verb: 'updated task', detail: detail || null }
  }

  return { verb: log.action, detail: null }
}

interface ActivityFeedProps {
  items: ActivityLog[]
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No recent activity.</p>
  }

  return (
    <ol aria-label="Recent activity" className="divide-y">
      {items.map((log) => {
        const name = log.causer?.name ?? 'Someone'
        const { verb, detail } = describeAction(log)
        return (
          <li key={log.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <span
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold select-none"
              aria-hidden="true"
            >
              {getInitials(name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug">
                <span className="font-medium">{name}</span>
                {' '}
                <span className="text-muted-foreground">{verb}</span>
                {detail && (
                  <span className="text-foreground">
                    {' '}<span className="font-medium">{detail}</span>
                  </span>
                )}
              </p>
              <time
                dateTime={log.created_at}
                className="text-xs text-muted-foreground"
              >
                {timeAgo(log.created_at)}
              </time>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
