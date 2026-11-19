import api from '@/lib/api'
import type { Team, User } from '@/types'

export async function fetchTeams(): Promise<Team[]> {
  const { data } = await api.get<{ teams: Team[] }>('/api/teams')
  return data.teams
}


export async function createTeam(payload: { name: string; description?: string }): Promise<Team> {
  const { data } = await api.post<{ team: Team }>('/api/teams', payload)
  return data.team
}

export async function updateTeam(
  teamId: number,
  payload: { name: string; description?: string | null },
): Promise<Team> {
  const { data } = await api.patch<{ team: Team }>(`/api/teams/${teamId}`, payload)
  return data.team
}

export async function deleteTeam(teamId: number): Promise<void> {
  await api.delete(`/api/teams/${teamId}`)
}

export async function addTeamMember(teamId: number, email: string): Promise<Pick<User, 'id' | 'name' | 'email'> & { pivot: { role: string } }> {
  const { data } = await api.post(`/api/teams/${teamId}/members`, { email })
  return data.member
}

export async function removeTeamMember(teamId: number, userId: number): Promise<void> {
  await api.delete(`/api/teams/${teamId}/members/${userId}`)
}
