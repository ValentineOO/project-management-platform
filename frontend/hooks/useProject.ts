'use client'

import { useEffect, useState } from 'react'
import { fetchProject } from '@/services/projects'
import { fetchTeamMembers } from '@/services/teams'
import type { Project, User } from '@/types'

export function useProject(projectId: number) {
  const [project, setProject] = useState<Project | null>(null)
  const [members, setMembers] = useState<Pick<User, 'id' | 'name'>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchProject(projectId)
      .then(async (p) => {
        setProject(p)
        const m = await fetchTeamMembers(p.team_id).catch(() => [])
        setMembers(m)
      })
      .catch(() => setError('Failed to load project.'))
      .finally(() => setLoading(false))
  }, [projectId])

  return { project, members, loading, error }
}
