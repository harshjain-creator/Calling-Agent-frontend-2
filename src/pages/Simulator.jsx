import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PhoneCall, Phone, Clock, IndianRupee, RefreshCw, Upload, FileText, ChevronRight,
  Sparkles, CalendarDays, BadgeCheck, Infinity as InfIcon, Users, BarChart3,
  Search, X, User, Mail, Plus, Lock, Globe2, Trash2, Play, CheckCircle2,
  ArrowLeft, Calendar, Hash, LayoutDashboard, Loader2, FlaskConical, Download, Volume2, Pause,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import OutcomeBadge from '@/components/OutcomeBadge'
import TranscriptView from '@/components/TranscriptView'
import SummaryCard from '@/components/SummaryCard'

/* ───────────────────────────────────────────────────────────────────────────
   Simulator — a fully STATIC sandbox clone of the client portal.
   No API calls, no real dialing. Everything is hardcoded mock data so a
   prospect can click around and feel the product. Lives behind client login
   only (see App.jsx route guard + CLIENT_NAV_LINKS).
   ─────────────────────────────────────────────────────────────────────────── */

/* ── helpers ─────────────────────────────────────────────────────────────── */
function INR(n) {
  if (n == null) return '—'
  return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })
}
function fmtDur(s) {
  if (s == null) return '—'
  const m = Math.floor(s / 60), sec = Math.floor(s % 60).toString().padStart(2, '0')
  return `${m}m ${sec}s`
}
function relTime(iso) {
  if (!iso) return ''
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60)     return 'just now'
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(iso).toLocaleDateString()
}
function fmtDate(iso) {
  try { return new Date(iso).toLocaleString() } catch { return iso }
}
const ago = (mins) => new Date(Date.now() - mins * 60000).toISOString()

/* ── mock data ───────────────────────────────────────────────────────────── */
const SUB = {
  subscription: {
    plans: { name: 'Growth', rate_per_min_inr: 12 },
    ends_at: new Date(Date.now() + 22 * 86400000).toISOString(),
  },
  usage: { calls_per_day_cap: 30, calls_remaining: 18 },
}

