import Link from 'next/link'
import { FolderKanban } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ProjectWithTeam } from '@/hooks/useProjects'

interface ProjectCardProps {
  project: ProjectWithTeam
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
      aria-label={`Open project ${project.name}`}
    >
      <Card className="h-full transition-shadow group-hover:shadow-md group-focus-visible:shadow-md">
        <CardContent className="pt-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FolderKanban size={16} className="shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="font-medium truncate">{project.name}</span>
            </div>
            <Badge
              variant={project.status === 'active' ? 'default' : 'secondary'}
              className="shrink-0 capitalize"
            >
              {project.status}
            </Badge>
          </div>

          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
          )}

          <p className="text-xs text-muted-foreground">{project.team.name}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
