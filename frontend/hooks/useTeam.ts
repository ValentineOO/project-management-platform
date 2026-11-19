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
  const [loadedId, setLoadedId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Derived: true whenever the loaded data doesn't match the requested teamId
  const loading = loadedId !== teamId

  useEffect(() => {
    api.get<{ team: TeamDetail }>(`/api/teams/${teamId}`)
      .then(({ data }) => { setTeam(data.team); setLoadedId(teamId) })
      .catch(() => setError('Failed to load team.'))
  }, [teamId])

  return { team, loading, error, setTeam }
}
