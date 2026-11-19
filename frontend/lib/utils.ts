export { cn } from 'cn'

import type { TaskPriority, TaskStatus } from '@/types'

export function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dueDate) < today
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(iso)
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'text-slate-500 bg-slate-100',
  medium: 'text-blue-700 bg-blue-100',
  high: 'text-orange-700 bg-orange-100',
  urgent: 'text-red-700 bg-red-100',
}

export const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: 'text-slate-600 bg-slate-100',
  in_progress: 'text-indigo-700 bg-indigo-100',
  in_review: 'text-amber-700 bg-amber-100',
  done: 'text-emerald-700 bg-emerald-100',
}

export function extractApiErrors(err: unknown): Record<string, string> {
  if (
    err &&
    typeof err === 'object' &&
    'response' in err &&
    err.response &&
    typeof err.response === 'object' &&
    'data' in err.response
  ) {
    const data = err.response.data as { errors?: Record<string, string[]>; message?: string }
    if (data.errors) {
      return Object.fromEntries(
        Object.entries(data.errors).map(([k, v]) => [k, v[0]])
      )
    }
    if (data.message) return { _root: data.message }
  }
  return { _root: 'An unexpected error occurred.' }
}
