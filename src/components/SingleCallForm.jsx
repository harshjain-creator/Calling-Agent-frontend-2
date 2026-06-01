import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Loader2, CheckCircle2, AlertCircle, PhoneCall, User, Mail, Phone,
  Sparkles, Lock, Plus,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { apiFetch } from '@/lib/api'
import { useScenarios } from '@/hooks/useScenarios'
import ScenarioCreateDialog from '@/components/ScenarioCreateDialog'

/**
 * SingleCallForm — authenticated single outbound call.
 * Uses POST /single_call (no rate limit, attributed to org).
 *
 * Differences from DemoCallForm:
 *   - Requires auth (apiFetch sends Bearer)
 *   - No demo-attempt counter / "remaining" hint
 *   - "+ New Scenario" inline button available
 *   - No "Write your own" textarea — scenarios come from DB only
 */
export default function SingleCallForm() {
  const { scenarios, loading: loadingScenarios, error: scenariosError, reload } = useScenarios()

  const [name,      setName]      = useState('')
  const [email,     setEmail]     = useState('')
  const [phone,     setPhone]     = useState('')
  const [gender,    setGender]    = useState('male')
  const [scenarioId, setScenarioId] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [pending,   setPending]   = useState(false)
  const [success,   setSuccess]   = useState(false)
  const [callSid,   setCallSid]   = useState('')
  const [error,     setError]     = useState(null)

  useEffect(() => {
    if (!scenarioId && scenarios.length) setScenarioId(scenarios[0].id)
  }, [scenarios, scenarioId])

  const selected = scenarios.find(s => s.id === scenarioId)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!scenarioId) {
      setError({ message: 'Pick a scenario first' })
      return
    }
    setPending(true); setError(null); setSuccess(false)
    try {
      const data = await apiFetch('/single_call', {
        method: 'POST',
        body: {
          name:         name.trim(),
          email:        email.trim(),
          phone_number: phone.trim(),
          scenario_id:  scenarioId,
          gender,
        },
      })
      setCallSid(data?.call_sid || '')
      setSuccess(true)
    } catch (err) {
      setError(err)
    } finally {
      setPending(false)
    }
  }

  const errMsg = error?.body?.detail || error?.body?.error || error?.message

  if (success) {
    return (
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="pt-8 pb-8 text-center">
          <CheckCircle2 className="size-12 mx-auto mb-4 text-emerald-500" />
          <h3 className="font-display text-2xl font-semibold">Call dialed!</h3>
          <p className="mt-2 text-base text-[var(--color-fg-muted)]">
            The agent is dialing {phone} now.
          </p>
          {callSid && (
            <p className="mt-2 text-xs text-[var(--color-fg-subtle)] font-mono">SID: {callSid}</p>
          )}
          <Button
            variant="outline" size="default" className="mt-6"
            onClick={() => { setSuccess(false); setError(null); setCallSid('') }}
          >
            Dial another
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardContent className="pt-7 pb-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sc-name">Customer name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--color-fg-subtle)]" />
                  <Input id="sc-name" placeholder="Rahul Sharma" value={name} onChange={e => setName(e.target.value)} required className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sc-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--color-fg-subtle)]" />
                  <Input id="sc-email" type="email" placeholder="customer@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="pl-10" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sc-phone">Phone number (with country code)</Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--color-fg-subtle)]" />
                <Input id="sc-phone" type="tel" placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} required className="pl-10" />
              </div>
            </div>

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
                  Male (Rahul)
                </button>
                <button type="button"
                  onClick={() => setGender('female')}
                  className={`flex-1 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                    gender === 'female'
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                      : 'border-[var(--color-border)] text-[var(--color-fg-muted)] hover:border-[var(--color-fg-subtle)]'
                  }`}>
                  Female (Riya)
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Pick a scenario</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => setCreateOpen(true)}>
                  <Plus className="size-3.5" /> New
                </Button>
              </div>

              {loadingScenarios ? (
                <div className="flex items-center gap-2 text-sm text-[var(--color-fg-muted)] py-2">
                  <Loader2 className="size-4 animate-spin" /> Loading scenarios…
                </div>
              ) : scenariosError ? (
                <p className="text-sm text-red-500">{String(scenariosError)}</p>
              ) : scenarios.length === 0 ? (
                <p className="text-sm text-[var(--color-fg-subtle)]">
                  No scenarios yet. Click <span className="text-[var(--color-accent)]">+ New</span> to add one.
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
                  </div>
                  {selected?.summary && (
                    <div className="flex items-start gap-2 mt-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-muted)] px-3 py-2.5">
                      <Sparkles className="size-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
                      <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">{selected.summary}</p>
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
              disabled={pending || !scenarioId || !phone.trim()}
            >
              {pending
                ? <><Loader2 className="size-4 animate-spin" /> Dialing…</>
                : <><PhoneCall className="size-4" /> Place Call</>
              }
            </Button>
          </form>
        </CardContent>
      </Card>

      <ScenarioCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={async (created) => {
          await reload()
          if (created?.id) setScenarioId(created.id)
        }}
      />
    </>
  )
}
