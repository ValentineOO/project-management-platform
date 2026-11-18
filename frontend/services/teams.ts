import api from '@/lib/api'
import type { Team, User } from '@/types'

export async function fetchTeams(): Promise<Team[]> {
  const { data } = await api.get<{ teams: Team[] }>('/api/teams')
  return data.teams
}

export async function fetchTeamMembers(teamId: number): Promise<Pick<User, 'id' | 'name'>[]> {
  const { data } = await api.get<{ team: Team & { members: Pick<User, 'id' | 'name'>[] } }>(`/api/teams/${teamId}`)
  return data.team.members
}

export async function createTeam(payload: { name: string; description?: string }): Promise<Team> {
  const { data } = await api.post<{ team: Team }>('/api/teams', payload)
  return data.team
}
