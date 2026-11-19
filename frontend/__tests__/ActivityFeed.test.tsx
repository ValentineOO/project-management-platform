import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import type { ActivityLog } from '@/types'

const NOW = new Date('2026-11-19T12:00:00Z').getTime()

function makeLog(overrides: Partial<ActivityLog>): ActivityLog {
  return {
    id: 1,
    causer_id: 1,
    causer: { id: 1, name: 'Alice' },
    project_id: 10,
    subject_type: 'App\\Models\\Task',
    subject_id: 5,
    action: 'task.created',
    payload: { title: 'Fix login bug' },
    created_at: new Date(NOW - 60_000).toISOString(),
    ...overrides,
  }
}

beforeEach(() => { vi.setSystemTime(NOW) })
afterEach(() => { vi.useRealTimers() })

describe('ActivityFeed', () => {
  it('shows empty state when there are no items', () => {
    render(<ActivityFeed items={[]} />)
    expect(screen.getByText(/no recent activity/i)).toBeInTheDocument()
  })

  it('renders causer name and task.created verb', () => {
    render(<ActivityFeed items={[makeLog({})]} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText(/created task/i)).toBeInTheDocument()
    expect(screen.getByText('Fix login bug')).toBeInTheDocument()
  })

  it('renders project.created with project name', () => {
    const log = makeLog({
      action: 'project.created',
      subject_type: 'App\\Models\\Project',
      payload: { name: 'Auth Service' },
    })
    render(<ActivityFeed items={[log]} />)
    expect(screen.getByText(/created project/i)).toBeInTheDocument()
    expect(screen.getByText('Auth Service')).toBeInTheDocument()
  })

  it('renders team.member_added with member name and email detail', () => {
    const log = makeLog({
      action: 'team.member_added',
      project_id: null,
      subject_type: 'App\\Models\\Team',
      payload: { member_name: 'Bob', member_email: 'bob@example.com' },
    })
    render(<ActivityFeed items={[log]} />)
    expect(screen.getByText(/added/i)).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('bob@example.com')).toBeInTheDocument()
  })

  it('links to /teams/:id for team events (project_id null)', () => {
    const log = makeLog({
      action: 'team.created',
      project_id: null,
      subject_type: 'App\\Models\\Team',
      subject_id: 7,
      payload: { name: 'Engineering' },
    })
    render(<ActivityFeed items={[log]} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/teams/7')
  })

  it('links to /projects/:id for task events', () => {
    const log = makeLog({ project_id: 42 })
    render(<ActivityFeed items={[log]} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/projects/42')
  })

  it('shows timestamp', () => {
    render(<ActivityFeed items={[makeLog({})]} />)
    expect(screen.getByText('1m ago')).toBeInTheDocument()
  })
})
