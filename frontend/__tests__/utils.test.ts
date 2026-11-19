import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { timeAgo, extractApiErrors, STATUS_LABELS, PRIORITY_LABELS } from '@/lib/utils'

describe('timeAgo', () => {
  const NOW = new Date('2026-11-19T12:00:00Z').getTime()

  beforeEach(() => {
    vi.setSystemTime(NOW)
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "just now" for timestamps less than 1 minute ago', () => {
    const iso = new Date(NOW - 30_000).toISOString()
    expect(timeAgo(iso)).toBe('just now')
  })

  it('returns minutes for timestamps 1–59 minutes ago', () => {
    const iso = new Date(NOW - 5 * 60_000).toISOString()
    expect(timeAgo(iso)).toBe('5m ago')
  })

  it('returns hours for timestamps 1–23 hours ago', () => {
    const iso = new Date(NOW - 3 * 60 * 60_000).toISOString()
    expect(timeAgo(iso)).toBe('3h ago')
  })

  it('returns days for timestamps 1–6 days ago', () => {
    const iso = new Date(NOW - 2 * 24 * 60 * 60_000).toISOString()
    expect(timeAgo(iso)).toBe('2d ago')
  })
})

describe('extractApiErrors', () => {
  it('extracts field errors from Laravel 422 array values', () => {
    const err = { response: { data: { errors: { email: ['The email is taken.'] } } } }
    expect(extractApiErrors(err)).toEqual({ email: 'The email is taken.' })
  })

  it('extracts field errors from plain string values', () => {
    const err = { response: { data: { errors: { email: 'No user found with that email.' } } } }
    expect(extractApiErrors(err)).toEqual({ email: 'No user found with that email.' })
  })

  it('falls back to _root when only message is present', () => {
    const err = { response: { data: { message: 'Unauthenticated.' } } }
    expect(extractApiErrors(err)).toEqual({ _root: 'Unauthenticated.' })
  })

  it('returns generic _root for unknown error shapes', () => {
    expect(extractApiErrors(new Error('network'))).toEqual({ _root: 'An unexpected error occurred.' })
  })

  it('picks the first element when errors is an array with multiple messages', () => {
    const err = { response: { data: { errors: { password: ['Too short.', 'Missing uppercase.'] } } } }
    expect(extractApiErrors(err)).toEqual({ password: 'Too short.' })
  })
})

describe('STATUS_LABELS', () => {
  it('covers all four task statuses', () => {
    expect(Object.keys(STATUS_LABELS)).toEqual(['todo', 'in_progress', 'in_review', 'done'])
  })
})

describe('PRIORITY_LABELS', () => {
  it('covers all four priority levels', () => {
    expect(Object.keys(PRIORITY_LABELS)).toEqual(['low', 'medium', 'high', 'urgent'])
    expect(PRIORITY_LABELS.urgent).toBe('Urgent')
  })
})
