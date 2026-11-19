'use client'

import { useId, useState } from 'react'
import { Plus, Users, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TeamsSkeleton } from '@/components/teams/TeamsSkeleton'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useTeams } from '@/hooks/useTeams'
import { deleteTeam } from '@/services/teams'
import type { Team } from '@/types'

export function TeamsClient() {
  const { teams, loading, error, createTeam } = useTeams()
  const router = useRouter()
  const [showCreate, setShowCreate] = useState(false)
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function handleDelete() {
    if (!deletingTeam) return
    setDeleteLoading(true)
    try {
      await deleteTeam(deletingTeam.id)
      toast.success('Team deleted')
      setDeletingTeam(null)
      window.location.reload()
    } catch {
      toast.error('Failed to delete team')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) return <TeamsSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Teams</h1>
          <p className="text-sm text-muted-foreground">Manage your teams and their members.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={16} aria-hidden="true" />
          New team
        </Button>
      </div>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      {teams.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">You&apos;re not part of any team yet.</p>
          <Button variant="outline" className="mt-4" onClick={() => setShowCreate(true)}>
            Create a team
          </Button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label={`${teams.length} team${teams.length === 1 ? '' : 's'}`}>
          {teams.map((team) => (
            <li key={team.id}>
              <div className="relative group">
                <Link
                  href={`/teams/${team.id}`}
                  className="absolute inset-0 rounded-lg z-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Open team ${team.name}`}
                />
                <Card className="h-full transition-shadow group-hover:shadow-md pointer-events-none">
                  <CardContent className="pt-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span className="font-medium truncate">{team.name}</span>
                    </div>
                    {team.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{team.description}</p>
                    )}
                  </CardContent>
                </Card>
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground pointer-events-auto"
                    aria-label={`Edit ${team.name}`}
                    onClick={(e) => { e.preventDefault(); router.push(`/teams/${team.id}`) }}
                  >
                    <Pencil size={13} aria-hidden="true" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive pointer-events-auto"
                    aria-label={`Delete ${team.name}`}
                    onClick={(e) => { e.preventDefault(); setDeletingTeam(team) }}
                  >
                    <Trash2 size={13} aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <CreateTeamModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={createTeam}
      />

      <ConfirmDialog
        open={deletingTeam !== null}
        title="Delete team"
        description={`Delete "${deletingTeam?.name}"? All projects and tasks will be permanently removed.`}
        confirmLabel="Delete team"
        destructive
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeletingTeam(null)}
      />
    </div>
  )
}

function CreateTeamModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (name: string, description?: string) => Promise<{ ok: boolean; errors?: Record<string, string> }>
}) {
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
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} aria-busy={loading}>
              {loading ? 'Creating…' : 'Create team'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
