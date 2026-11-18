'use client'

import { ArrowLeft, Crown, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useTeam } from '@/hooks/useTeam'
import { useProjects } from '@/hooks/useProjects'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { cn } from '@/lib/utils'

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
  const { team, loading, error } = useTeam(teamId)
  const { projects } = useProjects()
  const teamProjects = projects.filter((p) => p.team.id === teamId)

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading team">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-5 flex items-center gap-3"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-4 w-32" /></CardContent></Card>
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
        <h1 className="text-xl font-semibold">{team.name}</h1>
        {team.description && (
          <p className="text-sm text-muted-foreground mt-0.5">{team.description}</p>
        )}
      </div>

      <section aria-labelledby="members-heading">
        <h2 id="members-heading" className="text-sm font-semibold mb-3">
          Members <span className="text-muted-foreground font-normal">({team.members.length})</span>
        </h2>
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
                  <Badge variant="secondary" className={cn('shrink-0 text-xs capitalize', m.pivot.role === 'owner' && 'bg-amber-100 text-amber-800')}>
                    {ROLE_LABEL[m.pivot.role] ?? m.pivot.role}
                  </Badge>
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
    </div>
  )
}
