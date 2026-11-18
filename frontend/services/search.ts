import api from '@/lib/api'
import type { Project, Task } from '@/types'

export interface SearchResults {
  projects?: Pick<Project, 'id' | 'name' | 'description' | 'status'>[]
  tasks?: Pick<Task, 'id' | 'title' | 'status' | 'priority' | 'project_id'>[]
}

export async function search(q: string, type: 'projects' | 'tasks' | 'all' = 'all'): Promise<SearchResults> {
  const { data } = await api.get<SearchResults>('/api/search', { params: { q, type } })
  return data
}
