'use client'

import { useCallback, useEffect, useState } from 'react'
import { fetchTeams } from '@/services/teams'
import { fetchTeamProjects, createProject as createProjectService } from '@/services/projects'
import { extractApiErrors } from '@/lib/utils'
import type { Project, Team } from '@/types'

export interface ProjectWithTeam extends Project {
  team: Pick<Team, 'id' | 'name'>
}

export function useProjects() {
  const [projects, setProjects] = useState<ProjectWithTeam[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const teams = await fetchTeams()
      setTeams(teams)
      const perTeam = await Promise.all(
        teams.map((t) => fetchTeamProjects(t.id).then((ps) => ps.map((p) => ({ ...p, team: { id: t.id, name: t.name } }))))
      )
      setProjects(perTeam.flat())
    } catch {
      setError('Failed to load projects.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const createProject = useCallback(
    async (teamId: number, name: string, description?: string) => {
      try {
        const team = teams.find((t) => t.id === teamId)!
        const project = await createProjectService(teamId, { name, description })
        setProjects((prev) => [{ ...project, team: { id: team.id, name: team.name } }, ...prev])
        return { ok: true as const }
      } catch (err) {
        return { ok: false as const, errors: extractApiErrors(err) }
      }
    },
    [teams],
  )

  return { projects, teams, loading, error, createProject, reload: load }
}
