import { Skeleton } from '@/components/ui/skeleton'

export function AppShellSkeleton() {
  return (
    <div className="flex min-h-screen" aria-busy="true" aria-label="Loading workspace">
      {/* sidebar */}
      <div className="w-56 shrink-0 border-r p-3 space-y-2">
        <Skeleton className="h-7 w-32 mb-4" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full rounded-md" />
        ))}
      </div>

      {/* main */}
      <div className="flex flex-1 flex-col">
        <div className="h-14 border-b flex items-center justify-end px-6 gap-3">
          <Skeleton className="h-7 w-7 rounded-full" />
        </div>
        <div className="p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
