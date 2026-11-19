'use client'

import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { ProjectHeader } from '@/components/projects/ProjectHeader'
import { ProjectProgress } from '@/components/projects/ProjectProgress'
import { TaskFilters } from '@/components/tasks/TaskFilters'
import { TaskList } from '@/components/tasks/TaskList'
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal'
import { EditTaskModal } from '@/components/tasks/EditTaskModal'
import { TasksSkeleton } from '@/components/tasks/TasksSkeleton'
import { useTasks } from '@/hooks/useTasks'
import { useProject } from '@/hooks/useProject'
import { useTaskFilters } from '@/hooks/useTaskFilters'
import type { Task } from '@/types'

interface ProjectDetailClientProps {
  projectId: number
}

export function ProjectDetailClient({ projectId }: ProjectDetailClientProps) {
  const { project, members, taskStats, loading: loadingProject } = useProject(projectId)
  const { filters, filterStatus, filterPriority, filterAssignee, hasFilters,
          setFilterStatus, setFilterPriority, setFilterAssignee, clearFilters } =
    useTaskFilters()
  const { tasks, loading, loadingMore, error, hasMore, loadMore, createTask, updateTask } =
    useTasks(projectId, filters)

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)

  const liveStats: Record<string, number> = loading
    ? taskStats
    : tasks.reduce<Record<string, number>>((acc, t) => {
        acc[t.status] = (acc[t.status] ?? 0) + 1
        return acc
      }, {})

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
      <ProjectHeader
        project={project}
        onAddTask={() => setShowCreate(true)}
      />

      <ProjectProgress stats={liveStats} members={members} />

      <TaskFilters
        filterStatus={filterStatus}
        filterPriority={filterPriority}
        filterAssignee={filterAssignee}
        members={members}
        hasFilters={hasFilters}
        onStatusChange={setFilterStatus}
        onPriorityChange={setFilterPriority}
        onAssigneeChange={setFilterAssignee}
        onClear={clearFilters}
      />

      <TaskList
        tasks={tasks}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        hasFilters={hasFilters}
        error={error}
        onLoadMore={loadMore}
        onAddFirst={() => setShowCreate(true)}
        onClearFilters={clearFilters}
        onEdit={setEditing}
      />

      <CreateTaskModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        members={members}
        onCreate={createTask}
      />

      {editing && (
        <EditTaskModal
          open
          onClose={() => setEditing(null)}
          task={editing}
          members={members}
          onUpdate={updateTask}
        />
      )}
    </div>
  )
}
