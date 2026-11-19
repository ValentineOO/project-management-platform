import { cn } from 'cn'

type Strength = 'weak' | 'fair' | 'strong'

export function getPasswordStrength(pw: string): Strength {
  if (pw.length === 0) return 'weak'
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 2) return 'weak'
  if (score <= 3) return 'fair'
  return 'strong'
}

const labels: Record<Strength, string> = {
  weak: 'Weak',
  fair: 'Fair',
  strong: 'Strong',
}

const colors: Record<Strength, string> = {
  weak: 'bg-destructive',
  fair: 'bg-amber-400',
  strong: 'bg-emerald-500',
}

const widths: Record<Strength, string> = {
  weak: 'w-1/3',
  fair: 'w-2/3',
  strong: 'w-full',
}

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (password.length === 0) return null

  const strength = getPasswordStrength(password)

  return (
    <div className="mt-1.5 space-y-1">
      <div className="h-1 w-full overflow-hidden rounded-full bg-border">
        <div
          className={cn('h-full rounded-full transition-all duration-300', colors[strength], widths[strength])}
        />
      </div>
      <p className={cn('text-xs font-medium', {
        'text-destructive': strength === 'weak',
        'text-amber-500': strength === 'fair',
        'text-emerald-600 dark:text-emerald-400': strength === 'strong',
      })}>
        {labels[strength]}
      </p>
    </div>
  )
}
