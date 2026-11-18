'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { fetchUser } from '@/services/auth'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
}

interface AuthContextValue extends AuthState {
  setUser: (user: User | null) => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, status: 'loading' })

  const refresh = useCallback(async () => {
    try {
      const user = await fetchUser()
      setState({ user, status: 'authenticated' })
    } catch {
      setState({ user: null, status: 'unauthenticated' })
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const setUser = useCallback((user: User | null) => {
    setState({ user, status: user ? 'authenticated' : 'unauthenticated' })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, setUser, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider')
  return ctx
}