const CALLS = [
  {
    id: 'demo-1', user: { name: 'Aarav Mehta', email: 'aarav@acmeco.com', phone: '+91 98200 11223' },
    scenario: 'Loan follow-up — remind about pending application and answer eligibility questions.',
    duration_s: 214, started_at: ago(12), language_initial: 'en', total_sell_inr: 42.8, recording: true,
    summary: 'Customer confirmed interest in the personal loan and asked about interest rates. Agreed to a callback tomorrow morning to complete the application.',
    summary_json: {
      outcome: 'interested', sentiment: 'positive',
      intent: 'Wants to proceed with a personal loan but needs rate clarity first.',
      key_points: ['Asked about interest rate and tenure', 'Eligible based on stated income', 'Prefers morning callback'],
      next_step: 'Call back tomorrow 10 AM to complete application.',
      flags: [],
    },
    turns: [
      { idx: 0, role: 'bot',  text: 'Hi, am I speaking with Aarav?', language: 'en', latency_ms: 540 },
      { idx: 1, role: 'user', text: 'Yes, speaking.', language: 'en' },
      { idx: 2, role: 'bot',  text: 'Great! Calling about your pending loan application. Do you have a minute?', language: 'en', latency_ms: 610 },
      { idx: 3, role: 'user', text: 'Haan boliye, kitna interest rate hai?', language: 'hi' },
      { idx: 4, role: 'bot',  text: 'Aapke profile par rate 11.5% se shuru hota hai. Main aapko kal subah details bhej deta hoon.', language: 'hi', latency_ms: 580 },
      { idx: 5, role: 'user', text: 'Perfect, kal subah call karna.', language: 'hi' },
    ],
  },
  {
    id: 'demo-2', user: { name: 'Sara Williams', email: 'sara.w@globex.io', phone: '+1 415 555 0142' },
    scenario: 'Appointment reminder — confirm upcoming demo and offer rescheduling.',
    duration_s: 96, started_at: ago(48), language_initial: 'en', total_sell_inr: 19.2, recording: true,
    summary: 'Confirmed the scheduled product demo for Thursday 3 PM. No reschedule needed.',
    summary_json: {
      outcome: 'meeting_scheduled', sentiment: 'positive',
      intent: 'Confirm attendance for the demo.',
      key_points: ['Demo confirmed for Thursday 3 PM', 'Will join from laptop'],
      next_step: 'Send calendar invite + join link.',
      flags: [],
    },
    turns: [
      { idx: 0, role: 'bot',  text: 'Hello, is this Sara?', language: 'en', latency_ms: 500 },
      { idx: 1, role: 'user', text: 'Yes, who is this?', language: 'en' },
      { idx: 2, role: 'bot',  text: 'Calling to confirm your product demo on Thursday at 3 PM. Does that still work?', language: 'en', latency_ms: 560 },
      { idx: 3, role: 'user', text: 'Yes that works, thanks.', language: 'en' },
    ],
  },
  {
    id: 'demo-3', user: { name: 'Rohan Gupta', email: 'rohan@startuphub.in', phone: '+91 99876 54321' },
    scenario: 'Product upsell — introduce premium plan benefits to existing customer.',
    duration_s: 158, started_at: ago(140), language_initial: 'hi', total_sell_inr: 31.6, recording: true,
    summary: 'Customer was busy and asked to be contacted next week. Mild interest in premium features.',
    summary_json: {
      outcome: 'callback_requested', sentiment: 'neutral',
      intent: 'Open to premium but not right now.',
      key_points: ['Currently busy', 'Curious about analytics add-on'],
      next_step: 'Follow up next Monday.',
      flags: ['busy'],
    },
    turns: [
      { idx: 0, role: 'bot',  text: 'Namaste, kya main Rohan ji se baat kar raha hoon?', language: 'hi', latency_ms: 520 },
      { idx: 1, role: 'user', text: 'Haan, par main thoda busy hoon abhi.', language: 'hi' },
      { idx: 2, role: 'bot',  text: 'Bilkul, main agle hafte call kar lunga. Ek choti si baat — premium plan me analytics bhi milta hai.', language: 'hi', latency_ms: 600 },
      { idx: 3, role: 'user', text: 'Theek hai, Monday ko baat karte hain.', language: 'hi' },
    ],
  },
  {
    id: 'demo-4', user: { name: 'Liú Wěi', email: 'liu.wei@tradecorp.cn', phone: '+86 138 0013 8000' },
    scenario: 'Feedback survey — collect post-service feedback and a CSAT score.',
    duration_s: 73, started_at: ago(300), language_initial: 'en', total_sell_inr: 14.6, recording: false,
    summary: 'Shared positive feedback, rated service 9/10. No further action needed.',
    summary_json: {
      outcome: 'information_shared', sentiment: 'positive',
      intent: 'Provide feedback.',
      key_points: ['Rated 9/10', 'Happy with support response time'],
      next_step: 'Log CSAT score.',
      flags: [],
    },
    turns: [
      { idx: 0, role: 'bot',  text: 'Hi, do you have a moment for a quick one-question survey?', language: 'en', latency_ms: 480 },
      { idx: 1, role: 'user', text: 'Sure.', language: 'en' },
      { idx: 2, role: 'bot',  text: 'On a scale of 1 to 10, how was your recent experience?', language: 'en', latency_ms: 520 },
      { idx: 3, role: 'user', text: 'I would say a nine.', language: 'en' },
    ],
  },
  {
    id: 'demo-5', user: { name: 'Priya Nair', email: 'priya.nair@homeloans.in', phone: '+91 90000 22334' },
    scenario: 'Loan follow-up — pending application.',
    duration_s: 41, started_at: ago(600), language_initial: 'en', total_sell_inr: 8.2, recording: false,
    summary: 'Customer not interested at this time, asked not to be contacted again.',
    summary_json: {
      outcome: 'not_interested', sentiment: 'negative',
      intent: 'Decline offer.',
      key_points: ['Already has a loan elsewhere'],
      next_step: 'Add to do-not-call list.',
      flags: ['do_not_call'],
    },
    turns: [
      { idx: 0, role: 'bot',  text: 'Hi, am I speaking with Priya?', language: 'en', latency_ms: 500 },
      { idx: 1, role: 'user', text: 'Yes, but I am not interested. Please remove my number.', language: 'en' },
      { idx: 2, role: 'bot',  text: 'Understood, I will remove you from our list. Sorry to bother you.', language: 'en', latency_ms: 540 },
    ],
  },
]

const SCENARIOS_SEED = [
  { id: 's1', title: 'Loan Follow-up',      summary: 'Remind customers about pending loan applications and answer basic eligibility questions.', is_private: true,  is_active: true,  created_at: ago(40000), org_id: 'org-demo01' },
  { id: 's2', title: 'Appointment Reminder', summary: 'Confirm upcoming appointments and offer rescheduling options.',                            is_private: false, is_active: true,  created_at: ago(60000), org_id: null },
  { id: 's3', title: 'Product Upsell',       summary: 'Introduce premium plan benefits to existing customers.',                                  is_private: true,  is_active: true,  created_at: ago(8000),  org_id: 'org-demo01' },
  { id: 's4', title: 'Feedback Survey',      summary: 'Collect post-service feedback and a CSAT score after support tickets.',                  is_private: false, is_active: false, created_at: ago(90000), org_id: null },
]

const OUTCOME_FILTERS = [
  'interested', 'callback_requested', 'meeting_scheduled',
  'information_shared', 'not_interested', 'unclear', 'call_dropped',
]

