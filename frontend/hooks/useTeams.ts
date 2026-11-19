'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { fetchTeams, createTeam as createTeamService } from '@/services/teams'
import { extractApiErrors } from '@/lib/utils'
import type { Team } from '@/types'

// Module-level cache: survives route changes within the same session
let teamsCache: Team[] | null = null

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>(teamsCache ?? [])
  const [loading, setLoading] = useState(teamsCache === null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTeams()
      .then((data) => { teamsCache = data; setTeams(data); setError(null) })
      .catch(() => setError('Failed to load teams.'))
      .finally(() => setLoading(false))
  }, [])

  const createTeam = useCallback(async (name: string, description?: string) => {
    try {
      const team = await createTeamService({ name, description })
      teamsCache = [team, ...(teamsCache ?? [])]
      setTeams((prev) => [team, ...prev])
      toast.success('Team created')
      return { ok: true as const }
    } catch (err) {
      toast.error('Failed to create team')
      return { ok: false as const, errors: extractApiErrors(err) }
    }
  }, [])

  const updateCachedTeam = useCallback((updated: Team) => {
    teamsCache = teamsCache ? teamsCache.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)) : null
    setTeams((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)))
  }, [])

  const removeFromCache = useCallback((teamId: number) => {
    teamsCache = teamsCache ? teamsCache.filter((t) => t.id !== teamId) : null
    setTeams((prev) => prev.filter((t) => t.id !== teamId))
  }, [])

  return { teams, loading, error, createTeam, updateCachedTeam, removeFromCache }
}
