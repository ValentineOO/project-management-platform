import Link from 'next/link'
import { cn } from '@/lib/utils'

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
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>

      <div
        className={cn(
          'rounded-xl border border-slate-200 bg-white px-6 py-7 shadow-sm',
        )}
      >
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </div>
        )}
        {children}
      </div>

      <p className="text-center text-sm text-slate-500">
        {footerText}{' '}
        <Link
          href={footerHref}
          className="font-medium text-indigo-600 hover:text-indigo-700 focus-visible:outline-none focus-visible:underline"
        >
          {footerLinkLabel}
        </Link>
      </p>
    </div>
  )
}
