import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'

interface AuthCardProps {
  title: string
  subtitle: string
  footerText: string
  footerLinkLabel: string
  footerHref: string
  children: React.ReactNode
  error?: string
}

export function AuthCard({
  title,
  subtitle,
  footerText,
  footerLinkLabel,
  footerHref,
  children,
  error,
}: AuthCardProps) {
  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          )}
          {children}
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        {footerText}{' '}
        <Link
          href={footerHref}
          className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:underline"
        >
          {footerLinkLabel}
        </Link>
      </p>
    </div>
  )
}
