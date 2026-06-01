import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Loader2, Save, IndianRupee } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { SkeletonList } from '@/components/ui/skeleton'
import { apiFetch } from '@/lib/api'
import { toast, alertError } from '@/lib/swal'

const UNITS = ['minute', 'char', 'token_1k']

export default function SuperAdminCostRates() {
  const [rates,   setRates]   = useState([])
  const [loading, setLoading] = useState(true)
  const [err,     setErr]     = useState(null)
  const [savingMod, setSavingMod] = useState(null)
  const [drafts, setDrafts] = useState({})   // module → { unit, rate_inr, selling_price_inr }

  async function load() {
    setLoading(true); setErr(null)
    try {
      const r = await apiFetch('/superadmin/cost_rates')
      const list = r?.rates || []
      setRates(list)
      const d = {}
      for (const row of list) {
        d[row.module] = { unit: row.unit, rate_inr: row.rate_inr }
      }
      setDrafts(d)
    } catch (e) {
      setErr(e?.body?.detail || e?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  async function save(module) {
    const d = drafts[module]
    if (!d) return
    setSavingMod(module)
    try {
      await apiFetch(`/superadmin/cost_rates/${encodeURIComponent(module)}`, {
        method: 'PUT',
        body: { unit: d.unit, rate_inr: Number(d.rate_inr) },
      })
      await load()
      toast({ icon: 'success', text: `${module} updated` })
    } catch (e) {
      await alertError(e?.body?.detail || 'Failed to save')
    } finally {
      setSavingMod(null)
    }
  }

  function set(module, key, value) {
    setDrafts(d => ({ ...d, [module]: { ...d[module], [key]: value } }))
  }

  return (
    <div className="w-full px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Cost Rates</h1>
          <p className="text-sm text-[var(--color-fg-muted)] mt-1">
            What we pay providers per module. Selling rate now comes from the <strong>Plans</strong> page
            (rate × call minutes). Edit a cell, click save. Cache invalidated automatically.
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

      {loading && !rates.length && <SkeletonList count={5} />}

      {!loading && rates.length > 0 && (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-bg-muted)] text-[var(--color-fg-subtle)] text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Module</th>
                  <th className="px-4 py-3 text-left">Unit</th>
                  <th className="px-4 py-3 text-left">Cost (INR)</th>
                  <th className="px-4 py-3 text-left">Updated</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {rates.map((r, i) => {
                  const d = drafts[r.module] || r
                  const dirty =
                    d.unit !== r.unit ||
                    Number(d.rate_inr) !== Number(r.rate_inr)
                  return (
                    <motion.tr
                      key={r.module}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: i * 0.02 }}
                      className="border-t border-[var(--color-border)]"
                    >
                      <td className="px-4 py-3 font-medium">{r.module}</td>
                      <td className="px-4 py-3">
                        <Select
                          value={d.unit} onChange={e => set(r.module, 'unit', e.target.value)}
                        >
                          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </Select>
                      </td>
                      <td className="px-4 py-3">
                        <RupeeInput value={d.rate_inr} onChange={v => set(r.module, 'rate_inr', v)} />
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--color-fg-subtle)]">
                        {r.updated_at ? new Date(r.updated_at).toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant={dirty ? 'gradient' : 'ghost'}
                          size="sm"
                          disabled={!dirty || savingMod === r.module}
                          onClick={() => save(r.module)}
                        >
                          {savingMod === r.module ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
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

      <p className="text-xs text-[var(--color-fg-subtle)]">
        Units: <code>minute</code> = per call minute · <code>char</code> = per TTS char ·{' '}
        <code>token_1k</code> = per 1000 LLM tokens.
      </p>
    </div>
  )
}

function RupeeInput({ value, onChange, placeholder }) {
  return (
    <div className="relative w-32">
      <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[var(--color-fg-subtle)]" />
      <Input
        type="number" step="0.0001" min={0}
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 pl-7"
      />
    </div>
  )
}
