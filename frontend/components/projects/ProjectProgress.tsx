import { cn } from '@/lib/utils'
import type { User } from '@/types'

const STATUS_ORDER = ['todo', 'in_progress', 'in_review', 'done'] as const
const STATUS_LABEL: Record<string, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  in_review: 'In review',
  done: 'Done',
}
const STATUS_BAR_COLOR: Record<string, string> = {
  todo: 'bg-muted-foreground/30',
  in_progress: 'bg-blue-500',
  in_review: 'bg-amber-500',
  done: 'bg-emerald-500',
}

interface ProjectProgressProps {
  stats: Record<string, number>
  members: Pick<User, 'id' | 'name'>[]
}

export function ProjectProgress({ stats, members }: ProjectProgressProps) {
  const total = Object.values(stats).reduce((a, b) => a + b, 0)
  const done = stats['done'] ?? 0
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Progress</span>
          <span className="text-muted-foreground tabular-nums">{done}/{total} done</span>
        </div>

        {/* stacked progress bar */}
        <div
          className="flex h-2 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${pct}% complete`}
        >
          {total > 0 && STATUS_ORDER.map((s) => {
            const count = stats[s] ?? 0
            if (count === 0) return null
            return (
              <div
                key={s}
                className={cn('h-full', STATUS_BAR_COLOR[s])}
                style={{ width: `${(count / total) * 100}%` }}
              />
            )
          })}
        </div>

        <dl className="flex flex-wrap gap-x-4 gap-y-1">
          {STATUS_ORDER.map((s) => {
            const count = stats[s] ?? 0
            return (
              <div key={s} className="flex items-center gap-1.5 text-xs">
                <span className={cn('inline-block h-2 w-2 rounded-sm', STATUS_BAR_COLOR[s])} aria-hidden="true" />
                <dt className="text-muted-foreground">{STATUS_LABEL[s]}</dt>
                <dd className="font-medium tabular-nums">{count}</dd>
              </div>
            )
          })}
        </dl>
      </div>

      {members.length > 0 && (
        <div className="space-y-1.5 pt-1 border-t">
          <p className="text-xs font-medium text-muted-foreground">Members</p>
          <ul className="flex flex-wrap gap-1.5">
            {members.map((m) => (
              <li
                key={m.id}
                className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium"
              >
                {m.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
