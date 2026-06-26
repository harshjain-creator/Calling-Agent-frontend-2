import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  PhoneCall, Clock, TrendingUp, RefreshCw, Loader2,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'

export default function SuperAdminDashboard() {
  const [agg, setAgg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  async function load() {
    setLoading(true); setErr(null)
    try {
      const data = await apiFetch('/superadmin/stats')
      setAgg(data?.aggregate || {})
    } catch (e) {
      setErr(e?.body?.detail || e?.message || 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  return (
    <div className="w-full px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Super Admin Dashboard</h1>
          <p className="text-sm text-[var(--color-fg-muted)] mt-1">
            Cross-org aggregate — calls and usage.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={load}>
          <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {err && (
        <Card className="border-red-500/40 bg-red-500/10">
          <CardContent className="pt-5 text-red-500 text-sm">{String(err)}</CardContent>
        </Card>
      )}

      {loading && !agg && (
        <div className="flex items-center justify-center py-16 text-[var(--color-fg-muted)]">
          <Loader2 className="size-5 animate-spin mr-3" /> Loading…
        </div>
      )}

      {agg && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Stat label="Total Calls"   value={agg.calls ?? 0}                                            icon={PhoneCall} />
            <Stat label="Demo Calls"    value={agg.demo_calls ?? 0}                                       icon={PhoneCall} />
            <Stat label="Total Minutes" value={`${(agg.total_minutes ?? 0).toLocaleString('en-IN')}`}     icon={Clock} />
          </div>
        </>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="size-5 text-[var(--color-accent)]" /> Quick links
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild><a href="/admin/calls">All Calls →</a></Button>
              <Button variant="outline" size="sm" asChild><a href="/superadmin/users">Manage Users →</a></Button>
              <Button variant="outline" size="sm" asChild><a href="/admin/scenarios">Scenarios →</a></Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function Stat({ icon: Icon, label, value, highlight = false }) {
  return (
    <Card className={highlight ? 'border-[var(--color-accent)] shadow-md shadow-[var(--color-accent-soft)]' : ''}>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-[var(--color-fg-subtle)] text-xs uppercase tracking-wider mb-2">
          {Icon && <Icon className="size-3.5" />}
          {label}
        </div>
        <p className={`text-2xl font-bold tracking-tight font-display ${highlight ? 'text-gradient-shimmer' : ''}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  )
}
