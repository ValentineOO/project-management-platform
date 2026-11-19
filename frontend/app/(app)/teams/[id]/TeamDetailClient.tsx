'use client'

import { useState } from 'react'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EditTeamModal } from '@/components/teams/EditTeamModal'
import { AddMemberModal } from '@/components/teams/AddMemberModal'
import { TeamMemberList } from '@/components/teams/TeamMemberList'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { useTeam } from '@/hooks/useTeam'
import { useProjects } from '@/hooks/useProjects'
import { deleteTeam } from '@/services/teams'
import type { Team } from '@/types'
import type { TeamMember } from '@/hooks/useTeam'

interface TeamDetailClientProps {
  teamId: number
}

export function TeamDetailClient({ teamId }: TeamDetailClientProps) {
  const router = useRouter()
  const { team, loading, error, setTeam } = useTeam(teamId)
  const { projects } = useProjects()
  const teamProjects = projects.filter((p) => p.team.id === teamId)

  const [showEdit, setShowEdit] = useState(false)
  const [showDeleteTeam, setShowDeleteTeam] = useState(false)
  const [deletingTeam, setDeletingTeam] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [removingMemberId, setRemovingMemberId] = useState<number | null>(null)

  async function handleDeleteTeam() {
    setDeletingTeam(true)
    try {
      await deleteTeam(teamId)
      toast.success('Team deleted')
      router.push('/teams')
    } catch {
      toast.error('Failed to delete team')
      setDeletingTeam(false)
      setShowDeleteTeam(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading team">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-5 flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !team) {
    return <p role="alert" className="text-sm text-destructive">{error ?? 'Team not found.'}</p>
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/teams"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Teams
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-0.5 min-w-0">
            <h1 className="text-xl font-semibold">{team.name}</h1>
            {team.description && (
              <p className="text-sm text-muted-foreground">{team.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
              <Pencil size={13} aria-hidden="true" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteTeam(true)}
              className="text-destructive hover:bg-destructive hover:text-white border-destructive/30"
            >
              <Trash2 size={13} aria-hidden="true" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Members */}
      <TeamMemberList
        members={team.members}
        onAdd={() => setShowAddMember(true)}
        onRemove={(userId) => setRemovingMemberId(userId)}
      />

      {/* Projects */}
      {teamProjects.length > 0 && (
        <section aria-labelledby="projects-heading">
          <h2 id="projects-heading" className="text-sm font-semibold mb-3">
            Projects{' '}
            <span className="text-muted-foreground font-normal">({teamProjects.length})</span>
          </h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teamProjects.map((p) => (
              <li key={p.id}><ProjectCard project={p} /></li>
            ))}
          </ul>
        </section>
      )}

      {/* Modals */}
      <EditTeamModal
        open={showEdit}
        team={team}
        onClose={() => setShowEdit(false)}
        onUpdated={(updated) => {
          setTeam((prev) => prev ? { ...prev, ...updated } : prev)
          toast.success('Team updated')
          setShowEdit(false)
        }}
      />

      <AddMemberModal
        open={showAddMember}
        teamId={teamId}
        onClose={() => setShowAddMember(false)}
        onAdded={(member) => {
          setTeam((prev) =>
            prev ? { ...prev, members: [...prev.members, member] } : prev,
          )
          toast.success('Member added')
        }}
      />

      <ConfirmDialog
        open={showDeleteTeam}
        title="Delete team"
        description={`Are you sure you want to delete "${team.name}"? All projects and tasks in this team will be permanently removed.`}
        confirmLabel="Delete team"
        destructive
        loading={deletingTeam}
        onConfirm={handleDeleteTeam}
        onCancel={() => setShowDeleteTeam(false)}
      />

      <ConfirmDialog
        open={removingMemberId !== null}
        title="Remove member"
        description={`Remove ${team.members.find((m) => m.id === removingMemberId)?.name ?? 'this member'} from the team?`}
        confirmLabel="Remove"
        destructive
        onConfirm={async () => {
          if (removingMemberId === null) return
          const { removeTeamMember } = await import('@/services/teams')
          try {
            await removeTeamMember(teamId, removingMemberId)
            setTeam((prev) =>
              prev ? { ...prev, members: prev.members.filter((m) => m.id !== removingMemberId) } : prev,
            )
            toast.success('Member removed')
          } catch {
            toast.error('Failed to remove member')
          } finally {
            setRemovingMemberId(null)
          }
        }}
        onCancel={() => setRemovingMemberId(null)}
      />
    </div>
  )
}
