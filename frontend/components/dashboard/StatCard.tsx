import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: number | undefined
  highlight?: boolean
  className?: string
}

export function StatCard({ label, value, highlight, className }: StatCardProps) {
  return (
    <Card className={cn(highlight && 'border-destructive/40', className)}>
      <CardContent className="pt-5">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="mt-1.5 block text-2xl font-bold tabular-nums">{value ?? '—'}</span>
      </CardContent>
    </Card>
  )
}
