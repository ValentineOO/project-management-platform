'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'
import { EditProjectModal } from '@/components/projects/EditProjectModal'
import { ProjectsSkeleton } from '@/components/projects/ProjectsSkeleton'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useProjects } from '@/hooks/useProjects'
import { deleteProject } from '@/services/projects'
import type { ProjectWithTeam } from '@/hooks/useProjects'

export function ProjectsClient() {
  const { projects, teams, loading, error, createProject, removeProject, updateCachedProject } = useProjects()

  const [showCreate, setShowCreate] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectWithTeam | null>(null)
  const [deletingProject, setDeletingProject] = useState<ProjectWithTeam | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function handleDelete() {
    if (!deletingProject) return
    setDeleteLoading(true)
    try {
      await deleteProject(deletingProject.id)
      removeProject(deletingProject.id)
      toast.success('Project deleted')
      setDeletingProject(null)
    } catch {
      toast.error('Failed to delete project')
    } finally {
      setDeleteLoading(false)
    }
  }

  function handleProjectUpdated(updated: ProjectWithTeam) {
    updateCachedProject(updated)
    setEditingProject(null)
    toast.success('Project updated')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground">All projects across your teams.</p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
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
            <Button variant="outline" className="mt-4" onClick={() => setShowCreate(true)}>
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
              <ProjectCard
                project={project}
                onEdit={() => setEditingProject(project)}
                onDelete={() => setDeletingProject(project)}
              />
            </li>
          ))}
        </ul>
      )}

      <CreateProjectModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        teams={teams}
        onCreate={createProject}
      />

      {editingProject && (
        <EditProjectModal
          open
          project={editingProject}
          teams={teams}
          onClose={() => setEditingProject(null)}
          onUpdated={handleProjectUpdated}
        />
      )}

      <ConfirmDialog
        open={deletingProject !== null}
        title="Delete project"
        description={`Delete "${deletingProject?.name}"? All tasks will be permanently removed.`}
        confirmLabel="Delete project"
        destructive
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeletingProject(null)}
      />
    </div>
  )
}
