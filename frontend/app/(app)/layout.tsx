'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { AppShellSkeleton } from '@/components/layout/AppShellSkeleton'
import { useAuthContext } from '@/contexts/AuthContext'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { status } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [status, router])

  if (status === 'loading') return <AppShellSkeleton />
  if (status === 'unauthenticated') return null

  return (
    <div className="flex h-screen overflow-x-hidden">
      <Sidebar />
      <div className="flex min-h-0 flex-1 flex-col">
        <Header />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-6"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
