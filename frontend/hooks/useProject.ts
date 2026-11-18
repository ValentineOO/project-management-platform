'use client'

import { useEffect, useState } from 'react'
import { fetchProject } from '@/services/projects'
import type { Project, User } from '@/types'

export function useProject(projectId: number) {
  const [project, setProject] = useState<Project | null>(null)
  const [members, setMembers] = useState<Pick<User, 'id' | 'name'>[]>([])
  const [taskStats, setTaskStats] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchProject(projectId)
      .then(({ project, task_stats }) => {
        setProject(project)
        setMembers(project.members ?? [])
        setTaskStats(task_stats)
      })
      .catch(() => setError('Failed to load project.'))
      .finally(() => setLoading(false))
  }, [projectId])

  return { project, members, taskStats, loading, error }
}
