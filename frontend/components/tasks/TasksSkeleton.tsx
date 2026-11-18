import { Skeleton } from '@/components/ui/skeleton'

export function TasksSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading tasks">
      <div className="rounded-lg border divide-y overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="px-4 py-3 flex items-center gap-3">
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
