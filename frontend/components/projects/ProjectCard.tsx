import Link from 'next/link'
import { FolderKanban, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn, PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS } from '@/lib/utils'
import type { ProjectWithTeam } from '@/hooks/useProjects'

interface ProjectCardProps {
  project: ProjectWithTeam
  onEdit?: () => void
  onDelete?: () => void
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const hasActions = !!(onEdit || onDelete)

  return (
    <div className="relative group">
      <Link
        href={`/projects/${project.id}`}
        className="absolute inset-0 rounded-lg z-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Open project ${project.name}`}
        tabIndex={0}
      />
      <Card className="h-full transition-shadow group-hover:shadow-md pointer-events-none">
        <CardContent className="pt-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FolderKanban size={16} className="shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="font-medium truncate">{project.name}</span>
            </div>
            <Badge className={cn('shrink-0 text-xs font-medium border-0', PROJECT_STATUS_COLORS[project.status])}>
              {PROJECT_STATUS_LABELS[project.status] ?? project.status}
            </Badge>
          </div>

          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
          )}

          <p className="text-xs text-muted-foreground">{project.team.name}</p>
        </CardContent>
      </Card>

      {hasActions && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-muted-foreground hover:text-foreground pointer-events-auto"
              aria-label={`Edit ${project.name}`}
              onClick={(e) => { e.preventDefault(); onEdit() }}
            >
              <Pencil size={13} aria-hidden="true" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-muted-foreground hover:text-destructive pointer-events-auto"
              aria-label={`Delete ${project.name}`}
              onClick={(e) => { e.preventDefault(); onDelete() }}
            >
              <Trash2 size={13} aria-hidden="true" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
