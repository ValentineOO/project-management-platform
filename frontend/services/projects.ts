import api from '@/lib/api'
import type { Project } from '@/types'

export async function fetchTeamProjects(teamId: number): Promise<Project[]> {
  const { data } = await api.get<{ data: Project[] }>(`/api/teams/${teamId}/projects`)
  return data.data
}

export async function fetchProject(projectId: number): Promise<Project> {
  const { data } = await api.get<{ project: Project }>(`/api/projects/${projectId}`)
  return data.project
}

export async function createProject(
  teamId: number,
  payload: { name: string; description?: string },
): Promise<Project> {
  const { data } = await api.post<{ project: Project }>(`/api/teams/${teamId}/projects`, payload)
  return data.project
}

export async function updateProject(
  projectId: number,
  payload: Partial<Pick<Project, 'name' | 'description' | 'status'>>,
): Promise<Project> {
  const { data } = await api.patch<{ project: Project }>(`/api/projects/${projectId}`, payload)
  return data.project
}

export async function deleteProject(projectId: number): Promise<void> {
  await api.delete(`/api/projects/${projectId}`)
}
