import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  PhoneCall, IndianRupee, Clock, TrendingUp, RefreshCw, Loader2,
  Mic, Sparkles, Volume2, Server,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'

function INR(n) {
  if (n == null) return '—'
  return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

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
            Cross-org aggregate — calls, costs, usage.
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Total Calls"   value={agg.calls ?? 0}                                            icon={PhoneCall} />
            <Stat label="Demo Calls"    value={agg.demo_calls ?? 0}                                       icon={PhoneCall} />
            <Stat label="Total Minutes" value={`${(agg.total_minutes ?? 0).toLocaleString('en-IN')}`}     icon={Clock} />
            <Stat label="Margin"        value={`${INR(agg.margin_inr)} (${agg.margin_pct ?? 0}%)`}       icon={TrendingUp} highlight />
          </div>

          {/* Cost vs Selling — top-level totals */}
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Total Cost (we pay)"  value={INR(agg.total_cost_inr)} icon={IndianRupee} />
            <Stat label="Total Sell (client pays)" value={INR(agg.total_sell_inr)} icon={IndianRupee} highlight />
          </div>

          {/* Cost — per-module breakdown. Selling = plan rate × minutes (flat,
              not per-module), so render selling separately as a single card. */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ModuleBreakdown title="Cost (provider)" prefix="cost" agg={agg} />
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs uppercase tracking-wider text-[var(--color-fg-subtle)] mb-3">Selling (client)</p>
                <p className="text-xs text-[var(--color-fg-muted)] mb-3 leading-relaxed">
                  Plan rate × call minutes. Not split per module — selling is a flat per-minute
                  rate defined by each org's active subscription.
                </p>
                <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3">
                  <span className="font-medium">Total Billed</span>
                  <span className="font-display font-bold text-[var(--color-accent)] text-xl">
                    {INR(agg.total_sell_inr)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-[var(--color-fg-subtle)]">
                  <span>Across {agg.total_minutes ?? 0} min · {agg.calls ?? 0} calls</span>
                  <span>Margin {agg.margin_pct ?? 0}%</span>
                </div>
              </CardContent>
            </Card>
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
              <Button variant="outline" size="sm" asChild><a href="/superadmin/cost_rates">Cost Rates →</a></Button>
              <Button variant="outline" size="sm" asChild><a href="/admin/scenarios">Scenarios →</a></Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function ModuleBreakdown({ title, prefix, agg }) {
  const rows = [
    { label: 'Telephony', icon: PhoneCall, key: `telephony_${prefix}_inr` },
    { label: 'STT',       icon: Mic,       key: `stt_${prefix}_inr` },
    { label: 'LLM',       icon: Sparkles,  key: `llm_${prefix}_inr` },
    { label: 'TTS',       icon: Volume2,   key: `tts_${prefix}_inr` },
  ]
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-xs uppercase tracking-wider text-[var(--color-fg-subtle)] mb-3">{title}</p>
        <ul className="space-y-2">
          {rows.map(r => {
            const Icon = r.icon
            return (
              <li key={r.key} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-[var(--color-fg-muted)]">
                  <Icon className="size-3.5" /> {r.label}
                </span>
                <span className="font-display font-semibold">{INR(agg[r.key])}</span>
              </li>
            )
          })}
          <li className="flex items-center justify-between text-sm border-t border-[var(--color-border)] pt-2 mt-1">
            <span className="font-medium">Total</span>
            <span className="font-display font-bold text-[var(--color-accent)]">{INR(agg[`total_${prefix}_inr`])}</span>
          </li>
        </ul>
      </CardContent>
    </Card>
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
