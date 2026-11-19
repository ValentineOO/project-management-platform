'use client'

import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addTeamMember } from '@/services/teams'
import { extractApiErrors } from '@/lib/utils'
import type { TeamMember } from '@/hooks/useTeam'

interface AddMemberModalProps {
  open: boolean
  teamId: number
  onClose: () => void
  onAdded: (member: TeamMember) => void
}

export function AddMemberModal({ open, teamId, onClose, onAdded }: AddMemberModalProps) {
  const nameId = useId()
  const emailId = useId()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleClose() {
    setName('')
    setEmail('')
    setErrors({})
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      const member = await addTeamMember(teamId, { name: name.trim(), email: email.trim() })
      onAdded(member as TeamMember)
      handleClose()
    } catch (err) {
      setErrors(extractApiErrors(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add member</DialogTitle>
          <DialogDescription>
            Add a teammate by name and email. If they don&apos;t have an account yet, one will be
            created — their initial password will be their email address.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor={nameId}>
              Full name <span className="text-destructive" aria-hidden="true">*</span>
            </Label>
            <Input
              id={nameId}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              required
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? `${nameId}-err` : undefined}
            />
            {errors.name && (
              <p id={`${nameId}-err`} role="alert" className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={emailId}>
              Email address <span className="text-destructive" aria-hidden="true">*</span>
            </Label>
            <Input
              id={emailId}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              required
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? `${emailId}-err` : undefined}
            />
            {errors.email && (
              <p id={`${emailId}-err`} role="alert" className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>
          {errors._root && <p role="alert" className="text-sm text-destructive">{errors._root}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} aria-busy={loading}>
              {loading ? 'Adding…' : 'Add member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
