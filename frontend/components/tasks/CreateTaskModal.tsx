'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { TaskForm } from './TaskForm'
import type { TaskFormValues } from './TaskForm'
import type { User } from '@/types'

interface CreateTaskModalProps {
  open: boolean
  onClose: () => void
  members?: Pick<User, 'id' | 'name'>[]
  onCreate: (values: TaskFormValues) => Promise<{ ok: boolean; errors?: Record<string, string> }>
}

export function CreateTaskModal({ open, onClose, members, onCreate }: CreateTaskModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleSubmit(values: TaskFormValues) {
    setSubmitting(true)
    setErrors({})
    const result = await onCreate(values)
    setSubmitting(false)
    if (result.ok) {
      onClose()
    } else {
      setErrors(result.errors ?? {})
    }
  }

  function handleClose() {
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
          <DialogDescription>Add a task to this project.</DialogDescription>
        </DialogHeader>
        <TaskForm
          members={members}
          errors={errors}
          submitting={submitting}
          submitLabel="Create task"
          onSubmit={handleSubmit}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  )
}
