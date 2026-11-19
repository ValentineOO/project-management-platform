'use client'

import { useId, useState } from 'react'
import { ArrowLeft, Crown, Pencil, Trash2, UserPlus, UserMinus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useTeam } from '@/hooks/useTeam'
import { useProjects } from '@/hooks/useProjects'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { updateTeam, deleteTeam, addTeamMember, removeTeamMember } from '@/services/teams'
import { extractApiErrors, cn, ROLE_COLORS } from '@/lib/utils'
import type { Team } from '@/types'

interface TeamDetailClientProps {
  teamId: number
}

const ROLE_LABEL: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  manager: 'Manager',
  member: 'Member',
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

  async function handleRemoveMember(userId: number) {
    try {
      await removeTeamMember(teamId, userId)
      setTeam((prev) => prev ? {
        ...prev,
        members: prev.members.filter((m) => m.id !== userId),
      } : prev)
      toast.success('Member removed')
    } catch {
      toast.error('Failed to remove member')
    } finally {
      setRemovingMemberId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading team">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-5 flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </CardContent></Card>
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
      <div>
        <Link
          href="/teams"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Teams
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-0.5">
            <h1 className="text-xl font-semibold">{team.name}</h1>
            {team.description && (
              <p className="text-sm text-muted-foreground">{team.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
              <Pencil size={14} aria-hidden="true" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteTeam(true)}
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 size={14} aria-hidden="true" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <section aria-labelledby="members-heading">
        <div className="flex items-center justify-between mb-3">
          <h2 id="members-heading" className="text-sm font-semibold">
            Members <span className="text-muted-foreground font-normal">({team.members.length})</span>
          </h2>
          <Button variant="outline" size="sm" onClick={() => setShowAddMember(true)}>
            <UserPlus size={14} aria-hidden="true" />
            Add member
          </Button>
        </div>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {team.members.map((m) => (
            <li key={m.id}>
              <Card>
                <CardContent className="pt-4 pb-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium uppercase">
                    {m.name.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate flex items-center gap-1.5">
                      {m.name}
                      {m.pivot.role === 'owner' && (
                        <Crown size={12} className="text-amber-500 shrink-0" aria-label="Owner" />
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={cn('text-xs font-medium border-0 capitalize', ROLE_COLORS[m.pivot.role] ?? 'text-slate-600 bg-slate-100')}>
                      {ROLE_LABEL[m.pivot.role] ?? m.pivot.role}
                    </Badge>
                    {m.pivot.role !== 'owner' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        aria-label={`Remove ${m.name}`}
                        onClick={() => setRemovingMemberId(m.id)}
                      >
                        <UserMinus size={14} aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {teamProjects.length > 0 && (
        <section aria-labelledby="projects-heading">
          <h2 id="projects-heading" className="text-sm font-semibold mb-3">
            Projects <span className="text-muted-foreground font-normal">({teamProjects.length})</span>
          </h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teamProjects.map((p) => (
              <li key={p.id}><ProjectCard project={p} /></li>
            ))}
          </ul>
        </section>
      )}

      <EditTeamModal
        open={showEdit}
        team={team}
        onClose={() => setShowEdit(false)}
        onUpdated={(updated) => {
          setTeam((prev) => prev ? { ...prev, ...updated } : prev)
          toast.success('Team updated')
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
        onConfirm={() => { if (removingMemberId !== null) handleRemoveMember(removingMemberId) }}
        onCancel={() => setRemovingMemberId(null)}
      />

      <AddMemberModal
        open={showAddMember}
        teamId={teamId}
        onClose={() => setShowAddMember(false)}
        onAdded={(member) => {
          setTeam((prev) => prev ? { ...prev, members: [...prev.members, member as typeof prev.members[number]] } : prev)
          toast.success('Member added')
        }}
      />
    </div>
  )
}

function EditTeamModal({
  open, team, onClose, onUpdated,
}: {
  open: boolean
  team: Team
  onClose: () => void
  onUpdated: (team: Team) => void
}) {
  const nameId = useId()
  const descId = useId()
  const [name, setName] = useState(team.name)
  const [description, setDescription] = useState(team.description ?? '')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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
            <Label htmlFor={nameId}>Name <span className="text-destructive" aria-hidden="true">*</span></Label>
            <Input id={nameId} value={name} onChange={(e) => setName(e.target.value)} required aria-invalid={!!errors.name} />
            {errors.name && <p role="alert" className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={descId}>Description</Label>
            <Input id={descId} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
          </div>
          {errors._root && <p role="alert" className="text-sm text-destructive">{errors._root}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} aria-busy={loading}>{loading ? 'Saving…' : 'Save changes'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AddMemberModal({
  open, teamId, onClose, onAdded,
}: {
  open: boolean
  teamId: number
  onClose: () => void
  onAdded: (member: object) => void
}) {
  const emailId = useId()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleClose() {
    setEmail('')
    setErrors({})
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      const member = await addTeamMember(teamId, email.trim())
      onAdded(member)
      handleClose()
    } catch (err) {
      setErrors(extractApiErrors(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add member</DialogTitle>
          <DialogDescription>Invite an existing user to this team by their email address.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor={emailId}>Email address <span className="text-destructive" aria-hidden="true">*</span></Label>
            <Input
              id={emailId}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              required
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? `${emailId}-err` : undefined}
            />
            {errors.email && <p id={`${emailId}-err`} role="alert" className="text-xs text-destructive">{errors.email}</p>}
          </div>
          {errors._root && <p role="alert" className="text-sm text-destructive">{errors._root}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} aria-busy={loading}>{loading ? 'Adding…' : 'Add member'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
