import { formatDate } from '@/lib/utils'
import type { ActivityLog } from '@/types'

const ACTION_LABELS: Record<string, string> = {
  'task.created': 'created a task',
  'task.updated': 'updated a task',
  'task.deleted': 'deleted a task',
}

interface ActivityFeedProps {
  items: ActivityLog[]
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No recent activity.</p>
  }

  return (
    <ol aria-label="Recent activity" className="space-y-3">
      {items.map((log) => (
        <li key={log.id} className="flex gap-3 text-sm">
          <div
            className="mt-0.5 h-2 w-2 flex-none rounded-full bg-primary"
            aria-hidden="true"
          />
          <div>
            <span className="font-medium">{log.causer?.name ?? 'Someone'}</span>
            {' '}
            <span className="text-muted-foreground">
              {ACTION_LABELS[log.action] ?? log.action}
            </span>
            <time
              dateTime={log.created_at}
              className="ml-2 text-xs text-muted-foreground"
            >
              {formatDate(log.created_at)}
            </time>
          </div>
        </li>
      ))}
    </ol>
  )
}
