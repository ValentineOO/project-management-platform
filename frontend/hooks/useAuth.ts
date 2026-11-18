'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import * as authService from '@/services/auth'
import { extractApiErrors } from '@/lib/utils'

export function useAuth() {
  const { user, status, setUser } = useAuthContext()
  const router = useRouter()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true)
      setErrors({})
      try {
        const user = await authService.login({ email, password })
        setUser(user)
        router.push('/dashboard')
      } catch (err) {
        setErrors(extractApiErrors(err))
      } finally {
        setLoading(false)
      }
    },
    [setUser, router],
  )

  const register = useCallback(
    async (name: string, email: string, password: string, passwordConfirmation: string) => {
      setLoading(true)
      setErrors({})
      try {
        const user = await authService.register({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        })
        setUser(user)
        router.push('/dashboard')
      } catch (err) {
        setErrors(extractApiErrors(err))
      } finally {
        setLoading(false)
      }
    },
    [setUser, router],
  )

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // session may already be expired server-side — clear locally regardless
    } finally {
      setUser(null)
      router.push('/login')
    }
  }, [setUser, router])

  return { user, status, loading, errors, login, register, logout }
}
