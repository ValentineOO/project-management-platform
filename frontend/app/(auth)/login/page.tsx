'use client'

import { useId, useState } from 'react'
import { AuthCard } from '@/components/auth/AuthCard'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const { login, loading, errors } = useAuth()
  const emailId = useId()
  const passwordId = useId()

  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [focused, setFocused] = useState<Record<string, boolean>>({})

  function touch(field: string) {
    setTouched(t => ({ ...t, [field]: true }))
    setFocused(f => ({ ...f, [field]: false }))
  }

  function focus(field: string) {
    setFocused(f => ({ ...f, [field]: true }))
  }

  function showError(field: string) {
    return !!(errors[field] && touched[field])
  }

  function invalid(field: string) {
    return showError(field) && !focused[field]
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setTouched({ email: true, password: true })
    setFocused({})
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
            aria-invalid={invalid('email')}
            aria-describedby={showError('email') ? `${emailId}-err` : undefined}
            onBlur={() => touch('email')}
            onFocus={() => focus('email')}
          />
          {showError('email') && (
            <p id={`${emailId}-err`} role="alert" className="text-xs text-destructive">
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={passwordId}>
            Password <span className="text-destructive" aria-hidden="true">*</span>
          </Label>
          <PasswordInput
            id={passwordId}
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            aria-invalid={invalid('password')}
            aria-describedby={showError('password') ? `${passwordId}-err` : undefined}
            onBlur={() => touch('password')}
            onFocus={() => focus('password')}
          />
          {showError('password') && (
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
