'use client'

import { useEffect, useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateTeam } from '@/services/teams'
import { extractApiErrors } from '@/lib/utils'
import type { Team } from '@/types'

interface EditTeamModalProps {
  open: boolean
  team: Team
  onClose: () => void
  onUpdated: (team: Team) => void
}

export function EditTeamModal({ open, team, onClose, onUpdated }: EditTeamModalProps) {
  const nameId = useId()
  const descId = useId()
  const [name, setName] = useState(team.name)
  const [description, setDescription] = useState(team.description ?? '')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setName(team.name)
      setDescription(team.description ?? '')
      setErrors({})
    }
  }, [open, team])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      const updated = await updateTeam(team.id, { name: name.trim(), description: description.trim() || null })
      onUpdated(updated)
      onClose()
    } catch (err) {
      setErrors(extractApiErrors(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit team</DialogTitle>
          <DialogDescription>Update the team name or description.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor={nameId}>
              Name <span className="text-destructive" aria-hidden="true">*</span>
            </Label>
            <Input
              id={nameId}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              aria-invalid={!!errors.name}
            />
            {errors.name && <p role="alert" className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={descId}>Description</Label>
            <Input
              id={descId}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>
          {errors._root && <p role="alert" className="text-sm text-destructive">{errors._root}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} aria-busy={loading}>
              {loading ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
