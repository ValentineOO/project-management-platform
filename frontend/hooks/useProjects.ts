'use client'

import { useCallback, useEffect, useState } from 'react'
import { fetchTeams } from '@/services/teams'
import { fetchTeamProjects, createProject as createProjectService } from '@/services/projects'
import { extractApiErrors } from '@/lib/utils'
import type { Project, Team } from '@/types'

export interface ProjectWithTeam extends Project {
  team: Pick<Team, 'id' | 'name'>
}

interface Cache {
  projects: ProjectWithTeam[]
  teams: Team[]
}

// Module-level cache: survives route changes within the same session
let cache: Cache | null = null

export function useProjects() {
  const [projects, setProjects] = useState<ProjectWithTeam[]>(cache?.projects ?? [])
  const [teams, setTeams] = useState<Team[]>(cache?.teams ?? [])
  const [loading, setLoading] = useState(cache === null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (cache === null) setLoading(true)
    setError(null)
    try {
      const teams = await fetchTeams()
      const perTeam = await Promise.all(
        teams.map((t) =>
          fetchTeamProjects(t.id).then((ps) =>
            ps.map((p) => ({ ...p, team: { id: t.id, name: t.name } })),
          ),
        ),
      )
      const projects = perTeam.flat()
      cache = { projects, teams }
      setTeams(teams)
      setProjects(projects)
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
        const entry = { ...project, team: { id: team.id, name: team.name } }
        cache = cache
          ? { ...cache, projects: [entry, ...cache.projects] }
          : null
        setProjects((prev) => [entry, ...prev])
        return { ok: true as const }
      } catch (err) {
        return { ok: false as const, errors: extractApiErrors(err) }
      }
    },
    [teams],
  )

  return { projects, teams, loading, error, createProject, reload: load }
}
