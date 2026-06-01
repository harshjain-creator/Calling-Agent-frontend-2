import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search, Phone, Clock, RefreshCw, Loader2,
  Users, BarChart3, ChevronRight, X, Upload, Trash2,
} from 'lucide-react'

import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { SkeletonTable } from '@/components/ui/skeleton'
import OutcomeBadge from '@/components/OutcomeBadge'
import { useAuth } from '@/contexts/AuthContext'
import { confirm as swalConfirm, toast, alertError } from '@/lib/swal'

function fmtDur(s) {
  if (s == null) return '—'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60).toString().padStart(2, '0')
  return `${m}m ${sec}s`
}
function relTime(iso) {
  if (!iso) return ''
  const d = new Date(iso).getTime()
  const diff = (Date.now() - d) / 1000
  if (diff < 60)     return 'just now'
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(iso).toLocaleDateString()
}

const OUTCOME_FILTERS = [
  'interested', 'callback_requested', 'meeting_scheduled',
  'information_shared', 'not_interested', 'unclear', 'call_dropped',
]

export default function AdminCalls() {
  const { role } = useAuth()
  const isSuper  = role === 'super_admin'
  const [calls,      setCalls]      = useState([])
  const [deletingId, setDeletingId] = useState(null)
  const [loading,  setLoad]    = useState(true)
  const [err,      setErr]     = useState(null)
  const [q,        setQ]       = useState('')
  const [outcomeFilter, setOutcomeFilter] = useState(null)
  const [directionFilter, setDirectionFilter] = useState('all')  // 'all' | 'inbound' | 'outbound'

  const load = async () => {
    setLoad(true); setErr(null)
    try {
      const data = await apiFetch('/admin/calls')
      setCalls(Array.isArray(data) ? data : [])
    } catch (e) {
      setErr(e.body?.detail || e.body?.error || e.message || 'Failed to load')
    } finally {
      setLoad(false)
    }
  }
  useEffect(() => { load() }, [])

  async function handleDelete(c, e) {
    e.preventDefault(); e.stopPropagation()
    const who = c.users?.name || c.users?.phone || c.id.slice(0, 8)
    const ok = await swalConfirm({
      title: 'Delete call?',
      text:  `Call with ${who}: recording + transcript will be permanently removed.`,
      confirmText: 'Delete', danger: true,
    })
    if (!ok) return
    setDeletingId(c.id)
    try {
      await apiFetch(`/admin/calls/${c.id}`, { method: 'DELETE' })
      setCalls(list => list.filter(x => x.id !== c.id))
      toast({ icon: 'success', text: 'Call deleted' })
    } catch (err) {
      await alertError(err?.body?.detail || err?.message || 'Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  const stats = useMemo(() => {
    const total = calls.length
    const uniqUsers = new Set(calls.map(c => c.user_id).filter(Boolean)).size
    const durations = calls.map(c => c.duration_s).filter(v => v != null)
    const avgDur = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0
    const interested = calls.filter(c => c.summary_json?.outcome === 'interested').length
    return { total, uniqUsers, avgDur, interested }
  }, [calls])

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    return calls.filter(c => {
      if (directionFilter === 'inbound'  && !c.is_inbound) return false
      if (directionFilter === 'outbound' &&  c.is_inbound) return false
      if (outcomeFilter && c.summary_json?.outcome !== outcomeFilter) return false
      if (!t) return true
      const u = c.users || {}
      return (
        (u.name  || '').toLowerCase().includes(t) ||
        (u.email || '').toLowerCase().includes(t) ||
        (u.phone || '').toLowerCase().includes(t) ||
        (c.scenario || '').toLowerCase().includes(t) ||
        (c.summary  || '').toLowerCase().includes(t) ||
        (c.call_sid || '').toLowerCase().includes(t)
      )
    })
  }, [calls, q, outcomeFilter, directionFilter])

  const dirCounts = useMemo(() => ({
    all:      calls.length,
    inbound:  calls.filter(c => c.is_inbound).length,
    outbound: calls.filter(c => !c.is_inbound).length,
  }), [calls])

  return (
    <div className="w-full px-4 sm:px-6 py-8 space-y-6">
      {/* Heading */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Calls</h1>
          <p className="text-sm text-[var(--color-fg-muted)] mt-1">
            Recordings, transcripts and AI summaries across every call.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/bulk"><Upload className="size-4" /> Bulk Call</Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={load}>
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Phone}     label="Total Calls"      value={stats.total} />
        <StatCard icon={Users}     label="Unique Customers" value={stats.uniqUsers} />
        <StatCard icon={Clock}     label="Avg Duration"     value={fmtDur(stats.avgDur)} />
        <StatCard icon={BarChart3} label="Interested"       value={stats.interested} />
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-3 flex items-center gap-3">
          <Search className="size-4 text-[var(--color-fg-subtle)] ml-1" />
          <Input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search name, email, phone, scenario, summary, or SID…"
            className="flex-1 border-0 bg-transparent h-9 focus-visible:ring-0 px-0"
          />
          {q && (
            <button onClick={() => setQ('')} className="text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)]" aria-label="Clear search">
              <X className="size-4" />
            </button>
          )}
          <span className="text-xs text-[var(--color-fg-subtle)] whitespace-nowrap pr-1">
            {filtered.length} / {calls.length}
          </span>
        </CardContent>
      </Card>

      {/* Direction tabs */}
      <div className="flex gap-1 border-b border-[var(--color-border)]">
        {[
          { key: 'all',      label: 'All' },
          { key: 'inbound',  label: 'Inbound' },
          { key: 'outbound', label: 'Outbound' },
        ].map(t => (
          <button key={t.key}
            onClick={() => setDirectionFilter(t.key)}
            className={`px-4 py-2 text-sm font-medium relative -mb-px border-b-2 transition-colors ${
              directionFilter === t.key
                ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'border-transparent text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]'
            }`}
          >
            {t.label}
            <span className="ml-2 text-xs text-[var(--color-fg-subtle)]">({dirCounts[t.key]})</span>
          </button>
        ))}
      </div>

      {/* Outcome filter chips */}
      <div className="flex flex-wrap gap-2">
        <FilterChip active={outcomeFilter === null} onClick={() => setOutcomeFilter(null)}>All</FilterChip>
        {OUTCOME_FILTERS.map(o => (
          <FilterChip
            key={o}
            active={outcomeFilter === o}
            onClick={() => setOutcomeFilter(outcomeFilter === o ? null : o)}
          >
            {o.replace(/_/g, ' ')}
          </FilterChip>
        ))}
      </div>

      {/* List */}
      {loading && <SkeletonTable rows={6} cols={5} />}
      {err && !loading && (
        <Card className="border-red-500/40 bg-red-500/10">
          <CardContent className="pt-6 text-red-500 text-sm">Error: {err}</CardContent>
        </Card>
      )}
      {!loading && !err && filtered.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Phone className="size-10 text-[var(--color-fg-subtle)] mx-auto mb-3" />
            <p className="text-[var(--color-fg)] text-base mb-1">No calls match your filters</p>
            <p className="text-[var(--color-fg-subtle)] text-sm">Try clearing search or outcome filter.</p>
          </CardContent>
        </Card>
      )}
      {!loading && !err && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((c, i) => {
            const u  = c.users || {}
            const js = c.summary_json || {}
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.4) }}
              >
                <Link to={`/admin/calls/${c.id}`} className="group block">
                  <Card className="hover:border-[var(--color-accent)] hover:shadow-md hover:translate-x-0.5 transition-all">
                    <CardContent className="pt-5 pb-5">
                      <div className="flex items-start gap-4">
                        <div className="h-11 w-11 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
                          <Phone className="size-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-baseline gap-2 mb-1">
                            <span className="text-[var(--color-fg)] font-semibold">{u.name || 'Unknown'}</span>
                            <span className="text-[var(--color-fg-subtle)] text-xs">·</span>
                            <span className="text-[var(--color-fg-muted)] text-sm truncate">{u.email}</span>
                            <span className="text-[var(--color-fg-subtle)] text-xs">·</span>
                            <span className="text-[var(--color-fg-muted)] text-sm">{u.phone}</span>
                          </div>
                          <p className="text-[var(--color-fg-muted)] text-sm line-clamp-1">{c.scenario || '—'}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[var(--color-fg-subtle)]">
                            <span className="flex items-center gap-1.5"><Clock className="size-3" /> {relTime(c.started_at)}</span>
                            <span>·</span>
                            <span>{fmtDur(c.duration_s)}</span>
                            <span>·</span>
                            <span className="uppercase">{c.language_initial || '—'}</span>
                            {c.audio_mode    && <><span>·</span><span>{c.audio_mode}</span></>}
                            {c.recording_url && <><span>·</span><span className="text-emerald-500">recording</span></>}
                            {isSuper && c.total_cost_inr != null && (
                              <><span>·</span><span title="Cost (we pay)">Cost ₹{Number(c.total_cost_inr).toFixed(2)}</span></>
                            )}
                            {c.total_sell_inr != null && (
                              <><span>·</span><span title="Selling (client pays)" className="text-[var(--color-accent)]">
                                {isSuper ? 'Sell' : 'Spent'} ₹{Number(c.total_sell_inr).toFixed(2)}
                              </span></>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          {js.outcome   && <OutcomeBadge value={js.outcome}   kind="outcome" />}
                          {js.sentiment && <OutcomeBadge value={js.sentiment} kind="sentiment" />}
                        </div>
                        {isSuper && (
                          <button
                            type="button"
                            onClick={(e) => handleDelete(c, e)}
                            disabled={deletingId === c.id}
                            aria-label="Delete call"
                            title="Delete call"
                            className="flex-shrink-0 mt-1 size-8 rounded-md flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors"
                          >
                            {deletingId === c.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                          </button>
                        )}
                        <ChevronRight className="size-5 text-[var(--color-fg-subtle)] group-hover:text-[var(--color-accent)] group-hover:translate-x-0.5 transition flex-shrink-0 mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-[var(--color-fg-subtle)] text-xs uppercase tracking-wider mb-2">
          <Icon className="size-3.5" />
          {label}
        </div>
        <p className="text-[var(--color-fg)] text-2xl font-bold tracking-tight font-display">{value}</p>
      </CardContent>
    </Card>
  )
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full border transition capitalize ${
        active
          ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] border-[var(--color-accent)]'
          : 'bg-transparent text-[var(--color-fg-muted)] border-[var(--color-border-strong)] hover:text-[var(--color-fg)] hover:border-[var(--color-fg-muted)]'
      }`}
    >
      {children}
    </button>
  )
}
