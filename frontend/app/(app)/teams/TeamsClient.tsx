'use client'

import { useState } from 'react'
import { Plus, Users, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TeamsSkeleton } from '@/components/teams/TeamsSkeleton'
import { CreateTeamModal } from '@/components/teams/CreateTeamModal'
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
        <ul
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-label={`${teams.length} team${teams.length === 1 ? '' : 's'}`}
        >
          {teams.map((team) => (
            <li key={team.id}>
              <div className="relative group">
                <Link
                  href={`/teams/${team.id}`}
                  className="absolute inset-0 rounded-lg z-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Open team ${team.name}`}
                />
                <Card className="h-full transition-shadow group-hover:shadow-md">
                  <CardContent className="pt-5 pb-4 space-y-1.5">
                    {/* Name: tight, no flex-1 stretch */}
                    <div className="flex items-center gap-1.5">
                      <Users size={15} className="shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span className="font-medium truncate">{team.name}</span>
                    </div>
                    {team.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 pl-5">{team.description}</p>
                    )}
                    {/* Actions below content, right-aligned */}
                    <div className="flex items-center justify-end gap-0.5 pt-2 relative z-10">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        aria-label={`Edit ${team.name}`}
                        onClick={(e) => { e.preventDefault(); router.push(`/teams/${team.id}`) }}
                      >
                        <Pencil size={13} aria-hidden="true" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        aria-label={`Delete ${team.name}`}
                        onClick={(e) => { e.preventDefault(); setDeletingTeam(team) }}
                      >
                        <Trash2 size={13} aria-hidden="true" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
