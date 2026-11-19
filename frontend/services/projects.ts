import api from '@/lib/api'
import type { Project } from '@/types'
import type { ProjectWithTeam } from '@/hooks/useProjects'

export async function fetchTeamProjects(teamId: number): Promise<Project[]> {
  const { data } = await api.get<{ data: Project[] }>(`/api/teams/${teamId}/projects`)
  return data.data
}

export interface ProjectDetail {
  project: Project
  members: { id: number; name: string }[]
  task_stats: Record<string, number>
}

export async function fetchProject(projectId: number): Promise<ProjectDetail> {
  const { data } = await api.get<ProjectDetail>(`/api/projects/${projectId}`)
  return data
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
  payload: Partial<Pick<Project, 'name' | 'description' | 'status'>> & { team_id?: number },
): Promise<ProjectWithTeam> {
  const { data } = await api.patch<{ project: ProjectWithTeam }>(`/api/projects/${projectId}`, payload)
  return data.project
}

export async function deleteProject(projectId: number): Promise<void> {
  await api.delete(`/api/projects/${projectId}`)
}
