import Link from 'next/link'
import { timeAgo } from '@/lib/utils'
import type { ActivityLog } from '@/types'

// ── label maps ──────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done',
}
const PRIORITY_LABEL: Record<string, string> = {
  low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent',
}
const PROJECT_STATUS_LABEL: Record<string, string> = {
  active: 'Active', completed: 'Completed', archived: 'Archived',
}

// ── sentence builders ────────────────────────────────────────────────────────

function describe(log: ActivityLog): { verb: string; subject: string; detail?: string } {
  const p = log.payload as Record<string, string>

  switch (log.action) {
    // task
    case 'task.created':
      return { verb: 'created task', subject: p.title ?? 'a task' }
    case 'task.deleted':
      return { verb: 'deleted task', subject: p.title ?? 'a task' }
    case 'task.updated': {
      const parts: string[] = []
      if (p.title)       parts.push(`renamed → "${p.title}"`)
      if (p.status)      parts.push(STATUS_LABEL[p.status] ?? p.status)
      if (p.priority)    parts.push(`${PRIORITY_LABEL[p.priority] ?? p.priority} priority`)
      if (p.due_date)    parts.push(`due ${fmtDate(p.due_date)}`)
      if (p.assignee_id) parts.push('reassigned')
      return { verb: 'updated task', subject: '', detail: parts.slice(0, 3).join(' · ') || undefined }
    }

    // project
    case 'project.created':
      return { verb: 'created project', subject: p.name ?? '' }
    case 'project.deleted':
      return { verb: 'deleted project', subject: p.name ?? '' }
    case 'project.updated': {
      const parts: string[] = []
      if (p.name && p.name !== p.name) parts.push(`renamed → "${p.name}"`)
      if (p.status) parts.push(`marked ${PROJECT_STATUS_LABEL[p.status] ?? p.status}`)
      return { verb: 'updated project', subject: p.name ?? '', detail: parts.join(' · ') || undefined }
    }

    // team
    case 'team.created':
      return { verb: 'created team', subject: p.name ?? '' }
    case 'team.deleted':
      return { verb: 'deleted team', subject: p.name ?? '' }
    case 'team.updated':
      return { verb: 'updated team', subject: p.name ?? '' }
    case 'team.member_added':
      return { verb: 'added', subject: p.member_name ?? 'a member', detail: p.member_email }
    case 'team.member_removed':
      return { verb: 'removed', subject: p.member_name ?? 'a member', detail: 'from team' }

    default:
      return { verb: log.action.replace('.', ' '), subject: '' }
  }
}

function linkFor(log: ActivityLog): string {
  if (log.project_id) return `/projects/${log.project_id}`
  if (log.subject_type?.endsWith('Team')) return `/teams/${log.subject_id}`
  return '#'
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

// ── component ────────────────────────────────────────────────────────────────

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
        const name = log.causer?.name ?? 'Someone'
        const { verb, subject, detail } = describe(log)
        const href = linkFor(log)

        return (
          <li key={log.id}>
            <Link
              href={href}
              className="group flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/60 transition-colors"
            >
              <span className="mt-px flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold select-none group-hover:bg-background transition-colors">
                {getInitials(name)}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm truncate">
                    <span className="font-semibold">{name}</span>
                    <span className="text-muted-foreground"> {verb}</span>
                    {subject && (
                      <span className="font-medium"> {subject}</span>
                    )}
                  </p>
                  <time
                    dateTime={log.created_at}
                    className="shrink-0 text-xs text-muted-foreground tabular-nums"
                  >
                    {timeAgo(log.created_at)}
                  </time>
                </div>
                {detail && (
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">{detail}</p>
                )}
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
