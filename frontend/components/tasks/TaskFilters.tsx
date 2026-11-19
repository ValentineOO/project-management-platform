'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { STATUS_LABELS, PRIORITY_LABELS } from '@/lib/utils'
import type { TaskStatus, TaskPriority, User } from '@/types'

interface TaskFiltersProps {
  filterStatus: TaskStatus | ''
  filterPriority: TaskPriority | ''
  filterAssignee: string
  members: Pick<User, 'id' | 'name'>[]
  hasFilters: boolean
  onStatusChange: (v: TaskStatus | '') => void
  onPriorityChange: (v: TaskPriority | '') => void
  onAssigneeChange: (v: string) => void
  onClear: () => void
}

export function TaskFilters({
  filterStatus,
  filterPriority,
  filterAssignee,
  members,
  hasFilters,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onClear,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={filterStatus} onValueChange={(v) => onStatusChange(v as TaskStatus | '')}>
        <SelectTrigger className="w-36 h-8 text-sm">
          <span className={filterStatus ? undefined : 'text-muted-foreground'}>
            {filterStatus ? STATUS_LABELS[filterStatus as TaskStatus] : 'Status'}
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All statuses</SelectItem>
          {(Object.entries(STATUS_LABELS) as [TaskStatus, string][]).map(([v, label]) => (
            <SelectItem key={v} value={v}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filterPriority} onValueChange={(v) => onPriorityChange(v as TaskPriority | '')}>
        <SelectTrigger className="w-36 h-8 text-sm">
          <span className={filterPriority ? undefined : 'text-muted-foreground'}>
            {filterPriority ? PRIORITY_LABELS[filterPriority as TaskPriority] : 'Priority'}
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All priorities</SelectItem>
          {(Object.entries(PRIORITY_LABELS) as [TaskPriority, string][]).map(([v, label]) => (
            <SelectItem key={v} value={v}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filterAssignee} onValueChange={(v) => onAssigneeChange(v ?? '')}>
        <SelectTrigger className="w-40 h-8 text-sm">
          <span className={filterAssignee ? undefined : 'text-muted-foreground'}>
            {filterAssignee
              ? (members.find((m) => String(m.id) === filterAssignee)?.name ?? 'Assignee')
              : 'Assignee'}
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All assignees</SelectItem>
          {members.map((m) => (
            <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground"
          onClick={onClear}
        >
          <X size={14} className="mr-1" aria-hidden="true" />
          Clear
        </Button>
      )}
    </div>
  )
}
