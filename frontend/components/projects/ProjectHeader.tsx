'use client'

import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Project } from '@/types'

interface ProjectHeaderProps {
  project: Project | null
  onAddTask: () => void
  onEdit: () => void
  onDelete: () => void
}

export function ProjectHeader({ project, onAddTask, onEdit, onDelete }: ProjectHeaderProps) {
  return (
    <div>
      <Link
        href="/projects"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Projects
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">{project?.name}</h1>
          {project?.description && (
            <p className="text-sm text-muted-foreground">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {project && (
            <Badge
              variant={project.status === 'active' ? 'default' : 'secondary'}
              className="capitalize"
            >
              {project.status}
            </Badge>
          )}
          {project && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil size={14} aria-hidden="true" />
              Edit
            </Button>
          )}
          {project && (
            <Button variant="outline" size="sm" onClick={onDelete} className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
              <Trash2 size={14} aria-hidden="true" />
              Delete
            </Button>
          )}
          <Button onClick={onAddTask}>
            <Plus size={16} aria-hidden="true" />
            Add task
          </Button>
        </div>
      </div>
    </div>
  )
}
