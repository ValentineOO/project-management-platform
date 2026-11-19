'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import type { Team, User } from '@/types'

export interface TeamMember extends Pick<User, 'id' | 'name' | 'email'> {
  pivot: { role: string; joined_at: string }
}

export interface TeamDetail extends Team {
  owner: Pick<User, 'id' | 'name'>
  members: TeamMember[]
}

export function useTeam(teamId: number) {
  const [team, setTeam] = useState<TeamDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    api.get<{ team: TeamDetail }>(`/api/teams/${teamId}`)
      .then(({ data }) => setTeam(data.team))
      .catch(() => setError('Failed to load team.'))
      .finally(() => setLoading(false))
  }, [teamId])

  return { team, loading, error, setTeam }
}