const TABS = [
  { key: 'dashboard', label: 'Dashboard',     Icon: LayoutDashboard },
  { key: 'calls',     label: 'Calls History', Icon: Phone },
  { key: 'call',      label: 'Place Call',    Icon: PhoneCall },
  { key: 'scenarios', label: 'Scenarios',     Icon: FileText },
]

/* ── page shell ──────────────────────────────────────────────────────────── */
export default function Simulator() {
  const [tab, setTab] = useState('dashboard')
  const [selectedCall, setSelectedCall] = useState(null)

  const goCalls = (id = null) => { setSelectedCall(id); setTab('calls') }

  return (
    <div className="w-full px-4 sm:px-6 py-10 max-w-6xl mx-auto">
     

      {/* ── Simulator window ─────────────────────────────────────────────── */}
      <div className="relative flex flex-col h-[78vh] min-h-[560px] rounded-2xl border border-[var(--color-border)] glass-strong shadow-2xl overflow-hidden">
        {/* Title bar */}
        <div className="shrink-0 flex items-center px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-muted)]">
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-red-400/80" />
            <span className="size-3 rounded-full bg-amber-400/80" />
            <span className="size-3 rounded-full bg-emerald-400/80" />
          </div>
          <span className="flex-1 text-center text-xs font-medium text-[var(--color-fg-muted)]">
            FI DIGITAL — Client Portal (Demo)
          </span>
          <div className="w-12" />
        </div>

        {/* Demo banner */}
        <div className="shrink-0 flex items-center gap-3 px-4 sm:px-6 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-accent-soft)]">
          <FlaskConical className="size-4 text-[var(--color-accent)] shrink-0" />
          <p className="text-xs sm:text-sm text-[var(--color-fg)]">
            <span className="font-semibold">Demo Simulator</span> — sample data only. Nothing here places a real call or saves anything.
          </p>
        </div>

        {/* Internal tab nav */}
        <div className="shrink-0 flex flex-wrap gap-1 px-4 sm:px-6 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setSelectedCall(null) }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium relative -mb-px border-b-2 transition-colors ${
                tab === key
                  ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                  : 'border-transparent text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]'
              }`}
            >
              <Icon className="size-4" /> {label}
            </button>
          ))}
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab + (selectedCall || '')}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {tab === 'dashboard' && <DashboardView onOpenCall={goCalls} onTab={setTab} />}
              {tab === 'calls' && (
                selectedCall
                  ? <CallDetailView call={CALLS.find(c => c.id === selectedCall)} onBack={() => setSelectedCall(null)} />
                  : <CallsView onOpenCall={(id) => setSelectedCall(id)} />
              )}
              {tab === 'call' && <CallFormView />}
              {tab === 'scenarios' && <ScenariosView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

/* ── shared bits ─────────────────────────────────────────────────────────── */
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

/* ── Dashboard ───────────────────────────────────────────────────────────── */
function DashboardView({ onOpenCall, onTab }) {
  const totalCalls = CALLS.length
  const totalDur   = CALLS.reduce((a, c) => a + Number(c.duration_s || 0), 0)
  const interested = CALLS.filter(c => c.summary_json?.outcome === 'interested').length

  const s = SUB.subscription, plan = s.plans, u = SUB.usage
  const ends = new Date(s.ends_at)
  const daysLeft = Math.max(0, Math.ceil((ends - Date.now()) / 86400000))

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Welcome, Demo User</h1>
          <p className="text-sm text-[var(--color-fg-muted)] mt-1">Recent activity for your org.</p>
        </div>
        <Button variant="ghost" size="sm"><RefreshCw className="size-4" /> Refresh</Button>
      </div>

      {/* Subscription */}
      <Card className="border-[var(--color-accent)] shadow-md shadow-[var(--color-accent-soft)]">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              <BadgeCheck className="size-5" />
            </div>
            <div className="flex-1 min-w-[220px]">
              <p className="text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">Current Plan</p>
              <p className="font-display text-2xl font-semibold mt-0.5">{plan.name}</p>
              <p className="text-sm text-[var(--color-fg-muted)] mt-1">
                ₹{plan.rate_per_min_inr.toFixed(2)} / min · {u.calls_per_day_cap} calls / day
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">Calls Left Today</p>
              <p className="font-display text-3xl font-bold text-[var(--color-accent)] mt-0.5">
                {u.calls_remaining}<span className="text-base text-[var(--color-fg-muted)] font-normal"> / {u.calls_per_day_cap}</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">Days Left</p>
              <p className="font-display text-3xl font-bold mt-0.5 flex items-center justify-center gap-1.5">
                <CalendarDays className="size-5 text-[var(--color-accent)]" />{daysLeft}
              </p>
              <p className="text-[10px] text-[var(--color-fg-subtle)]">until {ends.toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Stat label="Total Calls" value={totalCalls}        icon={PhoneCall} />
        <Stat label="Total Time"  value={fmtDur(totalDur)}  icon={Clock} />
        <Stat label="Interested"  value={interested}        icon={PhoneCall} />
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <ActionCard icon={Upload}    title="Start a Bulk Call" desc="Upload CSV, pick a scenario, dial in parallel." onClick={() => onTab('call')} />
        <ActionCard icon={FileText}  title="Add Scenario"      desc="Create private scenarios scoped to your org." onClick={() => onTab('scenarios')} />
        <ActionCard icon={PhoneCall} title="Call History"      desc="Recordings, transcripts and AI summaries." onClick={() => onTab('calls')} />
      </div>

      {/* Recent calls */}
      <div>
        <h2 className="font-display text-xl font-semibold mb-3">Recent Calls</h2>
        {CALLS.slice(0, 5).map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.03 }} className="mb-3">
            <button onClick={() => onOpenCall(c.id)} className="block w-full text-left group">
              <Card className="hover:border-[var(--color-accent)] transition-all">
                <CardContent className="pt-4 pb-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center">
                    <PhoneCall className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{c.user.name} · <span className="text-[var(--color-fg-muted)] font-normal">{c.user.phone}</span></p>
                    <p className="text-xs text-[var(--color-fg-subtle)] line-clamp-1">{c.scenario}</p>
                  </div>
                  <span className="text-xs text-[var(--color-fg-muted)]">{fmtDur(c.duration_s)}</span>
                  <ChevronRight className="size-4 text-[var(--color-fg-subtle)] group-hover:text-[var(--color-accent)] transition-colors" />
                </CardContent>
              </Card>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function ActionCard({ icon: Icon, title, desc, onClick }) {
  return (
    <button onClick={onClick} className="block text-left group">
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
    </button>
  )
}

/* ── Calls list ──────────────────────────────────────────────────────────── */
function CallsView({ onOpenCall }) {
  const [q, setQ] = useState('')
  const [outcomeFilter, setOutcomeFilter] = useState(null)

  const stats = useMemo(() => {
    const total = CALLS.length
    const uniq = new Set(CALLS.map(c => c.user.email)).size
    const durs = CALLS.map(c => c.duration_s)
    const avg = durs.length ? durs.reduce((a, b) => a + b, 0) / durs.length : 0
    const interested = CALLS.filter(c => c.summary_json?.outcome === 'interested').length
    return { total, uniq, avg, interested }
  }, [])

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    return CALLS.filter(c => {
      if (outcomeFilter && c.summary_json?.outcome !== outcomeFilter) return false
      if (!t) return true
      return (
        c.user.name.toLowerCase().includes(t) ||
        c.user.email.toLowerCase().includes(t) ||
        c.user.phone.toLowerCase().includes(t) ||
        c.scenario.toLowerCase().includes(t) ||
        (c.summary || '').toLowerCase().includes(t)
      )
    })
  }, [q, outcomeFilter])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Calls</h1>
          <p className="text-sm text-[var(--color-fg-muted)] mt-1">Recordings, transcripts and AI summaries across every call.</p>
        </div>
        <Button variant="ghost" size="sm"><RefreshCw className="size-4" /> Refresh</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={Phone}     label="Total Calls"      value={stats.total} />
        <Stat icon={Users}     label="Unique Customers" value={stats.uniq} />
        <Stat icon={Clock}     label="Avg Duration"     value={fmtDur(stats.avg)} />
        <Stat icon={BarChart3} label="Interested"       value={stats.interested} />
      </div>

      <Card>
        <CardContent className="p-3 flex items-center gap-3">
          <Search className="size-4 text-[var(--color-fg-subtle)] ml-1" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, email, phone, scenario, summary…"
            className="flex-1 border-0 bg-transparent h-9 focus-visible:ring-0 px-0" />
          {q && <button onClick={() => setQ('')} className="text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)]"><X className="size-4" /></button>}
          <span className="text-xs text-[var(--color-fg-subtle)] whitespace-nowrap pr-1">{filtered.length} / {CALLS.length}</span>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <FilterChip active={outcomeFilter === null} onClick={() => setOutcomeFilter(null)}>All</FilterChip>
        {OUTCOME_FILTERS.map(o => (
          <FilterChip key={o} active={outcomeFilter === o} onClick={() => setOutcomeFilter(outcomeFilter === o ? null : o)}>
            {o.replace(/_/g, ' ')}
          </FilterChip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <Phone className="size-10 text-[var(--color-fg-subtle)] mx-auto mb-3" />
          <p className="text-[var(--color-fg)] text-base mb-1">No calls match your filters</p>
          <p className="text-[var(--color-fg-subtle)] text-sm">Try clearing search or outcome filter.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((c, i) => {
            const js = c.summary_json
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.4) }}>
                <button onClick={() => onOpenCall(c.id)} className="group block w-full text-left">
                  <Card className="hover:border-[var(--color-accent)] hover:shadow-md hover:translate-x-0.5 transition-all">
                    <CardContent className="pt-5 pb-5">
                      <div className="flex items-start gap-4">
                        <div className="h-11 w-11 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
                          <Phone className="size-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-baseline gap-2 mb-1">
                            <span className="text-[var(--color-fg)] font-semibold">{c.user.name}</span>
                            <span className="text-[var(--color-fg-subtle)] text-xs">·</span>
                            <span className="text-[var(--color-fg-muted)] text-sm truncate">{c.user.email}</span>
                            <span className="text-[var(--color-fg-subtle)] text-xs">·</span>
                            <span className="text-[var(--color-fg-muted)] text-sm">{c.user.phone}</span>
                          </div>
                          <p className="text-[var(--color-fg-muted)] text-sm line-clamp-1">{c.scenario}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[var(--color-fg-subtle)]">
                            <span className="flex items-center gap-1.5"><Clock className="size-3" /> {relTime(c.started_at)}</span>
                            <span>·</span><span>{fmtDur(c.duration_s)}</span>
                            <span>·</span><span className="uppercase">{c.language_initial}</span>
                            {c.recording && <><span>·</span><span className="text-emerald-500">recording</span></>}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          {js.outcome   && <OutcomeBadge value={js.outcome}   kind="outcome" />}
                          {js.sentiment && <OutcomeBadge value={js.sentiment} kind="sentiment" />}
                        </div>
                        <ChevronRight className="size-5 text-[var(--color-fg-subtle)] group-hover:text-[var(--color-accent)] group-hover:translate-x-0.5 transition flex-shrink-0 mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                </button>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function FilterChip({ active, onClick, children }) {
  return (
    <button onClick={onClick} className={`text-xs px-3 py-1.5 rounded-full border transition capitalize ${
      active
        ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] border-[var(--color-accent)]'
        : 'bg-transparent text-[var(--color-fg-muted)] border-[var(--color-border-strong)] hover:text-[var(--color-fg)] hover:border-[var(--color-fg-muted)]'
    }`}>
      {children}
    </button>
  )
}

/* ── Call detail ─────────────────────────────────────────────────────────── */
function CallDetailView({ call, onBack }) {
  if (!call) return null
  const js = call.summary_json
  const turns = call.turns
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <Button variant="ghost" size="icon" className="mt-0.5" onClick={onBack}><ArrowLeft className="size-4" /></Button>
          <div className="min-w-0">
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight flex items-center gap-2">
              <Calendar className="size-5 text-[var(--color-accent)]" />{fmtDate(call.started_at)}
            </h1>
            <p className="text-xs text-[var(--color-fg-subtle)] mt-1 flex items-center gap-1 truncate">
              <Hash className="size-3" />{call.id}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {js.outcome   && <OutcomeBadge value={js.outcome}   kind="outcome" />}
          {js.sentiment && <OutcomeBadge value={js.sentiment} kind="sentiment" />}
        </div>
      </div>

      {/* Customer */}
      <Card><CardContent className="pt-6">
        <h3 className="text-xs uppercase tracking-wider text-[var(--color-fg-subtle)] mb-3">Customer</h3>
        <div className="flex flex-wrap gap-x-8 gap-y-4">
          <InfoItem icon={User} label="Name"  value={call.user.name} />
          <InfoItem icon={Mail} label="Email" value={call.user.email} />
          <InfoItem icon={Phone} label="Phone" value={call.user.phone} />
        </div>
      </CardContent></Card>

      {/* Scenario */}
      <Card><CardContent className="pt-6">
        <h3 className="text-xs uppercase tracking-wider text-[var(--color-fg-subtle)] mb-2">Scenario</h3>
        <p className="text-[var(--color-fg-muted)] text-sm leading-relaxed">{call.scenario}</p>
      </CardContent></Card>

      {/* Recording (static) */}
      <FakeAudioPlayer hasRecording={call.recording} duration={call.duration_s} />

      <div className="grid md:grid-cols-2 gap-6">
        <SummaryCard summary={call.summary} summaryJson={js} />
        <TranscriptView turns={turns} />
      </div>
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

function FakeAudioPlayer({ hasRecording, duration }) {
  const [playing, setPlaying] = useState(false)
  if (!hasRecording) {
    return <Card><CardContent className="pt-6 text-[var(--color-fg-muted)] text-sm">No recording available for this call.</CardContent></Card>
  }
  const mm = Math.floor(duration / 60), ss = Math.floor(duration % 60).toString().padStart(2, '0')
  return (
    <Card><CardContent className="pt-6">
      <div className="flex items-center gap-4">
        <button onClick={() => setPlaying(p => !p)}
          className="h-12 w-12 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-[var(--color-accent-soft)]">
          {playing ? <Pause className="size-5" /> : <Play className="size-5 ml-0.5" />}
        </button>
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <span className="text-[var(--color-fg-muted)] text-sm tabular-nums w-12">0:00</span>
          <div className="flex-1 h-1.5 rounded-full bg-[var(--color-bg-muted)] overflow-hidden">
            <div className="h-full bg-[var(--color-accent)]" style={{ width: playing ? '35%' : '0%', transition: 'width 0.4s' }} />
          </div>
          <span className="text-[var(--color-fg-muted)] text-sm tabular-nums w-12 text-right">{mm}:{ss}</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 w-24"><Volume2 className="size-4 text-[var(--color-fg-subtle)]" />
          <div className="flex-1 h-1.5 rounded-full bg-[var(--color-bg-muted)]"><div className="h-full w-4/5 bg-[var(--color-accent)] rounded-full" /></div>
        </div>
        <Button variant="outline" size="icon" title="Download (demo)"><Download className="size-4" /></Button>
      </div>
      <p className="text-xs text-[var(--color-fg-subtle)] mt-3">Stereo recording — caller on left channel, agent on right.</p>
    </CardContent></Card>
  )
}

/* ── Place Call (Single + Bulk) ──────────────────────────────────────────── */
function CallFormView() {
  const [view, setView] = useState('single')
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Call</h1>
        <p className="text-sm text-[var(--color-fg-muted)] mt-1">Dial one customer at a time, or run a bulk CSV campaign.</p>
      </div>
      <div className="inline-flex rounded-full glass p-1 border border-[var(--color-border)]">
        <PillBtn active={view === 'single'} onClick={() => setView('single')}><PhoneCall className="size-4" /> Single Call</PillBtn>
        <PillBtn active={view === 'bulk'} onClick={() => setView('bulk')}><Upload className="size-4" /> Bulk Call</PillBtn>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
          {view === 'single' ? <SingleCallMock /> : <BulkCallMock />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function PillBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all ${
      active ? 'bg-[var(--color-accent)] text-white shadow-md' : 'text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]'
    }`}>{children}</button>
  )
}

