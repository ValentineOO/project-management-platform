import api from '@/lib/api'
import type { Team } from '@/types'

export async function fetchTeams(): Promise<Team[]> {
  const { data } = await api.get<{ teams: Team[] }>('/api/teams')
  return data.teams
}

export async function createTeam(payload: { name: string; description?: string }): Promise<Team> {
  const { data } = await api.post<{ team: Team }>('/api/teams', payload)
  return data.team
}
