import api from '@/lib/api'
import type { DashboardStats } from '@/types'

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>('/api/dashboard')
  return data
}
