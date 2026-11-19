'use client'

import { useState } from 'react'
import type { TaskFilters } from '@/services/tasks'
import type { TaskStatus, TaskPriority } from '@/types'

export interface TaskFilterState {
  filterStatus: TaskStatus | ''
  filterPriority: TaskPriority | ''
  filterAssignee: string
  hasFilters: boolean
  filters: TaskFilters
  setFilterStatus: (v: TaskStatus | '') => void
  setFilterPriority: (v: TaskPriority | '') => void
  setFilterAssignee: (v: string) => void
  clearFilters: () => void
}

export function useTaskFilters(): TaskFilterState {
  const [filterStatus, setFilterStatus] = useState<TaskStatus | ''>('')
  const [filterPriority, setFilterPriority] = useState<TaskPriority | ''>('')
  const [filterAssignee, setFilterAssignee] = useState<string>('')

  const hasFilters = !!(filterStatus || filterPriority || filterAssignee)

  const filters: TaskFilters = {
    ...(filterStatus ? { status: filterStatus } : {}),
    ...(filterPriority ? { priority: filterPriority } : {}),
    ...(filterAssignee ? { assignee_id: Number(filterAssignee) } : {}),
  }

  function clearFilters() {
    setFilterStatus('')
    setFilterPriority('')
    setFilterAssignee('')
  }

  return {
    filterStatus,
    filterPriority,
    filterAssignee,
    hasFilters,
    filters,
    setFilterStatus,
    setFilterPriority,
    setFilterAssignee,
    clearFilters,
  }
}
