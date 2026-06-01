import { motion } from 'framer-motion'
import {
  Sparkles, Target, ListChecks, ArrowRight,
  Flag, Brain,
} from 'lucide-react'
import OutcomeBadge from './OutcomeBadge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

/**
 * AI Summary card. Visual treatment:
 *  - Soft gradient header strip with "AI" badge + Sparkles
 *  - Sectioned body (TL;DR, intent, key-points, next-step) with icons
 *  - Subtle motion on mount
 */
export default function SummaryCard({ summary, summaryJson }) {
  const js = summaryJson || {}
  const empty = !summary && !Object.keys(js).length

  if (empty) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-[var(--color-fg-muted)] flex items-center gap-2">
          <Brain className="size-4 text-[var(--color-fg-subtle)]" />
          AI summary not generated yet.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-[var(--color-border-strong)]">
      {/* Gradient strip — signature AI accent */}
      <div className="relative h-1 w-full bg-[length:200%_100%] bg-[linear-gradient(90deg,var(--gradient-1),var(--gradient-2),var(--gradient-3),var(--gradient-1))] animate-[shimmer_6s_linear_infinite]" />

      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            <Sparkles className="size-5" />
            <span className="absolute -bottom-1 -right-1 inline-flex items-center rounded-full bg-[var(--color-accent)] text-[8px] font-bold uppercase tracking-wider text-white px-1.5 py-0.5">
              AI
            </span>
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight">AI Summary</CardTitle>
            <p className="text-xs text-[var(--color-fg-subtle)] mt-0.5">
              Auto-generated from the call transcript.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* TL;DR */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-xl bg-[var(--color-bg-muted)] border border-[var(--color-border)] p-4"
          >
            <p className="text-[var(--color-fg)] text-sm leading-relaxed">{summary}</p>
          </motion.div>
        )}

        {/* Badges + Intent */}
        <div className="flex flex-wrap items-center gap-2">
          {js.outcome   && <OutcomeBadge value={js.outcome}   kind="outcome" />}
          {js.sentiment && <OutcomeBadge value={js.sentiment} kind="sentiment" />}
          {Array.isArray(js.flags) && js.flags.map(f => (
            <span key={f} className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-500 text-xs font-medium px-2.5 py-1">
              <Flag className="size-3" /> {f.replace(/_/g, ' ')}
            </span>
          ))}
        </div>

        {js.intent && (
          <Section icon={Target} label="Intent">
            <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">{js.intent}</p>
          </Section>
        )}

        {js.key_points && js.key_points.length > 0 && (
          <Section icon={ListChecks} label={`Key Points · ${js.key_points.length}`}>
            <ul className="space-y-2">
              {js.key_points.map((p, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  className="flex items-start gap-2.5 text-sm text-[var(--color-fg-muted)]"
                >
                  <span className="mt-1 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
                  <span className="leading-relaxed">{p}</span>
                </motion.li>
              ))}
            </ul>
          </Section>
        )}

        {js.next_step && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="relative overflow-hidden rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-accent-soft)] p-4"
          >
            <div className="absolute -top-6 -right-6 size-24 rounded-full bg-[var(--color-accent)] opacity-10 blur-2xl" />
            <div className="relative flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white">
                <ArrowRight className="size-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-fg-subtle)] mb-1">Next Step</p>
                <p className="text-[var(--color-fg)] text-sm font-medium leading-relaxed">{js.next_step}</p>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

function Section({ icon: Icon, label, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="size-3.5 text-[var(--color-accent)]" />
        <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-fg-subtle)] font-semibold">{label}</p>
      </div>
      {children}
    </div>
  )
}
