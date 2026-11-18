'use client'

import { useCallback, useEffect, useState } from 'react'
import { fetchTeams, createTeam as createTeamService } from '@/services/teams'
import { extractApiErrors } from '@/lib/utils'
import type { Team } from '@/types'

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setTeams(await fetchTeams())
    } catch {
      setError('Failed to load teams.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const createTeam = useCallback(async (name: string, description?: string) => {
    try {
      const team = await createTeamService({ name, description })
      setTeams((prev) => [team, ...prev])
      return { ok: true as const }
    } catch (err) {
      return { ok: false as const, errors: extractApiErrors(err) }
    }
  }, [])

  return { teams, loading, error, createTeam }
}
