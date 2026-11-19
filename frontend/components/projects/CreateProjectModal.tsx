'use client'

import { useId, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Team } from '@/types'

interface CreateProjectModalProps {
  open: boolean
  onClose: () => void
  teams: Team[]
  onCreate: (teamId: number, name: string, description?: string) => Promise<{ ok: boolean; errors?: Record<string, string> }>
}

export function CreateProjectModal({ open, onClose, teams, onCreate }: CreateProjectModalProps) {
  const nameId = useId()
  const descId = useId()
  const teamId = useId()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = fd.get('name') as string
    const description = fd.get('description') as string
    const team = Number(fd.get('team_id'))

    setLoading(true)
    setErrors({})
    const result = await onCreate(team, name, description || undefined)
    setLoading(false)

    if (result.ok) {
      onClose()
    } else {
      setErrors(result.errors ?? {})
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>Create a project within one of your teams.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor={teamId}>
              Team <span className="text-destructive" aria-hidden="true">*</span>
            </Label>
            <Select name="team_id" required>
              <SelectTrigger id={teamId} aria-invalid={!!errors.team_id}>
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.team_id && <p role="alert" className="text-xs text-destructive">{errors.team_id}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={nameId}>
              Name <span className="text-destructive" aria-hidden="true">*</span>
            </Label>
            <Input
              id={nameId}
              name="name"
              placeholder="Project name"
              required
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? `${nameId}-err` : undefined}
            />
            {errors.name && <p id={`${nameId}-err`} role="alert" className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={descId}>Description</Label>
            <Textarea
              id={descId}
              name="description"
              placeholder="Optional description"
              rows={3}
            />
          </div>

          {errors._root && <p role="alert" className="text-sm text-destructive">{errors._root}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} aria-busy={loading}>
              {loading ? 'Creating…' : 'Create project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
