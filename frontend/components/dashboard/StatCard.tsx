import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: number | undefined
  loading?: boolean
  highlight?: boolean
  className?: string
}

export function StatCard({ label, value, loading, highlight, className }: StatCardProps) {
  return (
    <Card className={cn(highlight && 'border-destructive/40', className)}>
      <CardContent className="pt-5">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="mt-1.5 h-8 flex items-center">
          {loading ? (
            <Spinner size="sm" aria-label={`Loading ${label}`} />
          ) : (
            <span className="text-2xl font-bold tabular-nums">{value ?? '—'}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
