import Link from 'next/link'
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

const ACTION_VERB: Record<string, string> = {
  'task.created': 'created',
  'task.updated': 'updated',
  'task.deleted': 'deleted',
}

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getChanges(log: ActivityLog): string[] {
  const p = log.payload as Record<string, string>
  if (log.action === 'task.created') return p.title ? [p.title] : []
  if (log.action === 'task.deleted') return p.title ? [p.title] : []
  if (log.action !== 'task.updated') return []

  const parts: string[] = []
  if (p.title)       parts.push(`renamed → "${p.title}"`)
  if (p.status)      parts.push(`${STATUS_LABEL[p.status] ?? p.status}`)
  if (p.priority)    parts.push(`${PRIORITY_LABEL[p.priority] ?? p.priority} priority`)
  if (p.due_date)    parts.push(`due ${fmtDate(p.due_date)}`)
  if (p.assignee_id) parts.push('reassigned')
  return parts
}

interface ActivityFeedProps {
  items: ActivityLog[]
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground py-2">No recent activity.</p>
  }

  return (
    <ul className="space-y-1">
      {items.map((log) => {
        const name   = log.causer?.name ?? 'Someone'
        const verb   = ACTION_VERB[log.action] ?? log.action
        const changes = getChanges(log)
        const shown  = changes.slice(0, 2)
        const extra  = changes.length - shown.length

        return (
          <li key={log.id}>
            <Link
              href={`/projects/${log.project_id}`}
              className="group flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/60 transition-colors"
            >
              {/* avatar */}
              <span className="mt-px flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold select-none group-hover:bg-background transition-colors">
                {getInitials(name)}
              </span>

              {/* body */}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm truncate">
                    <span className="font-semibold">{name}</span>
                    <span className="text-muted-foreground font-normal"> {verb} a task</span>
                  </p>
                  <time
                    dateTime={log.created_at}
                    className="shrink-0 text-xs text-muted-foreground tabular-nums"
                  >
                    {timeAgo(log.created_at)}
                  </time>
                </div>
                {shown.length > 0 && (
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">
                    {shown.join(' · ')}
                    {extra > 0 && (
                      <span className="ml-1 text-muted-foreground/60">+{extra} more</span>
                    )}
                  </p>
                )}
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
