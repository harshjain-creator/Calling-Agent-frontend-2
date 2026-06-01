import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Loader2, CheckCircle2, AlertCircle, PhoneCall, User, Mail, Phone,
  Sparkles, Lock, Pencil,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/lib/api'
import { useScenarios } from '@/hooks/useScenarios'

const CUSTOM = '__custom__'

/**
 * DemoCallForm — body-only form (no outer page chrome). Reused by:
 *   - DemoCallModal (dialog popup on landing)
 *   - /demo route page (DemoForm wraps this in a centered section)
 *
 * Scenarios come from /scenarios (server-scoped: anonymous → public only).
 * User picks a chip; we send scenario_id to /demo_call so the backend
 * resolves the full text (and re-validates access on its end).
 *
 * Props:
 *   onSuccess(data) — optional callback after successful POST /demo_call
 */
export default function DemoCallForm({ onSuccess } = {}) {
  const { scenarios, loading: loadingScenarios, error: scenariosError } = useScenarios({ skipAuth: true })

  const [name,      setName]      = useState('')
  const [email,     setEmail]     = useState('')
  const [phone,     setPhone]     = useState('')
  const [gender,    setGender]    = useState('male')
  const [scenarioId, setScenarioId] = useState('')   // either a real id OR CUSTOM sentinel
  const [customText, setCustomText] = useState('')
  const [remaining, setRemaining] = useState(null)
  const [pending,   setPending]   = useState(false)
  const [success,   setSuccess]   = useState(false)
  const [error,     setError]     = useState(null)

  // Auto-pick first scenario once fetched
  useEffect(() => {
    if (!scenarioId && scenarios.length) setScenarioId(scenarios[0].id)
  }, [scenarios, scenarioId])

  const selected   = scenarios.find(s => s.id === scenarioId)
  const isCustom   = scenarioId === CUSTOM

  async function handleSubmit(e) {
    e.preventDefault()
    if (!scenarioId) {
      setError({ message: 'Pick a scenario first' })
      return
    }
    if (isCustom && !customText.trim()) {
      setError({ message: 'Write your scenario or pick a preset' })
      return
    }
    setPending(true); setError(null); setSuccess(false)
    try {
      const body = {
        name:         name.trim(),
        email:        email.trim(),
        phone_number: phone.trim(),
        gender,
      }
      if (isCustom) body.scenario    = customText.trim()
      else          body.scenario_id = scenarioId
      const data = await apiFetch('/demo_call', {
        method: 'POST', skipAuth: true,
        body,
      })
      if (typeof data.demo_remaining === 'number') setRemaining(data.demo_remaining)
      setSuccess(true)
      onSuccess?.(data)
    } catch (err) {
      setError(err)
    } finally {
      setPending(false)
    }
  }

  const errMsg = error?.body?.detail || error?.body?.error || error?.message

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="text-center py-10"
      >
        <CheckCircle2 className="size-12 mx-auto mb-4 text-emerald-500" />
        <h3 className="font-display text-2xl font-semibold">Call dialed!</h3>
        <p className="mt-2 text-base text-[var(--color-fg-muted)]">
          Your phone should ring in seconds. Pick up and talk to Rahul.
        </p>
        {typeof remaining === 'number' && (
          <p className="mt-2 text-xs text-[var(--color-fg-subtle)]">
            {remaining} demo {remaining === 1 ? 'call' : 'calls'} remaining for this email in the next 24h.
          </p>
        )}
        <Button variant="outline" size="default" className="mt-6" onClick={() => { setSuccess(false); setError(null) }}>
          Place another
        </Button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dm-name">Your name</Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--color-fg-subtle)]" />
            <Input id="dm-name" placeholder="Rahul Sharma" value={name} onChange={e => setName(e.target.value)} required className="pl-10" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dm-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--color-fg-subtle)]" />
            <Input id="dm-email" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required className="pl-10" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dm-phone">Phone number (with country code)</Label>
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--color-fg-subtle)]" />
          <Input id="dm-phone" type="tel" placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} required className="pl-10" />
        </div>
      </div>

      {/* Agent gender */}
      <div className="space-y-2">
        <Label>Agent voice</Label>
        <div className="flex gap-2">
          <button type="button"
            onClick={() => setGender('male')}
            className={`flex-1 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
              gender === 'male'
                ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                : 'border-[var(--color-border)] text-[var(--color-fg-muted)] hover:border-[var(--color-fg-subtle)]'
            }`}>
            Male
          </button>
          <button type="button"
            onClick={() => setGender('female')}
            className={`flex-1 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
              gender === 'female'
                ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                : 'border-[var(--color-border)] text-[var(--color-fg-muted)] hover:border-[var(--color-fg-subtle)]'
            }`}>
            Female
          </button>
        </div>
      </div>

      {/* Scenario picker */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Pick a scenario</Label>
          {selected?.is_private && (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[var(--color-accent)]">
              <Lock className="size-3" /> Private
            </span>
          )}
        </div>

        {loadingScenarios ? (
          <div className="flex items-center gap-2 text-sm text-[var(--color-fg-muted)] py-2">
            <Loader2 className="size-4 animate-spin" /> Loading scenarios…
          </div>
        ) : scenariosError ? (
          <p className="text-sm text-red-500">{String(scenariosError)}</p>
        ) : scenarios.length === 0 ? (
          <p className="text-sm text-[var(--color-fg-subtle)]">
            No scenarios available. Ask your admin to add one.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {scenarios.map(s => {
                const active = s.id === scenarioId
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setScenarioId(s.id)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                        : 'border-[var(--color-border-strong)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]'
                    }`}
                  >
                    {s.is_private && <Lock className="inline size-3 mr-1 align-[-2px]" />}
                    {s.title}
                  </button>
                )
              })}
              {/* Custom-text option */}
              <button
                type="button"
                onClick={() => setScenarioId(CUSTOM)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  isCustom
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                    : 'border-dashed border-[var(--color-border-strong)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]'
                }`}
              >
                <Pencil className="inline size-3 mr-1 align-[-2px]" />
                Write your own
              </button>
            </div>
            {selected?.summary && !isCustom && (
              <div className="flex items-start gap-2 mt-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-muted)] px-3 py-2.5">
                <Sparkles className="size-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
                <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">{selected.summary}</p>
              </div>
            )}
            {isCustom && (
              <div className="mt-2 space-y-1.5">
                <Textarea
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  rows={4}
                  placeholder="Describe what the agent should do on the call — company, products, target outcome, any do/don't rules…"
                  className="min-h-[110px]"
                  required
                />
                <p className="text-xs text-[var(--color-fg-subtle)]">
                  One-off scenario — used for this call only. Not stored.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {errMsg && (
        <motion.div
          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2.5 text-sm text-red-500"
        >
          <AlertCircle className="size-4 mt-0.5 shrink-0" />
          <span>{String(errMsg)}</span>
        </motion.div>
      )}

      <Button
        type="submit" variant="gradient" size="lg" className="w-full"
        disabled={pending || !scenarioId || (isCustom && !customText.trim())}
      >
        {pending
          ? <><Loader2 className="size-4 animate-spin" /> Dialing…</>
          : <><PhoneCall className="size-4" /> Place Call</>
        }
      </Button>
    </form>
  )
}
