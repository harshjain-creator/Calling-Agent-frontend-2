import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  PhoneCall, Clock, RefreshCw, Upload, FileText, ChevronRight,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SkeletonList, SkeletonLine } from '@/components/ui/skeleton'
import { apiFetch } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

function fmtDur(s) {
  if (s == null) return '—'
  const m = Math.floor(s / 60), sec = Math.floor(s % 60).toString().padStart(2, '0')
  return `${m}m ${sec}s`
}

export default function ClientDashboard() {
  const { user } = useAuth()
  const [calls,       setCalls]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [err,         setErr]         = useState(null)

  async function load() {
    setLoading(true); setErr(null)
    try {
      const callsRes = await apiFetch('/admin/calls')
      setCalls(Array.isArray(callsRes) ? callsRes : [])
    } catch (e) {
      setErr(e?.body?.detail || e?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const totalCalls = calls.length
  const totalDur   = calls.reduce((acc, c) => acc + Number(c.duration_s || 0), 0)
  const interested = calls.filter(c => c.summary_json?.outcome === 'interested').length

  return (
    <div className="w-full px-4 sm:px-6 py-8 space-y-6">
      {/* Heading */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Welcome{user?.full_name ? `, ${user.full_name}` : ''}
          </h1>
          <p className="text-sm text-[var(--color-fg-muted)] mt-1">Recent activity for your org.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={load}>
          <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Stat cards */}
      {loading && calls.length === 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[0,1,2].map(i => (
            <Card key={i}><CardContent className="p-5 space-y-3">
              <SkeletonLine width="50%" height={12} />
              <SkeletonLine width="80%" height={28} />
            </CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Stat label="Total Calls" value={totalCalls}            icon={PhoneCall} />
          <Stat label="Total Time"  value={fmtDur(totalDur)}      icon={Clock} />
          <Stat label="Interested"  value={interested}            icon={PhoneCall} />
        </div>
      )}

      {err && (
        <Card className="border-red-500/40 bg-red-500/10">
          <CardContent className="pt-5 text-red-500 text-sm">{String(err)}</CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <ActionCard
          to="/bulk" icon={Upload}
          title="Start a Bulk Call"
          desc="Upload CSV, pick a scenario, dial in parallel."
        />
        <ActionCard
          to="/admin/scenarios" icon={FileText}
          title="Add Scenario"
          desc="Create private scenarios scoped to your org."
        />
        <ActionCard
          to="/admin/calls" icon={PhoneCall}
          title="Call History"
          desc="Recordings, transcripts and AI summaries."
        />
      </div>

      {/* Recent calls */}
      <div>
        <h2 className="font-display text-xl font-semibold mb-3">Recent Calls</h2>
        {loading && <SkeletonList count={4} />}
        {!loading && calls.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-[var(--color-fg-muted)] text-sm">
              No calls yet. Start a bulk run to see results here.
            </CardContent>
          </Card>
        )}
        {!loading && calls.slice(0, 5).map((c, i) => {
          const u = c.users || {}
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className="mb-3"
            >
              <Link to={`/admin/calls/${c.id}`} className="block group">
                <Card className="hover:border-[var(--color-accent)] transition-all">
                  <CardContent className="pt-4 pb-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center">
                      <PhoneCall className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{u.name || 'Unknown'} · <span className="text-[var(--color-fg-muted)] font-normal">{u.phone}</span></p>
                      <p className="text-xs text-[var(--color-fg-subtle)] line-clamp-1">{c.scenario}</p>
                    </div>
                    <span className="text-xs text-[var(--color-fg-muted)]">{fmtDur(c.duration_s)}</span>
                    <ChevronRight className="size-4 text-[var(--color-fg-subtle)] group-hover:text-[var(--color-accent)] transition-colors" />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          )
        })}
        {calls.length > 5 && (
          <Button variant="outline" size="sm" asChild className="mt-2">
            <Link to="/admin/calls">View all {calls.length} calls →</Link>
          </Button>
        )}
      </div>
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

function ActionCard({ to, icon: Icon, title, desc }) {
  return (
    <Link to={to} className="block group">
      <Card className="h-full hover:border-[var(--color-accent)] hover:shadow-md hover:shadow-[var(--color-accent-soft)] transition-all">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
              <Icon className="size-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{title}</p>
                <ChevronRight className="size-4 text-[var(--color-fg-subtle)] group-hover:text-[var(--color-accent)] group-hover:translate-x-0.5 transition" />
              </div>
              <p className="text-sm text-[var(--color-fg-muted)] mt-1 leading-relaxed">{desc}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
