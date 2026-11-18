import api from '@/lib/api'
import type { Task, CursorPaginatedResponse } from '@/types'

export async function fetchProjectTasks(
  projectId: number,
  cursor?: string,
): Promise<CursorPaginatedResponse<Task>> {
  const { data } = await api.get<CursorPaginatedResponse<Task>>(
    `/api/projects/${projectId}/tasks`,
    { params: cursor ? { cursor } : undefined },
  )
  return data
}

export async function fetchTask(taskId: number): Promise<Task> {
  const { data } = await api.get<{ task: Task }>(`/api/tasks/${taskId}`)
  return data.task
}

export async function createTask(
  projectId: number,
  payload: {
    title: string
    description?: string | null
    status?: string
    priority?: string
    assignee_id?: number | null
    due_date?: string | null
  },
): Promise<Task> {
  const { data } = await api.post<{ task: Task }>(`/api/projects/${projectId}/tasks`, payload)
  return data.task
}

export async function updateTask(
  taskId: number,
  payload: {
    version: number
    title?: string
    description?: string | null
    status?: string
    priority?: string
    assignee_id?: number | null
    due_date?: string | null
  },
): Promise<Task> {
  const { data } = await api.patch<{ task: Task }>(`/api/tasks/${taskId}`, payload)
  return data.task
}

export async function deleteTask(taskId: number): Promise<void> {
  await api.delete(`/api/tasks/${taskId}`)
}
