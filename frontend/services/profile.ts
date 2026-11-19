import api from '@/lib/api'
import type { User } from '@/types'

export async function updateProfile(payload: { name: string }): Promise<User> {
  const { data } = await api.patch<{ user: User }>('/api/profile', payload)
  return data.user
}

export async function changePassword(payload: {
  current_password: string
  password: string
  password_confirmation: string
}): Promise<void> {
  await api.post('/api/profile/password', payload)
}
