'use client'

import type { Metadata } from 'next'
import { useId } from 'react'
import { AuthCard } from '@/components/auth/AuthCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
          <Label htmlFor={emailId}>
            Email address <span className="text-destructive" aria-hidden="true">*</span>
          </Label>
          <Input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? `${emailId}-err` : undefined}
          />
          {errors.email && (
            <p id={`${emailId}-err`} role="alert" className="text-xs text-destructive">
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={passwordId}>
            Password <span className="text-destructive" aria-hidden="true">*</span>
          </Label>
          <Input
            id={passwordId}
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? `${passwordId}-err` : undefined}
          />
          {errors.password && (
            <p id={`${passwordId}-err`} role="alert" className="text-xs text-destructive">
              {errors.password}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading} aria-busy={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthCard>
  )
}
