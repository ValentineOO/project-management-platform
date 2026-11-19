'use client'

import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface CreateTeamModalProps {
  open: boolean
  onClose: () => void
  onCreate: (name: string, description?: string) => Promise<{ ok: boolean; errors?: Record<string, string> }>
}

export function CreateTeamModal({ open, onClose, onCreate }: CreateTeamModalProps) {
  const nameId = useId()
  const descId = useId()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setLoading(true)
    setErrors({})
    const result = await onCreate(
      fd.get('name') as string,
      (fd.get('description') as string) || undefined,
    )
    setLoading(false)
    if (result.ok) {
      onClose()
    } else {
      setErrors(result.errors ?? {})
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New team</DialogTitle>
          <DialogDescription>Create a team to collaborate on projects.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor={nameId}>
              Name <span className="text-destructive" aria-hidden="true">*</span>
            </Label>
            <Input
              id={nameId}
              name="name"
              placeholder="Team name"
              required
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? `${nameId}-err` : undefined}
            />
            {errors.name && (
              <p id={`${nameId}-err`} role="alert" className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={descId}>Description</Label>
            <Textarea id={descId} name="description" placeholder="Optional description" rows={3} />
          </div>
          {errors._root && <p role="alert" className="text-sm text-destructive">{errors._root}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} aria-busy={loading}>
              {loading ? 'Creating…' : 'Create team'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
