import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Mail, Phone, User as UserIcon, Calendar, Hash, Trash2 } from 'lucide-react'

import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SkeletonCard } from '@/components/ui/skeleton'
import { useAuth } from '@/contexts/AuthContext'
import { confirm as swalConfirm, toast, alertError } from '@/lib/swal'
import { IndianRupee } from 'lucide-react'
import AudioPlayer    from '@/components/AudioPlayer'
import TranscriptView from '@/components/TranscriptView'
import SummaryCard    from '@/components/SummaryCard'
import MetricsBar     from '@/components/MetricsBar'
import OutcomeBadge   from '@/components/OutcomeBadge'

function fmtDate(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleString() } catch { return iso }
}

function INR(n) {
  if (n == null) return '—'
  return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 4 })
}

export default function AdminCallDetail() {
  const { role } = useAuth()
  const isSuper  = role === 'super_admin'
  const { id } = useParams()
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)
  const [data, setData]   = useState(null)
  const [err,  setErr]    = useState(null)
  const [loading, setLoad] = useState(true)

  useEffect(() => {
    let active = true
    setLoad(true); setErr(null)
    apiFetch(`/admin/calls/${id}`)
      .then(d => { if (active) setData(d) })
      .catch(e => { if (active) setErr(e.status === 404 ? 'Call not found' : (e.body?.detail || e.message || 'Failed')) })
      .finally(() => { if (active) setLoad(false) })
    return () => { active = false }
  }, [id])

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 py-8 space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (err || !data) {
    return (
      <div className="w-full px-4 sm:px-6 py-8 space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/calls"><ArrowLeft className="size-4" /> Back to calls</Link>
        </Button>
        <Card className="border-red-500/40 bg-red-500/10">
          <CardContent className="pt-6 text-red-500 text-sm">{err || 'No data'}</CardContent>
        </Card>
      </div>
    )
  }

  const { call, turns } = data
  const u  = call.users || {}
  const js = call.summary_json || {}

  return (
    <div className="w-full px-4 sm:px-6 py-8 space-y-6">
      {/* Top bar */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <Button variant="ghost" size="icon" asChild className="mt-0.5">
            <Link to="/admin/calls"><ArrowLeft className="size-4" /></Link>
          </Button>
          <div className="min-w-0">
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight flex items-center gap-2">
              <Calendar className="size-5 text-[var(--color-accent)]" />
              {fmtDate(call.started_at)}
            </h1>
            <p className="text-xs text-[var(--color-fg-subtle)] mt-1 flex items-center gap-1 truncate">
              <Hash className="size-3" />
              {call.call_sid || call.id}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {js.outcome   && <OutcomeBadge value={js.outcome}   kind="outcome" />}
          {js.sentiment && <OutcomeBadge value={js.sentiment} kind="sentiment" />}
          {isSuper && (
            <Button
              variant="outline" size="sm"
              disabled={deleting}
              onClick={async () => {
                const ok = await swalConfirm({
                  title: 'Delete call?',
                  text:  'Recording + transcript will be permanently removed.',
                  confirmText: 'Delete', danger: true,
                })
                if (!ok) return
                setDeleting(true)
                try {
                  await apiFetch(`/admin/calls/${call.id}`, { method: 'DELETE' })
                  toast({ icon: 'success', text: 'Call deleted' })
                  navigate('/admin/calls')
                } catch (e) {
                  await alertError(e?.body?.detail || e?.message || 'Failed to delete')
                } finally {
                  setDeleting(false)
                }
              }}
              className="text-red-500 border-red-500/40 hover:bg-red-500/10"
            >
              {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              Delete Call
            </Button>
          )}
        </div>
      </div>

      {/* Customer card */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-xs uppercase tracking-wider text-[var(--color-fg-subtle)] mb-3">Customer</h3>
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <InfoItem icon={UserIcon} label="Name"  value={u.name  || '—'} />
            <InfoItem icon={Mail}     label="Email" value={u.email || '—'} />
            <InfoItem icon={Phone}    label="Phone" value={u.phone || '—'} />
          </div>
        </CardContent>
      </Card>

      {/* Scenario */}
      {call.scenario && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-xs uppercase tracking-wider text-[var(--color-fg-subtle)] mb-2">Scenario</h3>
            <p className="text-[var(--color-fg-muted)] text-sm leading-relaxed">{call.scenario}</p>
          </CardContent>
        </Card>
      )}

      <AudioPlayer
        src={call.recording_url}
        filename={`call-${(call.call_sid || call.id || 'recording').slice(0, 32)}.wav`}
        onDelete={isSuper ? async () => {
          const ok = await swalConfirm({
            title: 'Delete recording?',
            text:  'Audio file will be removed from storage. Transcript stays.',
            confirmText: 'Delete', danger: true,
          })
          if (!ok) return
          try {
            await apiFetch(`/admin/calls/${call.id}/recording`, { method: 'DELETE' })
            setData(prev => prev && { ...prev, call: { ...prev.call, recording_url: null } })
            toast({ icon: 'success', text: 'Recording deleted' })
          } catch (e) {
            await alertError(e?.body?.detail || e?.message || 'Failed to delete recording')
          }
        } : undefined}
      />
      {/* Cost / Spent breakdown — role-aware */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-xs uppercase tracking-wider text-[var(--color-fg-subtle)] mb-3 flex items-center gap-2">
            <IndianRupee className="size-3.5" /> {isSuper ? 'Cost & Selling Breakdown' : 'Amount Spent'}
          </h3>
          {isSuper ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <CostBreakdown title="Cost (provider)" prefix="cost" call={call} />
              <SellingBreakdown call={call} />
            </div>
          ) : (
            <ClientSpentBreakdown call={call} />
          )}
        </CardContent>
      </Card>

      <MetricsBar call={call} />

      <div className="grid md:grid-cols-2 gap-6">
        <SummaryCard summary={call.summary} summaryJson={call.summary_json} />
        <TranscriptView turns={turns} />
      </div>
    </div>
  )
}

function CostBreakdown({ title, prefix, call }) {
  const rows = [
    { label: 'Telephony', key: `telephony_${prefix}_inr` },
    { label: 'STT',       key: `stt_${prefix}_inr` },
    { label: 'LLM',       key: `llm_${prefix}_inr` },
    { label: 'TTS',       key: `tts_${prefix}_inr` },
  ]
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-[var(--color-fg-subtle)] mb-2">{title}</p>
      <ul className="space-y-1.5 text-sm">
        {rows.map(r => (
          <li key={r.key} className="flex justify-between">
            <span className="text-[var(--color-fg-muted)]">{r.label}</span>
            <span className="font-mono">{INR(call[r.key])}</span>
          </li>
        ))}
        <li className="flex justify-between border-t border-[var(--color-border)] pt-1.5 mt-1">
          <span className="font-medium">Total</span>
          <span className="font-display font-bold text-[var(--color-accent)]">{INR(call[`total_${prefix}_inr`])}</span>
        </li>
      </ul>
    </div>
  )
}

