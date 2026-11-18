'use client'

import { useCallback, useEffect, useState } from 'react'
import { fetchTeams, createTeam as createTeamService } from '@/services/teams'
import { extractApiErrors } from '@/lib/utils'
import type { Team } from '@/types'

// Module-level cache: survives route changes within the same session
let teamsCache: Team[] | null = null

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>(teamsCache ?? [])
  const [loading, setLoading] = useState(teamsCache === null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (teamsCache === null) setLoading(true)
    setError(null)
    try {
      const data = await fetchTeams()
      teamsCache = data
      setTeams(data)
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
      teamsCache = [team, ...(teamsCache ?? [])]
      setTeams((prev) => [team, ...prev])
      return { ok: true as const }
    } catch (err) {
      return { ok: false as const, errors: extractApiErrors(err) }
    }
  }, [])

  return { teams, loading, error, createTeam }
}
