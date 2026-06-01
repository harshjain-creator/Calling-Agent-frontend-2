import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, RefreshCw, Loader2, AlertCircle, Save, Infinity as InfIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { SkeletonList } from '@/components/ui/skeleton'
import { apiFetch } from '@/lib/api'
import { toast, alertError } from '@/lib/swal'

/**
 * /superadmin/plans — manage subscription plans.
 *
 * Each plan: code, name, rate_per_min_inr (selling rate × minutes per call),
 * calls_per_day (null = unlimited / PAYG), is_active.
 */
export default function SuperAdminPlans() {
  const [plans,    setPlans]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [err,      setErr]      = useState(null)
  const [savingId, setSavingId] = useState(null)
  const [drafts,   setDrafts]   = useState({})
  const [createOpen, setCreateOpen] = useState(false)

  async function load() {
    setLoading(true); setErr(null)
    try {
      const r = await apiFetch('/superadmin/plans')
      setPlans(r?.plans || [])
      const d = {}
      for (const p of (r?.plans || [])) {
        d[p.id] = {
          name: p.name,
          rate_per_min_inr: p.rate_per_min_inr,
          calls_per_day: p.calls_per_day ?? '',
          is_active: p.is_active,
        }
      }
      setDrafts(d)
    } catch (e) {
      setErr(e?.body?.detail || e?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  function set(id, key, value) {
    setDrafts(d => ({ ...d, [id]: { ...d[id], [key]: value } }))
  }

  async function save(p) {
    const d = drafts[p.id]
    if (!d) return
    setSavingId(p.id)
    try {
      const cap = d.calls_per_day === '' || d.calls_per_day == null
        ? null
        : Number(d.calls_per_day)
      await apiFetch(`/superadmin/plans/${p.id}`, {
        method: 'PATCH',
        body: {
          name: d.name,
          rate_per_min_inr: Number(d.rate_per_min_inr),
          calls_per_day: cap,
          is_active: !!d.is_active,
        },
      })
      await load()
      toast({ icon: 'success', text: 'Plan saved' })
    } catch (e) {
      await alertError(e?.body?.detail || 'Failed to save')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="w-full px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Plans</h1>
          <p className="text-sm text-[var(--color-fg-muted)] mt-1">
            Selling rate × call minutes = customer bill. <code>calls_per_day</code> empty = unlimited (PAYG).
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={load}>
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button variant="gradient" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> New Plan
          </Button>
        </div>
      </div>

      {err && (
        <Card className="border-red-500/40 bg-red-500/10">
          <CardContent className="pt-5 text-red-500 text-sm">{String(err)}</CardContent>
        </Card>
      )}

      {loading && !plans.length && <SkeletonList count={4} />}

      {!loading && plans.length > 0 && (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-bg-muted)] text-[var(--color-fg-subtle)] text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Rate (₹/min)</th>
                  <th className="px-4 py-3 text-left">Calls/Day</th>
                  <th className="px-4 py-3 text-left">Active</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p, i) => {
                  const d = drafts[p.id] || {}
                  const dirty =
                    d.name !== p.name ||
                    Number(d.rate_per_min_inr) !== Number(p.rate_per_min_inr) ||
                    String(d.calls_per_day ?? '') !== String(p.calls_per_day ?? '') ||
                    !!d.is_active !== !!p.is_active
                  return (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: i * 0.02 }}
                      className="border-t border-[var(--color-border)]"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-[var(--color-fg-subtle)]">{p.code}</td>
                      <td className="px-4 py-3">
                        <Input value={d.name ?? ''} onChange={e => set(p.id, 'name', e.target.value)} className="h-9" />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number" step="0.01" min={0}
                          value={d.rate_per_min_inr ?? ''}
                          onChange={e => set(p.id, 'rate_per_min_inr', e.target.value)}
                          className="h-9 w-28"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number" min={0}
                            value={d.calls_per_day ?? ''}
                            onChange={e => set(p.id, 'calls_per_day', e.target.value)}
                            placeholder="∞"
                            className="h-9 w-24"
                          />
                          {(d.calls_per_day === '' || d.calls_per_day == null) && (
                            <InfIcon className="size-4 text-[var(--color-fg-subtle)]" title="Unlimited" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox" checked={!!d.is_active}
                          onChange={e => set(p.id, 'is_active', e.target.checked)}
                          className="size-4 accent-[var(--color-accent)]"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant={dirty ? 'gradient' : 'ghost'} size="sm"
                          disabled={!dirty || savingId === p.id}
                          onClick={() => save(p)}
                        >
                          {savingId === p.id ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                          <span className="hidden sm:inline">Save</span>
                        </Button>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <CreatePlanDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={load} />
    </div>
  )
}

function CreatePlanDialog({ open, onOpenChange, onCreated }) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [rate, setRate] = useState('')
  const [capPerDay, setCapPerDay] = useState('')
  const [pending, setPending] = useState(false)
  const [err, setErr] = useState(null)

  function reset() {
    setCode(''); setName(''); setRate(''); setCapPerDay('')
    setErr(null); setPending(false)
  }

  async function submit(e) {
    e.preventDefault()
    setErr(null); setPending(true)
    try {
      await apiFetch('/superadmin/plans', {
        method: 'POST',
        body: {
          code: code.trim().toLowerCase(),
          name: name.trim(),
          rate_per_min_inr: Number(rate),
          calls_per_day: capPerDay === '' ? null : Number(capPerDay),
          is_active: true,
        },
      })
      reset(); onOpenChange(false); onCreated?.()
    } catch (e) {
      setErr(e?.body?.detail || e?.message || 'Failed')
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Plan</DialogTitle>
          <DialogDescription>Selling rate × call minutes = customer bill.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4 mt-2">
          <div className="space-y-1.5"><Label>Code</Label><Input required value={code} onChange={e => setCode(e.target.value)} placeholder="enterprise" /></div>
          <div className="space-y-1.5"><Label>Name</Label><Input required value={name} onChange={e => setName(e.target.value)} placeholder="Enterprise" /></div>
          <div className="space-y-1.5"><Label>Rate (₹/min)</Label><Input required type="number" step="0.01" min={0} value={rate} onChange={e => setRate(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Calls/Day (blank = unlimited)</Label><Input type="number" min={0} value={capPerDay} onChange={e => setCapPerDay(e.target.value)} /></div>
          {err && (
            <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2.5 text-sm text-red-500">
              <AlertCircle className="size-4 mt-0.5 shrink-0" /><span>{String(err)}</span>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => { reset(); onOpenChange(false) }}>Cancel</Button>
            <Button type="submit" variant="gradient" disabled={pending || !code || !name || !rate}>
              {pending ? <><Loader2 className="size-4 animate-spin" /> Saving…</> : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
