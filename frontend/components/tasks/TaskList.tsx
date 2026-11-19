'use client'

import { Button } from '@/components/ui/button'
import { TaskRow } from '@/components/tasks/TaskRow'
import { TasksSkeleton } from '@/components/tasks/TasksSkeleton'
import type { Task } from '@/types'

interface TaskListProps {
  tasks: Task[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  hasFilters: boolean
  error: string | null
  onLoadMore: () => void
  onAddFirst: () => void
  onClearFilters: () => void
  onEdit: (task: Task) => void
}

export function TaskList({
  tasks,
  loading,
  loadingMore,
  hasMore,
  hasFilters,
  error,
  onLoadMore,
  onAddFirst,
  onClearFilters,
  onEdit,
}: TaskListProps) {
  if (loading) return <TasksSkeleton />

  return (
    <>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      {tasks.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          {hasFilters ? (
            <>
              <p className="text-sm text-muted-foreground">No tasks match the current filters.</p>
              <Button variant="outline" className="mt-4" onClick={onClearFilters}>
                Clear filters
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">No tasks yet.</p>
              <Button variant="outline" className="mt-4" onClick={onAddFirst}>
                Add the first task
              </Button>
            </>
          )}
        </div>
      ) : (
        <section aria-label="Task list">
          <ul className="rounded-lg border divide-y overflow-hidden">
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} onEdit={onEdit} />
            ))}
          </ul>

          {hasMore && (
            <div className="flex justify-center mt-4">
              <Button variant="outline" size="sm" onClick={onLoadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          )}
        </section>
      )}
    </>
  )
}
