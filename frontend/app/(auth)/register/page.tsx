'use client'

import { useId } from 'react'
import { AuthCard } from '@/components/auth/AuthCard'
import { Button, Input, Label } from '@/components/ui'
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
          <Label htmlFor={nameId} required>
            Full name
          </Label>
          <Input
            id={nameId}
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Alex Johnson"
            required
            error={errors.name}
          />
        </div>

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
            autoComplete="new-password"
            placeholder="Minimum 8 characters"
            required
            error={errors.password}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={confirmId} required>
            Confirm password
          </Label>
          <Input
            id={confirmId}
            name="password_confirmation"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            required
            error={errors.password_confirmation}
          />
        </div>

        <Button type="submit" className="w-full" loading={loading} disabled={loading}>
          Create account
        </Button>
      </form>
    </AuthCard>
  )
}
