'use client'

import { useId, useState } from 'react'
import { AuthCard } from '@/components/auth/AuthCard'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { PasswordStrength } from '@/components/auth/PasswordStrength'
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

  const [password, setPassword] = useState('')
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
    setTouched({ name: true, email: true, password: true, password_confirmation: true })
    setFocused({})
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
            aria-invalid={invalid('name')}
            aria-describedby={showError('name') ? `${nameId}-err` : undefined}
            onBlur={() => touch('name')}
            onFocus={() => focus('name')}
          />
          {showError('name') && (
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
            autoComplete="new-password"
            placeholder="Minimum 8 characters"
            required
            value={password}
            onChange={e => setPassword((e.target as HTMLInputElement).value)}
            aria-invalid={invalid('password')}
            aria-describedby={showError('password') ? `${passwordId}-err` : undefined}
            onBlur={() => touch('password')}
            onFocus={() => focus('password')}
          />
          <PasswordStrength password={password} />
          {showError('password') && (
            <p id={`${passwordId}-err`} role="alert" className="text-xs text-destructive">
              {errors.password}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={confirmId}>
            Confirm password <span className="text-destructive" aria-hidden="true">*</span>
          </Label>
          <PasswordInput
            id={confirmId}
            name="password_confirmation"
            autoComplete="new-password"
            placeholder="Repeat your password"
            required
            aria-invalid={invalid('password_confirmation')}
            aria-describedby={showError('password_confirmation') ? `${confirmId}-err` : undefined}
            onBlur={() => touch('password_confirmation')}
            onFocus={() => focus('password_confirmation')}
          />
          {showError('password_confirmation') && (
            <p id={`${confirmId}-err`} role="alert" className="text-xs text-destructive">
              {errors.password_confirmation}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading} aria-busy={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthCard>
  )
}
