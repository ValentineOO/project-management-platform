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
      {/* Full-card navigation link sits beneath everything */}
      <Link
        href={`/projects/${project.id}`}
        className="absolute inset-0 rounded-lg z-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Open project ${project.name}`}
      />

      <Card className="h-full transition-shadow group-hover:shadow-md">
        <CardContent className={cn('pt-5 space-y-2', hasActions ? 'pb-3' : 'pb-5')}>
          {/* Name + badge on the same line */}
          <div className="flex items-center gap-2 flex-wrap">
            <FolderKanban size={15} className="shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="font-medium truncate">{project.name}</span>
            <Badge className={cn('text-xs font-medium border-0 ml-auto shrink-0', PROJECT_STATUS_COLORS[project.status])}>
              {PROJECT_STATUS_LABELS[project.status] ?? project.status}
            </Badge>
          </div>

          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 pl-5">{project.description}</p>
          )}

          <p className="text-xs text-muted-foreground pl-5">{project.team.name}</p>

          {hasActions && (
            <div className="flex items-center justify-end gap-1 pt-2 border-t border-border/50 relative z-10">
              {onEdit && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
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
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  aria-label={`Delete ${project.name}`}
                  onClick={(e) => { e.preventDefault(); onDelete() }}
                >
                  <Trash2 size={13} aria-hidden="true" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
