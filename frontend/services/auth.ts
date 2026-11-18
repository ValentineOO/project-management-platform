import api, { initCsrf } from '@/lib/api'
import type { User } from '@/types'

interface LoginPayload {
  email: string
  password: string
}

interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export async function fetchUser(): Promise<User> {
  const { data } = await api.get<{ user: User }>('/api/auth/me')
  return data.user
}

export async function login(payload: LoginPayload): Promise<User> {
  await initCsrf()
  const { data } = await api.post<{ user: User }>('/api/auth/login', payload)
  return data.user
}

export async function register(payload: RegisterPayload): Promise<User> {
  await initCsrf()
  const { data } = await api.post<{ user: User }>('/api/auth/register', payload)
  return data.user
}

export async function logout(): Promise<void> {
  await api.post('/api/auth/logout')
}
