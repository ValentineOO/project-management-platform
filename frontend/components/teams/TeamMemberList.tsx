'use client'

import { Crown, UserMinus, UserPlus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn, ROLE_COLORS } from '@/lib/utils'
import type { TeamMember } from '@/hooks/useTeam'

const ROLE_LABEL: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  manager: 'Manager',
  member: 'Member',
}

interface TeamMemberListProps {
  members: TeamMember[]
  onAdd: () => void
  onRemove: (userId: number) => void
}

export function TeamMemberList({ members, onAdd, onRemove }: TeamMemberListProps) {
  return (
    <section aria-labelledby="members-heading">
      <div className="flex items-center justify-between mb-3">
        <h2 id="members-heading" className="text-sm font-semibold">
          Members{' '}
          <span className="text-muted-foreground font-normal">({members.length})</span>
        </h2>
        <Button variant="outline" size="sm" onClick={onAdd}>
          <UserPlus size={14} aria-hidden="true" />
          Add member
        </Button>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {members.map((m) => (
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
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
                      aria-label={`Remove ${m.name}`}
                      onClick={() => onRemove(m.id)}
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
  )
}
