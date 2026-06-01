import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'

/**
 * Fetches /scenarios — role-scoped on the server. Anonymous callers get the
 * public list. Authed callers get public + own-org private.
 *
 * Returns { scenarios, loading, error, reload }.
 * `scenarios` rows: { id, title, summary, is_private, org_id, is_active }
 */
export function useScenarios({ skipAuth = false } = {}) {
  const [scenarios, setScenarios] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  async function reload() {
    setLoading(true); setError(null)
    try {
      const data = await apiFetch('/scenarios', { skipAuth })
      setScenarios(Array.isArray(data?.scenarios) ? data.scenarios : [])
    } catch (e) {
      setError(e.body?.detail || e.message || 'Failed to load scenarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reload() }, [skipAuth])

  return { scenarios, loading, error, reload }
}
