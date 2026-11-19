'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { AddMemberModal } from '@/components/teams/AddMemberModal'
import { TeamMemberList } from '@/components/teams/TeamMemberList'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { useTeam } from '@/hooks/useTeam'
import { useProjects } from '@/hooks/useProjects'

interface TeamDetailClientProps {
  teamId: number
}

export function TeamDetailClient({ teamId }: TeamDetailClientProps) {
  const { team, loading, error, setTeam } = useTeam(teamId)
  const { projects } = useProjects()
  const teamProjects = projects.filter((p) => p.team.id === teamId)

  const [showAddMember, setShowAddMember] = useState(false)
  const [removingMemberId, setRemovingMemberId] = useState<number | null>(null)

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
        <div>
          <h1 className="text-xl font-semibold">{team.name}</h1>
          {team.description && (
            <p className="text-sm text-muted-foreground mt-0.5">{team.description}</p>
          )}
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
