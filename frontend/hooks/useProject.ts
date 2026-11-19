'use client'

import { useEffect, useState } from 'react'
import { fetchProject } from '@/services/projects'
import type { Project, User } from '@/types'

interface ProjectCache {
  project: Project
  members: Pick<User, 'id' | 'name'>[]
  taskStats: Record<string, number>
}

const cache = new Map<number, ProjectCache>()

export function useProject(projectId: number) {
  const hit = cache.get(projectId)
  const [project, setProject] = useState<Project | null>(hit?.project ?? null)
  const [members, setMembers] = useState<Pick<User, 'id' | 'name'>[]>(hit?.members ?? [])
  const [taskStats, setTaskStats] = useState<Record<string, number>>(hit?.taskStats ?? {})
  const [loading, setLoading] = useState(!hit)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!cache.has(projectId)) setLoading(true)
    fetchProject(projectId)
      .then(({ project, task_stats }) => {
        const entry: ProjectCache = {
          project,
          members: project.members ?? [],
          taskStats: task_stats,
        }
        cache.set(projectId, entry)
        setProject(entry.project)
        setMembers(entry.members)
        setTaskStats(entry.taskStats)
      })
      .catch(() => setError('Failed to load project.'))
      .finally(() => setLoading(false))
  }, [projectId])

  return { project, members, taskStats, loading, error }
}
