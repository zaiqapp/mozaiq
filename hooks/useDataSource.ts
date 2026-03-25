import { useState, useEffect, useRef } from 'react'
import type { Widget } from '@/types/dashboard'

export interface DataSourceResult {
  rows: Record<string, unknown>[] | null
  isLoading: boolean
  error: string | null
  lastFetched: string | null
}

export function useDataSource(widget: Widget): DataSourceResult {
  const ds = widget.dataSource

  const [rows, setRows] = useState<Record<string, unknown>[] | null>(
    ds?.type === 'csv' ? (ds.data ?? null) : null
  )
  const [isLoading, setIsLoading] = useState(ds?.type === 'google-sheets')
  const [error, setError] = useState<string | null>(null)
  const [lastFetched, setLastFetched] = useState<string | null>(null)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (ds?.type === 'csv') {
      setRows(ds.data ?? null)
      setIsLoading(false)
      return
    }

    if (ds?.type !== 'google-sheets' || !ds.url) {
      setRows(null)
      setIsLoading(false)
      return
    }

    const url = ds.url
    const gid = ds.gid
    const refreshInterval = ds.refreshInterval ?? 60
    const MIN_INTERVAL = 10

    const fetchSheet = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({ url })
        if (gid) params.set('gid', gid)
        const res = await fetch(`/api/data/google-sheets?${params.toString()}`)
        if (!res.ok) {
          const body = await res.json() as { error?: string }
          throw new Error(body.error ?? `HTTP ${res.status}`)
        }
        const data = await res.json() as { rows: Record<string, unknown>[] }
        setRows(data.rows)
        setLastFetched(new Date().toISOString())
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fetch failed')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSheet()

    if (refreshInterval > 0) {
      const interval = Math.max(MIN_INTERVAL, refreshInterval) * 1000
      intervalRef.current = setInterval(fetchSheet, interval)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [ds?.type, ds?.url, ds?.gid, ds?.refreshInterval, ds?.data])

  if (!ds) return { rows: null, isLoading: false, error: null, lastFetched: null }

  return { rows, isLoading, error, lastFetched }
}
