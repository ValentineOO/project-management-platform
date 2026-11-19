'use client'

import { useId, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthContext } from '@/contexts/AuthContext'
import { updateProfile, changePassword } from '@/services/profile'
import { extractApiErrors } from '@/lib/utils'

export function ProfileClient() {
  const { user, setUser } = useAuthContext()

  // ── update name ───────────────────────────────────────────────────────────
  const nameId = useId()
  const [name, setName] = useState(user?.name ?? '')
  const [nameLoading, setNameLoading] = useState(false)
  const [nameErrors, setNameErrors] = useState<Record<string, string>>({})

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    setNameLoading(true)
    setNameErrors({})
    try {
      const updated = await updateProfile({ name: name.trim() })
      setUser(updated)
      toast.success('Profile updated')
    } catch (err) {
      setNameErrors(extractApiErrors(err))
    } finally {
      setNameLoading(false)
    }
  }

  // ── change password ───────────────────────────────────────────────────────
  const currentPwId = useId()
  const newPwId = useId()
  const confirmPwId = useId()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({})

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwLoading(true)
    setPwErrors({})
    try {
      await changePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      })
      toast.success('Password changed')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPwErrors(extractApiErrors(err))
    } finally {
      setPwLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account details.</p>
      </div>

      {/* Account info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Account information</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor={nameId}>Display name</Label>
              <Input
                id={nameId}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                aria-invalid={!!nameErrors.name}
              />
              {nameErrors.name && (
                <p role="alert" className="text-xs text-destructive">{nameErrors.name}</p>
              )}
            </div>
            {nameErrors._root && (
              <p role="alert" className="text-sm text-destructive">{nameErrors._root}</p>
            )}
            <Button type="submit" disabled={nameLoading} aria-busy={nameLoading}>
              {nameLoading ? 'Saving…' : 'Save'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Change password</CardTitle>
          <CardDescription>Use at least 8 characters.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor={currentPwId}>Current password</Label>
              <Input
                id={currentPwId}
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                aria-invalid={!!pwErrors.current_password}
              />
              {pwErrors.current_password && (
                <p role="alert" className="text-xs text-destructive">{pwErrors.current_password}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={newPwId}>New password</Label>
              <Input
                id={newPwId}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                aria-invalid={!!pwErrors.password}
              />
              {pwErrors.password && (
                <p role="alert" className="text-xs text-destructive">{pwErrors.password}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={confirmPwId}>Confirm new password</Label>
              <Input
                id={confirmPwId}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {pwErrors._root && (
              <p role="alert" className="text-sm text-destructive">{pwErrors._root}</p>
            )}
            <Button type="submit" disabled={pwLoading} aria-busy={pwLoading}>
              {pwLoading ? 'Saving…' : 'Change password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
