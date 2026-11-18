'use client'

import type { Metadata } from 'next'
import { useId } from 'react'
import { AuthCard } from '@/components/auth/AuthCard'
import { Button, Input, Label } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const { login, loading, errors } = useAuth()
  const emailId = useId()
  const passwordId = useId()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    await login(fd.get('email') as string, fd.get('password') as string)
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your account"
      footerText="Don't have an account?"
      footerLinkLabel="Sign up"
      footerHref="/register"
      error={errors._root}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor={emailId} required>
            Email address
          </Label>
          <Input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            error={errors.email}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={passwordId} required>
            Password
          </Label>
          <Input
            id={passwordId}
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            error={errors.password}
          />
        </div>

        <Button type="submit" className="w-full" loading={loading} disabled={loading}>
          Sign in
        </Button>
      </form>
    </AuthCard>
  )
}