function GenderToggle({ gender, setGender }) {
  return (
    <div className="space-y-2">
      <Label>Agent voice</Label>
      <div className="flex gap-2">
        {[['male', 'Male (Rahul)'], ['female', 'Female (Riya)']].map(([g, lbl]) => (
          <button key={g} type="button" onClick={() => setGender(g)}
            className={`flex-1 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
              gender === g ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                : 'border-[var(--color-border)] text-[var(--color-fg-muted)] hover:border-[var(--color-fg-subtle)]'
            }`}>{lbl}</button>
        ))}
      </div>
    </div>
  )
}

function SingleCallMock() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState('male')
  const [scenarioId, setScenarioId] = useState(SCENARIOS_SEED[0].id)
  const [success, setSuccess] = useState(false)
  const selected = SCENARIOS_SEED.find(s => s.id === scenarioId)

  if (success) {
    return (
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="pt-8 pb-8 text-center">
          <CheckCircle2 className="size-12 mx-auto mb-4 text-emerald-500" />
          <h3 className="font-display text-2xl font-semibold">Call dialed!</h3>
          <p className="mt-2 text-base text-[var(--color-fg-muted)]">The agent is dialing {phone || 'the customer'} now.</p>
          <p className="mt-2 text-xs text-[var(--color-fg-subtle)]">(Demo — no real call placed.)</p>
          <Button variant="outline" size="default" className="mt-6" onClick={() => setSuccess(false)}>Dial another</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card><CardContent className="pt-7 pb-7">
      <form onSubmit={e => { e.preventDefault(); setSuccess(true) }} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sm-name">Customer name</Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--color-fg-subtle)]" />
              <Input id="sm-name" placeholder="Rahul Sharma" value={name} onChange={e => setName(e.target.value)} className="pl-10" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sm-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--color-fg-subtle)]" />
              <Input id="sm-email" type="email" placeholder="customer@example.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sm-phone">Phone number (with country code)</Label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--color-fg-subtle)]" />
            <Input id="sm-phone" type="tel" placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} className="pl-10" />
          </div>
        </div>

        <GenderToggle gender={gender} setGender={setGender} />

        <div className="space-y-2">
          <Label>Pick a scenario</Label>
          <div className="flex flex-wrap gap-2">
            {SCENARIOS_SEED.map(s => (
              <button key={s.id} type="button" onClick={() => setScenarioId(s.id)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  s.id === scenarioId ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                    : 'border-[var(--color-border-strong)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]'
                }`}>
                {s.is_private && <Lock className="inline size-3 mr-1 align-[-2px]" />}{s.title}
              </button>
            ))}
          </div>
          {selected?.summary && (
            <div className="flex items-start gap-2 mt-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-muted)] px-3 py-2.5">
              <Sparkles className="size-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">{selected.summary}</p>
            </div>
          )}
        </div>

        <Button type="submit" variant="gradient" size="lg" className="w-full">
          <PhoneCall className="size-4" /> Place Call
        </Button>
      </form>
    </CardContent></Card>
  )
}

const SAMPLE_ROWS = [
  { name: 'Harsh Jain',  email: 'harsh@example.com', phone: '+91 98765 43210', scenario: 'Loan follow-up' },
  { name: 'Priya Singh', email: 'priya@example.com', phone: '+91 91234 56780', scenario: '' },
  { name: 'John Carter', email: 'john@globex.io',    phone: '+1 415 555 0199', scenario: 'Appointment reminder' },
  { name: 'Mei Tanaka',  email: 'mei@tokyocorp.jp',  phone: '+81 90 1234 5678', scenario: '' },
]

function BulkCallMock() {
  const [loaded, setLoaded] = useState(false)
  const [delayMs, setDelayMs] = useState(4000)
  const [maxConcur, setMaxConcur] = useState(3)
  const [gender, setGender] = useState('male')
  const [scenarioId, setScenarioId] = useState(SCENARIOS_SEED[0].id)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)

  const dial = () => {
    setRunning(true); setDone(false)
    setTimeout(() => { setRunning(false); setDone(true) }, 1800)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><FileText className="size-5 text-[var(--color-accent)]" /> CSV File</CardTitle>
          <Button variant="ghost" size="sm"><Download className="size-3.5" /> Sample CSV</Button>
        </CardHeader>
        <CardContent>
          <button onClick={() => setLoaded(true)}
            className="w-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition border-[var(--color-border-strong)] bg-[var(--color-bg-muted)] hover:border-[var(--color-accent)]">
            <Upload className="size-8 mb-2 text-[var(--color-fg-subtle)]" />
            <p className="text-[var(--color-fg)] text-sm font-medium">Click to load sample CSV</p>
            <p className="text-xs text-[var(--color-fg-subtle)] mt-1">Columns: name, email, phone, scenario (optional)</p>
          </button>
          {loaded && (
            <div className="mt-4 flex items-center gap-3 text-sm">
              <span className="text-emerald-500">{SAMPLE_ROWS.length} ready</span>
              <Button variant="ghost" size="sm" onClick={() => { setLoaded(false); setDone(false) }} className="ml-auto"><Trash2 className="size-3.5" /> Clear</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {loaded && (
        <Card><CardContent className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-bg-muted)]">
              <tr className="text-left text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
                <th className="px-4 py-2">#</th><th className="px-4 py-2">Name</th><th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Phone</th><th className="px-4 py-2">Scenario</th><th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_ROWS.map((r, i) => (
                <tr key={i} className="border-t border-[var(--color-border)]">
                  <td className="px-4 py-2 text-[var(--color-fg-subtle)]">{i + 1}</td>
                  <td className="px-4 py-2 text-[var(--color-fg)]">{r.name}</td>
                  <td className="px-4 py-2 text-[var(--color-fg-muted)]">{r.email}</td>
                  <td className="px-4 py-2 text-[var(--color-fg-muted)]">{r.phone}</td>
                  <td className="px-4 py-2 text-[var(--color-fg-muted)] max-w-xs truncate">{r.scenario || <em className="text-[var(--color-fg-subtle)]">default</em>}</td>
                  <td className="px-4 py-2"><span className="text-emerald-500 text-xs">ready</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent></Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg">Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Default Scenario</label>
            <Select value={scenarioId} onChange={e => setScenarioId(e.target.value)}>
              {SCENARIOS_SEED.map(s => <option key={s.id} value={s.id}>{s.is_private ? '🔒 ' : ''}{s.title}</option>)}
            </Select>
            <p className="text-xs text-[var(--color-fg-subtle)] mt-1.5">Used when a CSV row leaves the <code className="text-[var(--color-fg-muted)]">scenario</code> column blank.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Delay between dials: {(delayMs / 1000).toFixed(1)}s</label>
              <input type="range" min={1000} max={15000} step={500} value={delayMs} onChange={e => setDelayMs(Number(e.target.value))} className="w-full accent-[var(--color-accent)]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max concurrent calls: {maxConcur}</label>
              <input type="range" min={1} max={10} step={1} value={maxConcur} onChange={e => setMaxConcur(Number(e.target.value))} className="w-full accent-[var(--color-accent)]" />
            </div>
          </div>
          <GenderToggle gender={gender} setGender={setGender} />
        </CardContent>
      </Card>

      {!done && (
        <Button onClick={dial} disabled={!loaded || running} variant="gradient" size="lg" className="w-full">
          {running ? <><Loader2 className="size-5 animate-spin" /> Starting…</> : <><Play className="size-5" /> Dial {loaded ? SAMPLE_ROWS.length : 0} Calls</>}
        </Button>
      )}

      {done && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg flex items-center gap-2"><Phone className="size-5 text-[var(--color-accent)]" /> Bulk Run Progress</CardTitle>
            <span className="text-emerald-500 text-sm flex items-center gap-1"><CheckCircle2 className="size-4" /> Done</span>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-[var(--color-fg-subtle)] mb-1">
                <span>{SAMPLE_ROWS.length} / {SAMPLE_ROWS.length}</span><span>{SAMPLE_ROWS.length} dialed · 0 failed</span>
              </div>
              <div className="w-full h-2 bg-[var(--color-bg-muted)] rounded-full overflow-hidden"><div className="h-full bg-[var(--color-accent)]" style={{ width: '100%' }} /></div>
            </div>
            <div className="space-y-1.5">
              {SAMPLE_ROWS.map((r, i) => (
                <div key={i} className="flex items-center gap-3 text-xs bg-[var(--color-bg-muted)] rounded-md px-3 py-2">
                  <span className="text-[var(--color-fg-subtle)] w-6">{i + 1}</span>
                  <span className="text-[var(--color-fg)] flex-1 truncate">{r.name} · {r.phone}</span>
                  <span className="text-emerald-500">✓ dialed</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/* ── Scenarios ───────────────────────────────────────────────────────────── */
function ScenariosView() {
  const [scenarios, setScenarios] = useState(SCENARIOS_SEED)
  const [modalOpen, setModalOpen] = useState(false)

  const addScenario = (title, summary) => {
    setScenarios(list => [
      { id: 'new-' + list.length, title, summary, is_private: true, is_active: true, created_at: new Date().toISOString(), org_id: 'org-demo01' },
      ...list,
    ])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Scenarios</h1>
          <p className="text-sm text-[var(--color-fg-muted)] mt-1">Your private scenarios + public templates. Add your own to use during bulk calls.</p>
        </div>
        <Button variant="gradient" size="sm" onClick={() => setModalOpen(true)}><Plus className="size-4" /> New Scenario</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Stat label="Total"   value={scenarios.length} />
        <Stat label="Public"  value={scenarios.filter(s => !s.is_private).length} icon={Globe2} />
        <Stat label="Private" value={scenarios.filter(s => s.is_private).length}  icon={Lock} />
      </div>

      <div className="space-y-3">
        {scenarios.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.4) }}>
            <Card className="hover:border-[var(--color-accent)] transition-all">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-4">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    s.is_private ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]' : 'bg-emerald-500/15 text-emerald-500'
                  }`}>
                    {s.is_private ? <Lock className="size-5" /> : <Globe2 className="size-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-2 mb-1">
                      <span className="text-[var(--color-fg)] font-semibold">{s.title}</span>
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        s.is_private ? 'text-[var(--color-accent)] border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                          : 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10'
                      }`}>{s.is_private ? 'Private' : 'Public'}</span>
                      {!s.is_active && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-[var(--color-border)] text-[var(--color-fg-subtle)]">Inactive</span>}
                    </div>
                    {s.summary && <p className="text-[var(--color-fg-muted)] text-sm leading-relaxed line-clamp-2">{s.summary}</p>}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[var(--color-fg-subtle)]">
                      {s.org_id && <span>Org: {String(s.org_id).slice(0, 8)}…</span>}<span>·</span>
                      <span>Created {new Date(s.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10"
                    onClick={() => setScenarios(list => list.filter(x => x.id !== s.id))}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {modalOpen && <NewScenarioDialog onClose={() => setModalOpen(false)} onAdd={(t, su) => { addScenario(t, su); setModalOpen(false) }} />}
    </div>
  )
}

function NewScenarioDialog({ onClose, onAdd }) {
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <Card className="w-full max-w-md" onClick={e => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">New Scenario</CardTitle>
          <button onClick={onClose} className="text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)]"><X className="size-4" /></button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ns-title">Title</Label>
            <Input id="ns-title" placeholder="e.g. Renewal Reminder" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ns-summary">What should the agent do?</Label>
            <textarea id="ns-summary" rows={4} value={summary} onChange={e => setSummary(e.target.value)}
              placeholder="Describe the goal of the call, products, tone, do/don't rules…"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-muted)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]" />
          </div>
          <Button variant="gradient" className="w-full" disabled={!title.trim()} onClick={() => onAdd(title.trim(), summary.trim())}>
            <Plus className="size-4" /> Create Scenario
          </Button>
          <p className="text-xs text-center text-[var(--color-fg-subtle)]">(Demo — added to this list only, not saved.)</p>
        </CardContent>
      </Card>
    </div>
  )
}
