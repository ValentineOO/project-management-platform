import { Badge } from '@/components/ui/badge'
import { cn, STATUS_LABELS, PRIORITY_LABELS, PRIORITY_COLORS, STATUS_COLORS, formatDate, isOverdue } from '@/lib/utils'
import type { Task } from '@/types'

interface TaskRowProps {
  task: Task
  onEdit: (task: Task) => void
}

export function TaskRow({ task, onEdit }: TaskRowProps) {
  const overdue = isOverdue(task.due_date ?? null)

  return (
    <li>
      <button
        type="button"
        onClick={() => onEdit(task)}
        className={cn(
          'w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/50 focus-visible:outline-none focus-visible:bg-muted/50 transition-colors',
        )}
        aria-label={`Edit task: ${task.title}`}
      >
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className={cn('text-sm font-medium truncate', task.status === 'done' && 'line-through text-muted-foreground')}>
            {task.title}
          </p>
          {task.due_date && (
            <p className={cn('text-xs', overdue ? 'text-destructive' : 'text-muted-foreground')}>
              Due {formatDate(task.due_date)}
              {overdue && ' — overdue'}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant="secondary"
            className={cn('text-xs', PRIORITY_COLORS[task.priority])}
          >
            {PRIORITY_LABELS[task.priority]}
          </Badge>
          <Badge
            variant="secondary"
            className={cn('text-xs', STATUS_COLORS[task.status])}
          >
            {STATUS_LABELS[task.status]}
          </Badge>
        </div>
      </button>
    </li>
  )
}
