'use client'

import { useEffect, useId, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FolderKanban, CheckSquare, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn, STATUS_LABELS, PRIORITY_LABELS, STATUS_COLORS, PRIORITY_COLORS } from '@/lib/utils'
import { useSearch } from '@/hooks/useSearch'
import type { TaskStatus, TaskPriority } from '@/types'

interface SearchPaletteProps {
  open: boolean
  onClose: () => void
}

export function SearchPalette({ open, onClose }: SearchPaletteProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { results, loading, error, search, clear } = useSearch()

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      clear()
    }
  }, [open, clear])

  function handleClose() {
    clear()
    onClose()
  }

  function navigate(href: string) {
    router.push(href)
    handleClose()
  }

  const projects = results?.projects ?? []
  const tasks = results?.tasks ?? []
  const hasResults = projects.length > 0 || tasks.length > 0
  const isEmpty = results !== null && !hasResults && !loading

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 border-b px-4 py-3">
          {loading ? (
            <Loader2 size={16} className="shrink-0 text-muted-foreground animate-spin" aria-hidden="true" />
          ) : (
            <Search size={16} className="shrink-0 text-muted-foreground" aria-hidden="true" />
          )}
          <Input
            ref={inputRef}
            id={inputId}
            placeholder="Search projects and tasks…"
            className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto text-sm"
            onChange={(e) => search(e.target.value)}
            aria-label="Search"
            autoComplete="off"
          />
        </div>

        {error && (
          <p role="alert" className="px-4 py-3 text-sm text-destructive">{error}</p>
        )}

        {isEmpty && (
          <p className="px-4 py-6 text-sm text-center text-muted-foreground">No results found.</p>
        )}

        {hasResults && (
          <div className="max-h-96 overflow-y-auto py-2" role="listbox" aria-label="Search results">
            {projects.length > 0 && (
              <section aria-label="Projects">
                <p className="px-4 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Projects
                </p>
                {projects.map((p) => (
                  <button
                    key={p.id}
                    role="option"
                    aria-selected="false"
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                  >
                    <FolderKanban size={15} className="shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="flex-1 text-sm truncate">{p.name}</span>
                    <Badge variant="secondary" className="text-xs capitalize">{p.status}</Badge>
                  </button>
                ))}
              </section>
            )}

            {tasks.length > 0 && (
              <section aria-label="Tasks" className={cn(projects.length > 0 && 'mt-1')}>
                <p className="px-4 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Tasks
                </p>
                {tasks.map((t) => (
                  <button
                    key={t.id}
                    role="option"
                    aria-selected="false"
                    onClick={() => navigate(`/projects/${t.project_id}`)}
                    className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                  >
                    <CheckSquare size={15} className="shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="flex-1 text-sm truncate">{t.title}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="secondary" className={cn('text-xs', PRIORITY_COLORS[t.priority as TaskPriority])}>
                        {PRIORITY_LABELS[t.priority as TaskPriority]}
                      </Badge>
                      <Badge variant="secondary" className={cn('text-xs', STATUS_COLORS[t.status as TaskStatus])}>
                        {STATUS_LABELS[t.status as TaskStatus]}
                      </Badge>
                    </div>
                  </button>
                ))}
              </section>
            )}
          </div>
        )}

        {!results && !loading && (
          <p className="px-4 py-6 text-sm text-center text-muted-foreground">
            Type at least 2 characters to search.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
