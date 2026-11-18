'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'
import { ProjectsSkeleton } from '@/components/projects/ProjectsSkeleton'
import { useProjects } from '@/hooks/useProjects'

export function ProjectsClient() {
  const { projects, teams, loading, error, createProject } = useProjects()
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground">All projects across your teams.</p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowModal(true)}
          disabled={teams.length === 0}
          aria-label="Create new project"
        >
          <Plus size={16} aria-hidden="true" />
          New project
        </Button>
      </div>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      {loading ? (
        <ProjectsSkeleton />
      ) : projects.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">No projects yet.</p>
          {teams.length > 0 && (
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowModal(true)}>
              Create your first project
            </Button>
          )}
          {teams.length === 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              You need to be part of a team first.
            </p>
          )}
        </div>
      ) : (
        <ul
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-label={`${projects.length} project${projects.length === 1 ? '' : 's'}`}
        >
          {projects.map((project) => (
            <li key={project.id}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      )}

      <CreateProjectModal
        open={showModal}
        onClose={() => setShowModal(false)}
        teams={teams}
        onCreate={createProject}
      />
    </div>
  )
}
