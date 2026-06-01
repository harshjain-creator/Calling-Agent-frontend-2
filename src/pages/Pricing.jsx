import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PhoneCall, Mic, Sparkles, Volume2, Server, IndianRupee,
  TrendingUp, Star, ChevronRight, Calculator, Layers,
} from 'lucide-react'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

/* ──────────────────────────────────────────────────────────────────────────
   Data — pulled from AI_Calling_Cost_Breakdown_v2.docx (May 2025)
   ────────────────────────────────────────────────────────────────────────── */

const PER_MIN_COST = [
  { Icon: PhoneCall, label: 'Telephony',              value: '₹0.60' },
  { Icon: Mic,       label: 'Speech-to-Text',         value: '₹0.50' },
  { Icon: Sparkles,  label: 'Language Understanding', value: '₹0.50' },
  { Icon: Volume2,   label: 'Text-to-Speech',         value: '₹2.40' },
]
const PER_MIN_TOTAL = '₹4.00'

const FIXED_MONTHLY = [
  { service: 'Cloud Hosting + Database', details: 'Compute + data store + API gateway', cost: '₹0 – ₹418 / month' },
  { service: 'Phone Number Rental',      details: 'Pass-through to customer',           cost: '₹300 / month' },
]

const PLAN_SUMMARY = [
  { plan: 'Starter', calls: 10, dur: 5, minDay: 50,  dailyCost: 200,  monthlyVar: 6000,  total: 6000 },
  { plan: 'Growth',  calls: 30, dur: 5, minDay: 150, dailyCost: 600,  monthlyVar: 18000, total: 18418 },
  { plan: 'Scale',   calls: 50, dur: 5, minDay: 250, dailyCost: 1000, monthlyVar: 30000, total: 30418 },
]

const COMPONENT_BREAKDOWN = [
  { component: 'Telephony',              starter: 900,   growth: 2700,  scale: 4500 },
  { component: 'Speech-to-Text',         starter: 750,   growth: 2250,  scale: 3750 },
  { component: 'Language Understanding', starter: 750,   growth: 2250,  scale: 3750 },
  { component: 'Text-to-Speech ★',       starter: 3600,  growth: 10800, scale: 18000 },
  { component: 'Cloud Hosting',          starter: '0',   growth: 418,   scale: 418   },
  { component: 'Total',                  starter: 6000,  growth: 18418, scale: 30418, total: true },
]

const SELLING_PLANS = [
  {
    plan: 'Pay As You Go', calls: '—', dur: 5, rate: null,
    revenue: null, infra: null, profit: null, margin: null,
    badge: 'No Commitment',
    payg: true,
    perks: [
      'No daily/monthly cap',
      'Per-minute billing',
      'Multilingual voice conversations',
      'Bulk dial + CSV upload',
      'Cost dashboard',
      'Top up anytime',
    ],
  },
  {
    plan: 'Starter', calls: 10, dur: 5, rate: 15,
    revenue: 22500, infra: 6000,  profit: 16500, margin: 73,
    badge: 'Low Volume',
    perks: [
      'Up to 10 calls/day',
      '5-min average call duration',
      'Multilingual voice conversations',
      'Bulk dial + CSV upload',
      'Cost dashboard',
    ],
  },
  {
    plan: 'Growth',  calls: 30, dur: 5, rate: 12,
    revenue: 54000, infra: 18418, profit: 35582, margin: 66,
    badge: 'Most Popular',
    popular: true,
    perks: [
      'Up to 30 calls/day',
      '5-min average call duration',
      'Multilingual voice conversations',
      'Bulk dial + CSV upload',
      'Cost dashboard',
    ],
  },
  {
    plan: 'Scale',   calls: 50, dur: 5, rate: 10,
    revenue: 75000, infra: 30418, profit: 44582, margin: 59,
    badge: 'Volume Rate',
    perks: [
      'Up to 50 calls/day',
      '5-min average call duration',
      'Multilingual voice conversations',
      'Bulk dial + CSV upload',
      'Cost dashboard',
      'Multi-tenant org access',
      'Dedicated account manager',
      'Custom voice + scenario',
    ],
  },
]

