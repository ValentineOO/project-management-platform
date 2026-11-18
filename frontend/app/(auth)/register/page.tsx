'use client'

import { useId } from 'react'
import { AuthCard } from '@/components/auth/AuthCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'

export default function RegisterPage() {
  const { register, loading, errors } = useAuth()
  const nameId = useId()
  const emailId = useId()
  const passwordId = useId()
  const confirmId = useId()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    await register(
      fd.get('name') as string,
      fd.get('email') as string,
      fd.get('password') as string,
      fd.get('password_confirmation') as string,
    )
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start managing projects today"
      footerText="Already have an account?"
      footerLinkLabel="Sign in"
      footerHref="/login"
      error={errors._root}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor={nameId}>
            Full name <span className="text-destructive" aria-hidden="true">*</span>
          </Label>
          <Input
            id={nameId}
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Alex Johnson"
            required
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${nameId}-err` : undefined}
          />
          {errors.name && (
            <p id={`${nameId}-err`} role="alert" className="text-xs text-destructive">
              {errors.name}
            </p>
          )}
        </div>

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
            autoComplete="new-password"
            placeholder="Minimum 8 characters"
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

        <div className="space-y-1.5">
          <Label htmlFor={confirmId}>
            Confirm password <span className="text-destructive" aria-hidden="true">*</span>
          </Label>
          <Input
            id={confirmId}
            name="password_confirmation"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading} aria-busy={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthCard>
  )
}
