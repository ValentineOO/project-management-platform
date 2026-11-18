'use client'

import { useEffect, useState } from 'react'
import { fetchProject } from '@/services/projects'
import type { Project } from '@/types'

export function useProject(projectId: number) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchProject(projectId)
      .then(setProject)
      .catch(() => setError('Failed to load project.'))
      .finally(() => setLoading(false))
  }, [projectId])

  return { project, loading, error }
}
