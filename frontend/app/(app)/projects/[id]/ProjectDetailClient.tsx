'use client'

import { useState } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TaskRow } from '@/components/tasks/TaskRow'
import { TaskModal } from '@/components/tasks/TaskModal'
import { TasksSkeleton } from '@/components/tasks/TasksSkeleton'
import { useTasks } from '@/hooks/useTasks'
import { useProject } from '@/hooks/useProject'
import type { Task } from '@/types'

interface ProjectDetailClientProps {
  projectId: number
}

export function ProjectDetailClient({ projectId }: ProjectDetailClientProps) {
  const { project, loading: loadingProject } = useProject(projectId)
  const { tasks, loading, loadingMore, error, hasMore, loadMore, createTask, updateTask } =
    useTasks(projectId)

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)

  if (loadingProject) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading project">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
        <TasksSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Projects
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">{project?.name}</h1>
            {project?.description && (
              <p className="text-sm text-muted-foreground">{project.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {project && (
              <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                {project.status}
              </Badge>
            )}
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus size={16} aria-hidden="true" />
              Add task
            </Button>
          </div>
        </div>
      </div>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      {loading ? (
        <TasksSkeleton />
      ) : tasks.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">No tasks yet.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowCreate(true)}>
            Add the first task
          </Button>
        </div>
      ) : (
        <section aria-label="Task list">
          <ul className="rounded-lg border divide-y overflow-hidden">
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} onEdit={setEditing} />
            ))}
          </ul>

          {hasMore && (
            <div className="flex justify-center mt-4">
              <Button variant="outline" size="sm" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          )}
        </section>
      )}

      <TaskModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSave={async (payload) => {
          return createTask(payload)
        }}
      />

      <TaskModal
        open={!!editing}
        onClose={() => setEditing(null)}
        task={editing ?? undefined}
        onSave={async (payload) => {
          if (!editing) return { ok: false }
          return updateTask(editing.id, payload as Parameters<typeof updateTask>[1])
        }}
      />
    </div>
  )
}
