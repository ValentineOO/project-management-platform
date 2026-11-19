'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
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
      setError(null)
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
          : { projects: [entry], teams }
        setProjects((prev) => [entry, ...prev])
        toast.success('Project created')
        load()
        return { ok: true as const }
      } catch (err) {
        toast.error('Failed to create project')
        return { ok: false as const, errors: extractApiErrors(err) }
      }
    },
    [teams, load],
  )

  const removeProject = useCallback((projectId: number) => {
    cache = cache ? { ...cache, projects: cache.projects.filter((p) => p.id !== projectId) } : null
    setProjects((prev) => prev.filter((p) => p.id !== projectId))
  }, [])

  const updateCachedProject = useCallback((updated: ProjectWithTeam) => {
    const patch = (ps: ProjectWithTeam[]) =>
      ps.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
    cache = cache ? { ...cache, projects: patch(cache.projects) } : null
    setProjects((prev) => patch(prev))
  }, [])

  return { projects, teams, loading, error, createProject, removeProject, updateCachedProject, reload: load }
}
