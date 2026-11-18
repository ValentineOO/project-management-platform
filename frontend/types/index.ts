export interface User {
  id: number
  name: string
  email: string
  created_at: string
}

export interface Team {
  id: number
  name: string
  description: string | null
  owner_id: number
  pivot?: { role: 'owner' | 'admin' | 'member' }
  created_at: string
}

export interface Project {
  id: number
  name: string
  description: string | null
  team_id: number
  status: 'active' | 'archived'
  pivot?: { role: 'manager' | 'member' | 'viewer' }
  created_at: string
  updated_at: string
}

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
  id: number
  project_id: number
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assignee_id: number | null
  assignee?: Pick<User, 'id' | 'name'>
  reporter_id: number
  due_date: string | null
  version: number
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: number
  causer_id: number
  causer?: Pick<User, 'id' | 'name'>
  subject_type: string
  subject_id: number
  action: string
  payload: Record<string, unknown>
  created_at: string
}

export interface DashboardStats {
  teams: number
  projects: {
    total: number
    by_status: Record<string, number>
  }
  tasks: {
    assigned_to_me: {
      total: number
      by_status: Record<string, number>
    }
    overdue: number
  }
  recent_activity: ActivityLog[]
}

export interface CursorPaginatedResponse<T> {
  data: T[]
  next_cursor: string | null
  prev_cursor: string | null
  per_page: number
  path: string
  next_page_url: string | null
  prev_page_url: string | null
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}