function SellingBreakdown({ call }) {
  // Plan-based selling: rate × minutes. Per-module sell columns intentionally 0.
  const durS    = Number(call.duration_s || 0)
  const minutes = durS / 60
  const total   = Number(call.total_sell_inr || 0)
  const ratePerMin = minutes > 0 ? total / minutes : null
  const mm = Math.floor(durS / 60)
  const ss = Math.floor(durS % 60).toString().padStart(2, '0')
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-[var(--color-fg-subtle)] mb-2">Selling (client)</p>
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-3 mb-3">
        <p className="text-xs text-[var(--color-fg-subtle)]">Plan rate × duration</p>
        <p className="font-mono text-sm mt-1 text-[var(--color-fg)]">
          {ratePerMin != null ? `${INR(ratePerMin)} / min` : '—'} × {mm}m {ss}s
        </p>
      </div>
      <ul className="space-y-1.5 text-sm">
        <li className="flex justify-between text-[var(--color-fg-subtle)] text-xs">
          <span>Per-module breakdown</span>
          <span className="italic">flat plan rate</span>
        </li>
        <li className="flex justify-between border-t border-[var(--color-border)] pt-1.5 mt-1">
          <span className="font-medium">Total Billed</span>
          <span className="font-display font-bold text-[var(--color-accent)]">{INR(total)}</span>
        </li>
      </ul>
    </div>
  )
}

function ClientSpentBreakdown({ call }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <p className="text-sm text-[var(--color-fg-muted)]">
        Billed for this call (based on usage × your plan rates):
      </p>
      <p className="font-display text-2xl font-bold text-gradient-shimmer">
        {INR(call.total_sell_inr)}
      </p>
    </div>
  )
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-[var(--color-fg-subtle)]">{label}</p>
        <p className="text-[var(--color-fg)] text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}
