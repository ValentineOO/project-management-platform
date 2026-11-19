'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  fetchProjectTasks,
  createTask as createTaskService,
  updateTask as updateTaskService,
  deleteTask as deleteTaskService,
  type TaskFilters,
} from '@/services/tasks'
import { extractApiErrors } from '@/lib/utils'
import type { Task } from '@/types'

export interface TaskConflict {
  current: Task
}

export function useTasks(projectId: number, filters: TaskFilters = {}) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const projectIdRef = useRef(projectId)
  projectIdRef.current = projectId

  const filtersKey = JSON.stringify(filters)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const page = await fetchProjectTasks(projectId, undefined, filters)
      setTasks(page.data)
      setNextCursor(page.next_cursor ?? null)
    } catch {
      setError('Failed to load tasks.')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, filtersKey])

  useEffect(() => { load() }, [load])

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const page = await fetchProjectTasks(projectId, nextCursor, filters)
      setTasks((prev) => [...prev, ...page.data])
      setNextCursor(page.next_cursor ?? null)
    } finally {
      setLoadingMore(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, nextCursor, loadingMore, filtersKey])

  const createTask = useCallback(
    async (payload: Parameters<typeof createTaskService>[1]) => {
      try {
        const task = await createTaskService(projectId, payload)
        setTasks((prev) => [task, ...prev])
        toast.success('Task created')
        return { ok: true as const }
      } catch (err) {
        toast.error('Failed to create task')
        return { ok: false as const, errors: extractApiErrors(err) }
      }
    },
    [projectId],
  )

  const updateTask = useCallback(
    async (taskId: number, payload: Parameters<typeof updateTaskService>[1]) => {
      try {
        const updated = await updateTaskService(taskId, payload)
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)))
        toast.success('Task updated')
        return { ok: true as const }
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number; data?: { current?: Task } } })
          ?.response?.status
        if (status === 409) {
          const current = (err as { response: { data: { current: Task } } }).response.data.current
          toast.warning('Update conflict — this task was modified by someone else')
          return { ok: false as const, conflict: { current } as TaskConflict }
        }
        toast.error('Failed to update task')
        return { ok: false as const, errors: extractApiErrors(err) }
      }
    },
    [],
  )

  const deleteTask = useCallback(async (taskId: number) => {
    try {
      await deleteTaskService(taskId)
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
      toast.success('Task deleted')
      return { ok: true as const }
    } catch (err) {
      toast.error('Failed to delete task')
      return { ok: false as const, errors: extractApiErrors(err) }
    }
  }, [])

  return {
    tasks,
    loading,
    loadingMore,
    error,
    hasMore: !!nextCursor,
    load,
    loadMore,
    createTask,
    updateTask,
    deleteTask,
  }
}