const SCALING = {
  callsDay: 100, blendedRate: 12,
  totalMin: { day: 500, month: 15000 },
  infraCost: { day: 2000, month: 60418 },
  revenue:   { day: 6000, month: 180000 },
  profit:    { day: 3976, month: 119582 },
  margin: 66,
}

const OPTIMISATIONS = [
  'Voice synthesis tiering — standard voices for routine flows, premium for high-value calls',
  'Silence & pause detection — pause billing during hold or user silence',
  'Model tiering — lightweight models for simple intent, advanced for complex multi-turn',
  'Response caching — reusable audio for greetings, confirmations, hold messages',
  'Cache layer — serve repeat data reads from cache',
  'Shorter call durations via better routing + intent detection',
  'Volume pricing — committed-spend rate at 50+ calls/day',
]

/* ──────────────────────────────────────────────────────────────────────── */

function INR(n) {
  if (typeof n === 'string') return n
  return '₹' + Number(n).toLocaleString('en-IN')
}

export default function Pricing() {
  const [view, setView] = useState('selling')   // 'cost' | 'selling'

  return (
    <div className="w-full px-6 sm:px-10 lg:px-14 py-12 lg:py-16">
      {/* Heading */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
          {view === 'selling' ? 'Plans & Pricing' : 'Infrastructure Cost'}
        </h1>
        <p className="mt-3 text-base lg:text-lg text-[var(--color-fg-muted)] leading-relaxed">
          {view === 'selling'
            ? 'Pay-per-minute calling. Higher volume → lower rate. No commitment with Pay As You Go.'
            : 'Per-component cost breakdown across telephony, speech-to-text, language understanding, voice synthesis and hosting.'}
        </p>
      </div>

      {/* Toggle */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex rounded-full glass p-1 border border-[var(--color-border)]">
          <ToggleBtn active={view === 'cost'} onClick={() => setView('cost')}>
            <Calculator className="size-4" /> Cost Price
          </ToggleBtn>
          <ToggleBtn active={view === 'selling'} onClick={() => setView('selling')}>
            <IndianRupee className="size-4" /> Selling Price
          </ToggleBtn>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'selling' ? (
          <motion.div
            key="selling"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <SellingView />
          </motion.div>
        ) : (
          <motion.div
            key="cost"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <CostView />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ToggleBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all ${
        active
          ? 'bg-[var(--color-accent)] text-white shadow-md'
          : 'text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]'
      }`}
    >
      {children}
    </button>
  )
}

/* ── SELLING VIEW ────────────────────────────────────────────────────────── */

function SellingView() {
  return (
    <div className="space-y-12 max-w-[1800px] mx-auto">
      {/* Plan cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {SELLING_PLANS.map(p => (
          <Card
            key={p.plan}
            className={`relative overflow-hidden transition-all ${
              p.popular ? 'border-[var(--color-accent)] shadow-xl shadow-[var(--color-accent-soft)] lg:scale-[1.03]' : ''
            }`}
          >
            {p.popular && (
              <div className="absolute top-0 right-0 bg-[var(--color-accent)] text-white text-[10px] uppercase tracking-wider font-semibold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                <Star className="size-3 fill-current" /> {p.badge}
              </div>
            )}
            <CardHeader>
              <CardDescription className="uppercase tracking-wider text-xs">
                {p.plan}{!p.popular && ` · ${p.badge}`}
              </CardDescription>
              <div className="mt-2 flex items-baseline gap-1">
                {p.rate != null ? (
                  <>
                    <span className="font-display text-4xl font-bold tracking-tight">₹{p.rate}</span>
                    <span className="text-[var(--color-fg-muted)] text-sm">/ min</span>
                  </>
                ) : (
                  <span className="font-display text-3xl font-bold tracking-tight text-[var(--color-fg-muted)]">
                    Coming Soon
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--color-fg-subtle)] mt-1">
                {p.payg
                  ? 'No daily cap · ' + p.dur + '-min avg'
                  : `Up to ${p.calls} calls / day · ${p.dur}-min avg`}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                {p.perks.map(perk => (
                  <li key={perk} className="flex items-start gap-2 text-[var(--color-fg-muted)]">
                    <ChevronRight className="size-4 text-[var(--color-accent)] mt-0.5 flex-shrink-0" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
              <Button variant={p.popular ? 'gradient' : 'outline'} size="default" className="w-full">
                {p.payg ? 'Start Calling' : 'Contact Sales'}
              </Button>
              {!p.payg && (
                <div className="border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-fg-subtle)] grid grid-cols-2 gap-2">
                  <div>
                    <p>Revenue / mo</p>
                    <p className="text-[var(--color-fg)] font-semibold">{INR(p.revenue)}</p>
                  </div>
                  <div>
                    <p>Margin</p>
                    <p className="text-emerald-500 font-semibold">{p.margin}%</p>
                  </div>
                </div>
              )}
              {p.payg && (
                <div className="border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-fg-subtle)]">
                  Variable cost per call. Billed at end of each call. No monthly minimums.
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Plan Comparison</CardTitle>
          <CardDescription>Calls/day × 5-min × ₹/min × 30 days</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-bg-muted)] text-[var(--color-fg-subtle)] text-xs uppercase tracking-wider">
              <tr>
                <Th>Plan</Th><Th>Calls/Day</Th><Th>Rate</Th>
                <Th>Revenue / mo</Th><Th>Infra Cost / mo</Th>
                <Th>Profit / mo</Th><Th>Margin</Th>
              </tr>
            </thead>
            <tbody>
              {SELLING_PLANS.map(p => (
                <tr key={p.plan} className="border-t border-[var(--color-border)]">
                  <Td><span className="font-semibold">{p.plan}</span></Td>
                  <Td>{p.calls}</Td>
                  <Td>{p.rate != null ? `₹${p.rate} / min` : 'TBD'}</Td>
                  <Td>{p.revenue != null ? INR(p.revenue) : '—'}</Td>
                  <Td>{p.infra != null ? INR(p.infra) : '—'}</Td>
                  <Td className="text-emerald-500 font-semibold">{p.profit != null ? INR(p.profit) : '—'}</Td>
                  <Td className="text-emerald-500 font-semibold">{p.margin != null ? `${p.margin}%` : '—'}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Scaling projection */}
      <Card className="border-[var(--color-accent)] shadow-lg shadow-[var(--color-accent-soft)]">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <TrendingUp className="size-5 text-[var(--color-accent)]" />
            Scaling Projection — 100 Calls / Day
          </CardTitle>
          <CardDescription>
            Blended rate ₹{SCALING.blendedRate}/min · ~{SCALING.margin}% margin
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-bg-muted)] text-[var(--color-fg-subtle)] text-xs uppercase tracking-wider">
              <tr>
                <Th>Metric</Th><Th>Daily</Th><Th>Monthly</Th>
              </tr>
            </thead>
            <tbody>
              <Row label="Total Minutes"           daily={`${SCALING.totalMin.day} min`}  monthly={`${SCALING.totalMin.month.toLocaleString('en-IN')} min`} />
              <Row label="Infra Cost (@₹4/min)"    daily={INR(SCALING.infraCost.day)}     monthly={INR(SCALING.infraCost.month)} />
              <Row label="Revenue (@₹12/min)"      daily={INR(SCALING.revenue.day)}       monthly={INR(SCALING.revenue.month)} />
              <Row label="Net Profit"              daily={<span className="text-emerald-500 font-semibold">{INR(SCALING.profit.day)}</span>}  monthly={<span className="text-emerald-500 font-semibold">{INR(SCALING.profit.month)}</span>} />
            </tbody>
          </table>
        </CardContent>
      </Card>

      <p className="text-xs text-center text-[var(--color-fg-subtle)] max-w-2xl mx-auto leading-relaxed">
        All plans 5-min avg call · 30 billing days · phone number rental ₹300/mo passed through ·
        Custom enterprise plans available on request.
      </p>
    </div>
  )
}

/* ── COST VIEW ──────────────────────────────────────────────────────────── */

function CostView() {
  return (
    <div className="space-y-12 max-w-[1800px] mx-auto">
      {/* Per-min total hero */}
      <Card className="border-[var(--color-accent)] shadow-lg shadow-[var(--color-accent-soft)]">
        <CardContent className="pt-7 pb-6 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-fg-subtle)]">Total Variable Cost</p>
          <p className="font-display text-6xl font-bold mt-2 text-gradient-shimmer">{PER_MIN_TOTAL}</p>
          <p className="text-sm text-[var(--color-fg-muted)] mt-1">per minute of AI voice call</p>
        </CardContent>
      </Card>

      {/* Per-component cards */}
      <div>
        <h2 className="font-display text-2xl font-semibold mb-4">Per-Minute Variable Cost</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PER_MIN_COST.map(({ Icon, label, value }) => (
            <Card key={label}>
              <CardContent className="pt-5">
                <div className="h-10 w-10 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center mb-3">
                  <Icon className="size-5" />
                </div>
                <p className="text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">{label}</p>
                <p className="font-display text-2xl font-bold mt-1">{value}<span className="text-sm text-[var(--color-fg-muted)] ml-1">/ min</span></p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Fixed monthly */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Server className="size-5 text-[var(--color-accent)]" /> Fixed Monthly Costs
          </CardTitle>
          <CardDescription>Incurred regardless of call volume.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-bg-muted)] text-[var(--color-fg-subtle)] text-xs uppercase tracking-wider">
              <tr><Th>Service</Th><Th>Details</Th><Th>Monthly Cost</Th></tr>
            </thead>
            <tbody>
              {FIXED_MONTHLY.map(f => (
                <tr key={f.service} className="border-t border-[var(--color-border)]">
                  <Td><span className="font-medium">{f.service}</span></Td>
                  <Td className="text-[var(--color-fg-muted)]">{f.details}</Td>
                  <Td>{f.cost}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Plan-wise summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Layers className="size-5 text-[var(--color-accent)]" /> Plan-Wise Cost Summary
          </CardTitle>
          <CardDescription>5-min avg call duration, fixed costs included.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-bg-muted)] text-[var(--color-fg-subtle)] text-xs uppercase tracking-wider">
              <tr>
                <Th>Plan</Th><Th>Calls/Day</Th><Th>Min/Day</Th>
                <Th>Daily Cost</Th><Th>Monthly Variable</Th><Th>Total Monthly</Th>
              </tr>
            </thead>
            <tbody>
              {PLAN_SUMMARY.map(p => (
                <tr key={p.plan} className="border-t border-[var(--color-border)]">
                  <Td><span className="font-semibold">{p.plan}</span></Td>
                  <Td>{p.calls}</Td>
                  <Td>{p.minDay}</Td>
                  <Td>{INR(p.dailyCost)}</Td>
                  <Td>{INR(p.monthlyVar)}</Td>
                  <Td className="font-semibold">{INR(p.total)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Component breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Component-Wise Monthly Cost</CardTitle>
          <CardDescription>★ = highest variable cost component (voice synthesis).</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-bg-muted)] text-[var(--color-fg-subtle)] text-xs uppercase tracking-wider">
              <tr>
                <Th>Component</Th>
                <Th>Starter (10/day)</Th>
                <Th>Growth (30/day)</Th>
                <Th>Scale (50/day)</Th>
              </tr>
            </thead>
            <tbody>
              {COMPONENT_BREAKDOWN.map(c => (
                <tr key={c.component} className={`border-t border-[var(--color-border)] ${c.total ? 'bg-[var(--color-bg-muted)] font-semibold' : ''}`}>
                  <Td>{c.component}</Td>
                  <Td>{INR(c.starter)}</Td>
                  <Td>{INR(c.growth)}</Td>
                  <Td>{INR(c.scale)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

     

      <p className="text-xs text-center text-[var(--color-fg-subtle)] max-w-3xl mx-auto leading-relaxed">
        Assumptions: 5-min avg duration · constant AI usage · telephony ₹0.60/min · voice synthesis ₹30/10K chars ·
        speech-to-text ₹30/hr · language model ~1,500 in + 400 out tokens/min · USD ₹83.5 · 30 billing days/month.
        Real production cost varies with usage, call mix, silence and negotiated rates.
      </p>
    </div>
  )
}

/* ── small table cells ─────────────────────────────────────────────────── */
const Th = ({ children }) => <th className="px-4 py-3 text-left font-medium">{children}</th>
const Td = ({ children, className = '' }) => <td className={`px-4 py-3 ${className}`}>{children}</td>
const Row = ({ label, daily, monthly }) => (
  <tr className="border-t border-[var(--color-border)]">
    <Td><span className="font-medium">{label}</span></Td>
    <Td>{daily}</Td>
    <Td>{monthly}</Td>
  </tr>
)
