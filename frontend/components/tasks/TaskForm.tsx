'use client'

import { useId } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { STATUS_LABELS, PRIORITY_LABELS } from '@/lib/utils'
import type { TaskStatus, TaskPriority, User } from '@/types'

export interface TaskFormValues {
  title: string
  description?: string | null
  status: string
  priority: string
  assignee_id?: number | null
  due_date?: string | null
}

interface TaskFormProps {
  defaultValues?: Partial<TaskFormValues>
  members?: Pick<User, 'id' | 'name'>[]
  errors?: Record<string, string>
  submitting?: boolean
  disabled?: boolean
  submitLabel: string
  onSubmit: (values: TaskFormValues) => void
  onCancel: () => void
}

export function TaskForm({
  defaultValues,
  members = [],
  errors = {},
  submitting = false,
  disabled = false,
  submitLabel,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const titleId = useId()
  const descId = useId()
  const dueDateId = useId()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const rawAssignee = fd.get('assignee_id') as string
    onSubmit({
      title: fd.get('title') as string,
      description: (fd.get('description') as string) || undefined,
      status: fd.get('status') as string,
      priority: fd.get('priority') as string,
      assignee_id: rawAssignee === '' ? null : rawAssignee ? Number(rawAssignee) : undefined,
      due_date: (fd.get('due_date') as string) || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 mt-1">
      <div className="space-y-1.5">
        <Label htmlFor={titleId}>
          Title <span className="text-destructive" aria-hidden="true">*</span>
        </Label>
        <Input
          id={titleId}
          name="title"
          defaultValue={defaultValues?.title}
          placeholder="Task title"
          required
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? `${titleId}-err` : undefined}
        />
        {errors.title && (
          <p id={`${titleId}-err`} role="alert" className="text-xs text-destructive">{errors.title}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={descId}>Description</Label>
        <Textarea
          id={descId}
          name="description"
          defaultValue={defaultValues?.description ?? ''}
          placeholder="Optional description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select name="status" defaultValue={defaultValues?.status ?? 'todo'}>
            <SelectTrigger aria-label="Status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Priority</Label>
          <Select name="priority" defaultValue={defaultValues?.priority ?? 'medium'}>
            <SelectTrigger aria-label="Priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((p) => (
                <SelectItem key={p} value={p}>{PRIORITY_LABELS[p]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {members.length > 0 && (
        <div className="space-y-1.5">
          <Label>Assignee</Label>
          <Select name="assignee_id" defaultValue={defaultValues?.assignee_id ? String(defaultValues.assignee_id) : ''}>
            <SelectTrigger aria-label="Assignee">
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Unassigned</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor={dueDateId}>Due date</Label>
        <Input
          id={dueDateId}
          name="due_date"
          type="date"
          defaultValue={defaultValues?.due_date?.slice(0, 10) ?? ''}
        />
      </div>

      {errors._root && (
        <p role="alert" className="text-sm text-destructive">{errors._root}</p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting || disabled}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
