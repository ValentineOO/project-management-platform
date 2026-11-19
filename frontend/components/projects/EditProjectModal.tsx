'use client'

import { useId, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { extractApiErrors } from '@/lib/utils'
import { updateProject } from '@/services/projects'
import type { Project, Team } from '@/types'
import type { ProjectWithTeam } from '@/hooks/useProjects'

interface EditProjectModalProps {
  open: boolean
  project: ProjectWithTeam
  teams: Team[]
  onClose: () => void
  onUpdated: (project: ProjectWithTeam) => void
}

const STATUS_OPTIONS: { value: Project['status']; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
]

export function EditProjectModal({ open, project, teams, onClose, onUpdated }: EditProjectModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit project</DialogTitle>
          <DialogDescription>Update the project name, description, or status.</DialogDescription>
        </DialogHeader>
        {open && (
          <EditProjectForm
            key={project.id}
            project={project}
            teams={teams}
            onClose={onClose}
            onUpdated={onUpdated}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

type FormProps = Omit<EditProjectModalProps, 'open'>

function EditProjectForm({ project, teams, onClose, onUpdated }: FormProps) {
  const nameId = useId()
  const descId = useId()
  const statusId = useId()
  const teamId = useId()

  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description ?? '')
  const [status, setStatus] = useState<Project['status']>(project.status)
  const [selectedTeamId, setSelectedTeamId] = useState<number>(project.team_id)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      const updated = await updateProject(project.id, {
        name: name.trim(),
        description: description.trim() || null,
        status,
        team_id: selectedTeamId,
      })
      onUpdated(updated)
      onClose()
    } catch (err) {
      setErrors(extractApiErrors(err))
    } finally {
      setLoading(false)
    }
  }

  const selectedStatusLabel = STATUS_OPTIONS.find((o) => o.value === status)?.label
  const selectedTeamName = teams.find((t) => t.id === selectedTeamId)?.name

  return (
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
          aria-describedby={errors.name ? `${nameId}-err` : undefined}
        />
        {errors.name && <p id={`${nameId}-err`} role="alert" className="text-xs text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={statusId}>Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as Project['status'])}>
          <SelectTrigger id={statusId}>
            <span>{selectedStatusLabel}</span>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={teamId}>Team</Label>
        <Select value={String(selectedTeamId)} onValueChange={(v) => setSelectedTeamId(Number(v))}>
          <SelectTrigger id={teamId}>
            <span>{selectedTeamName ?? 'Select team'}</span>
          </SelectTrigger>
          <SelectContent>
            {teams.map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={descId}>Description</Label>
        <Textarea
          id={descId}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
          {loading ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
