'use client'

import { useId, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { STATUS_LABELS, PRIORITY_LABELS } from '@/lib/utils'
import type { Task, TaskStatus, TaskPriority } from '@/types'
import type { TaskConflict } from '@/hooks/useTasks'

interface TaskModalProps {
  open: boolean
  onClose: () => void
  task?: Task
  onSave: (
    payload: {
      version?: number
      title: string
      description?: string
      status: string
      priority: string
      due_date?: string
    },
  ) => Promise<{ ok: boolean; errors?: Record<string, string>; conflict?: TaskConflict }>
}

export function TaskModal({ open, onClose, task, onSave }: TaskModalProps) {
  const isEdit = !!task
  const titleId = useId()
  const descId = useId()
  const dueDateId = useId()

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [conflict, setConflict] = useState<TaskConflict | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)

    const payload = {
      ...(isEdit && { version: task!.version }),
      title: fd.get('title') as string,
      description: (fd.get('description') as string) || undefined,
      status: fd.get('status') as string,
      priority: fd.get('priority') as string,
      due_date: (fd.get('due_date') as string) || undefined,
    }

    setLoading(true)
    setErrors({})
    setConflict(null)
    const result = await onSave(payload)
    setLoading(false)

    if (result.ok) {
      onClose()
    } else if (result.conflict) {
      setConflict(result.conflict)
    } else {
      setErrors(result.errors ?? {})
    }
  }

  function handleClose() {
    setErrors({})
    setConflict(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit task' : 'New task'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the task details.' : 'Add a task to this project.'}
          </DialogDescription>
        </DialogHeader>

        {conflict && (
          <div role="alert" className="rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm space-y-1">
            <p className="font-medium text-destructive">Conflict: this task was updated by someone else.</p>
            <p className="text-muted-foreground">
              Their version: <strong>{conflict.current.title}</strong> · status:{' '}
              <strong>{STATUS_LABELS[conflict.current.status as TaskStatus]}</strong>
            </p>
            <p className="text-muted-foreground text-xs">Reload the page and re-apply your changes.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4 mt-1">
          <div className="space-y-1.5">
            <Label htmlFor={titleId}>
              Title <span className="text-destructive" aria-hidden="true">*</span>
            </Label>
            <Input
              id={titleId}
              name="title"
              defaultValue={task?.title}
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
              defaultValue={task?.description ?? ''}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select name="status" defaultValue={task?.status ?? 'todo'}>
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
              <Select name="priority" defaultValue={task?.priority ?? 'medium'}>
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

          <div className="space-y-1.5">
            <Label htmlFor={dueDateId}>Due date</Label>
            <Input
              id={dueDateId}
              name="due_date"
              type="date"
              defaultValue={task?.due_date?.slice(0, 10) ?? ''}
            />
          </div>

          {errors._root && (
            <p role="alert" className="text-sm text-destructive">{errors._root}</p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !!conflict}>
              {isEdit ? 'Save changes' : 'Create task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
