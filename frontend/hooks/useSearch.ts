'use client'

import { useCallback, useRef, useState } from 'react'
import { search as searchService } from '@/services/search'
import type { SearchResults } from '@/services/search'

export function useSearch() {
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestQuery = useRef('')

  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (q.trim().length < 2) {
      setResults(null)
      setLoading(false)
      return
    }

    latestQuery.current = q
    setLoading(true)
    setError(null)

    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchService(q)
        if (latestQuery.current === q) setResults(data)
      } catch {
        if (latestQuery.current === q) setError('Search failed.')
      } finally {
        if (latestQuery.current === q) setLoading(false)
      }
    }, 300)
  }, [])

  const clear = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setResults(null)
    setLoading(false)
    setError(null)
    latestQuery.current = ''
  }, [])

  return { results, loading, error, search, clear }
}
