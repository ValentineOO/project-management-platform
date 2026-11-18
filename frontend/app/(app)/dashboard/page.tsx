'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/dashboard/StatCard'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { useDashboard } from '@/hooks/useDashboard'
import { useAuthContext } from '@/contexts/AuthContext'

export default function DashboardPage() {
  const { user } = useAuthContext()
  const { stats, loading, error } = useDashboard()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">
          Good {greeting()}, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-muted-foreground">Here's what's happening across your projects.</p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">{error}</p>
      )}

      <section aria-label="Overview statistics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total tasks" value={stats?.total_tasks} loading={loading} />
          <StatCard label="Completed" value={stats?.completed_tasks} loading={loading} />
          <StatCard
            label="Overdue"
            value={stats?.overdue_tasks}
            loading={loading}
            className={stats?.overdue_tasks ? 'border-destructive/40' : ''}
          />
        </div>
      </section>

      <section aria-labelledby="activity-heading">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle id="activity-heading" className="text-base font-medium">
              Recent activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (
              <ActivityFeed items={stats?.recent_activity ?? []} />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
