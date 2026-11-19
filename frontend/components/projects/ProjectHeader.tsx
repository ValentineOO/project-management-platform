'use client'

import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn, PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS } from '@/lib/utils'
import type { Project } from '@/types'

interface ProjectHeaderProps {
  project: Project | null
  onAddTask: () => void
}

export function ProjectHeader({ project, onAddTask }: ProjectHeaderProps) {
  return (
    <div className="space-y-1">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Projects
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold">{project?.name}</h1>
            {project && (
              <Badge className={cn('text-xs font-medium border-0', PROJECT_STATUS_COLORS[project.status])}>
                {PROJECT_STATUS_LABELS[project.status] ?? project.status}
              </Badge>
            )}
          </div>
          {project?.description && (
            <p className="text-sm text-muted-foreground">{project.description}</p>
          )}
        </div>
        <Button onClick={onAddTask} className="shrink-0">
          <Plus size={16} aria-hidden="true" />
          Add task
        </Button>
      </div>
    </div>
  )
}
