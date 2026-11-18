'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { TaskForm } from './TaskForm'
import type { TaskFormValues } from './TaskForm'
import type { Task, TaskStatus, User } from '@/types'
import type { TaskConflict } from '@/hooks/useTasks'
import { STATUS_LABELS } from '@/lib/utils'

interface EditTaskModalProps {
  open: boolean
  onClose: () => void
  task: Task
  members?: Pick<User, 'id' | 'name'>[]
  onUpdate: (
    taskId: number,
    payload: TaskFormValues & { version: number },
  ) => Promise<{ ok: boolean; errors?: Record<string, string>; conflict?: TaskConflict }>
}

export function EditTaskModal({ open, onClose, task, members, onUpdate }: EditTaskModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [conflict, setConflict] = useState<TaskConflict | null>(null)

  async function handleSubmit(values: TaskFormValues) {
    setSubmitting(true)
    setErrors({})
    setConflict(null)
    const result = await onUpdate(task.id, { ...values, version: task.version })
    setSubmitting(false)
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
          <DialogTitle>Edit task</DialogTitle>
          <DialogDescription>Update the task details.</DialogDescription>
        </DialogHeader>

        {conflict && (
          <div role="alert" className="rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm space-y-1">
            <p className="font-medium text-destructive">Conflict: this task was updated by someone else.</p>
            <p className="text-muted-foreground">
              Their version: <strong>{conflict.current.title}</strong> · status:{' '}
              <strong>{STATUS_LABELS[conflict.current.status as TaskStatus]}</strong>
            </p>
            <p className="text-xs text-muted-foreground">Reload the page and re-apply your changes.</p>
          </div>
        )}

        <TaskForm
          defaultValues={task}
          members={members}
          errors={errors}
          submitting={submitting}
          disabled={!!conflict}
          submitLabel="Save changes"
          onSubmit={handleSubmit}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  )
}
