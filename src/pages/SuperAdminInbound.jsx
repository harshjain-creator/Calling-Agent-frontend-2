import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, RefreshCw, Trash2, Edit3, Phone, Building2,
  CheckCircle2, XCircle, Loader2,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { SkeletonTable } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { apiFetch } from '@/lib/api'
import { confirm as swalConfirm, toast, alertError } from '@/lib/swal'

/**
 * /superadmin/inbound — phone-number → org + scenarios mapping.
 *
 * Carrier (Plivo/Twilio/Exotel) routes inbound calls to a webhook on the
 * backend; this page configures which org + scenarios respond on each
 * number. Backend POST /inbound/{provider} reads this table to bootstrap
 * the call session.
 */
export default function SuperAdminInbound() {
  const [rows,      setRows]      = useState([])
  const [orgs,      setOrgs]      = useState([])
  const [scenarios, setScenarios] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [err,       setErr]       = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [editRow,   setEditRow]   = useState(null)  // row being edited (or null)
  const [dialogOpen, setDialogOpen] = useState(false)

  async function load() {
    setLoading(true); setErr(null)
    try {
      const [a, o, s] = await Promise.all([
        apiFetch('/superadmin/inbound_numbers'),
        apiFetch('/superadmin/orgs'),
        apiFetch('/superadmin/scenarios'),
      ])
      setRows(a?.inbound_numbers || [])
      setOrgs(o?.orgs || [])
      setScenarios(s?.scenarios || [])
    } catch (e) {
      setErr(e?.body?.detail || e?.body?.error || e?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const orgMap = Object.fromEntries(orgs.map(o => [o.id, o.name]))
  const scnMap = Object.fromEntries(scenarios.map(s => [s.id, s.title]))

  async function handleDelete(row) {
    const ok = await swalConfirm({
      title: 'Delete inbound mapping?',
      text:  `Calls to ${row.phone_number} will stop being handled by this scenario.`,
      confirmText: 'Delete', danger: true,
    })
    if (!ok) return
    setDeletingId(row.id)
    try {
      await apiFetch(`/superadmin/inbound_numbers/${row.id}`, { method: 'DELETE' })
      await load()
      toast({ icon: 'success', text: 'Mapping deleted' })
    } catch (e) {
      await alertError(e?.body?.detail || 'Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  function openCreate() { setEditRow(null); setDialogOpen(true) }
  function openEdit(row) { setEditRow(row); setDialogOpen(true) }

  return (
    <div className="w-full px-4 sm:px-6 py-8 space-y-6">
      {/* Heading */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Inbound Numbers</h1>
          <p className="text-sm text-[var(--color-fg-muted)] mt-1">
            Map carrier phone numbers to client orgs + scenarios. Each row = how the AI
            answers when someone dials that number.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={load}>
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button variant="gradient" size="sm" onClick={openCreate}>
            <Plus className="size-4" /> New Mapping
          </Button>
        </div>
      </div>

      {err && (
        <Card className="border-red-500/40 bg-red-500/10">
          <CardContent className="pt-5 text-red-500 text-sm">{String(err)}</CardContent>
        </Card>
      )}

      {loading && !rows.length && <SkeletonTable rows={5} cols={5} />}

      {!loading && rows.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Phone className="size-10 text-[var(--color-fg-subtle)] mx-auto mb-3" />
            <p className="text-[var(--color-fg)] text-base mb-1">No inbound mappings yet</p>
            <p className="text-[var(--color-fg-subtle)] text-sm mb-5">Add one to start receiving calls.</p>
            <Button variant="outline" onClick={openCreate}>
              <Plus className="size-4" /> Add mapping
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && rows.length > 0 && (
        <div className="space-y-3">
          {rows.map((r, i) => {
            const scenIds = (r.scenario_ids_csv || '').split(',').map(s => s.trim()).filter(Boolean)
            return (
              <motion.div key={r.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.3) }}
              >
                <Card className="hover:border-[var(--color-accent)] transition-all">
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-start gap-4">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        r.is_active
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : 'bg-[var(--color-bg-muted)] text-[var(--color-fg-subtle)]'
                      }`}>
                        <Phone className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline gap-2 mb-1">
                          <span className="text-[var(--color-fg)] font-semibold text-base">{r.phone_number}</span>
                          <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            r.is_active
                              ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10'
                              : 'text-[var(--color-fg-subtle)] border-[var(--color-border)]'
                          }`}>
                            {r.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-[var(--color-border)] text-[var(--color-fg-muted)]">
                            {(r.gender || 'female').toLowerCase()} · {r.agent_name || 'Riya'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-fg-subtle)] mb-2">
                          <span className="inline-flex items-center gap-1">
                            <Building2 className="size-3" /> {orgMap[r.org_id] || r.org_id?.slice(0, 8) + '…'}
                          </span>
                          <span>Lang: {r.language || 'en'}</span>
                          {scenIds.length > 0 && <span>{scenIds.length} scenario{scenIds.length !== 1 ? 's' : ''}</span>}
                        </div>
                        {scenIds.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {scenIds.map(sid => (
                              <span key={sid}
                                className="text-xs px-2 py-0.5 rounded bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                              >
                                {scnMap[sid] || sid.slice(0, 8) + '…'}
                              </span>
                            ))}
                          </div>
                        )}
                        {r.welcome_line && (
                          <p className="text-[var(--color-fg-muted)] text-xs italic mt-2">"{r.welcome_line}"</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => openEdit(r)}>
                          <Edit3 className="size-4" />
                        </Button>
                        <Button
                          variant="ghost" size="icon" aria-label="Delete"
                          disabled={deletingId === r.id}
                          onClick={() => handleDelete(r)}
                          className="text-red-500 hover:bg-red-500/10"
                        >
                          {deletingId === r.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      <InboundDialog
        open={dialogOpen}
        onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditRow(null) }}
        row={editRow}
        orgs={orgs}
        scenarios={scenarios}
        onSaved={async () => { setDialogOpen(false); setEditRow(null); await load() }}
      />
    </div>
  )
}


/* ────────────────────────────────────────────────────────────────────────
   Create / Edit dialog
   ──────────────────────────────────────────────────────────────────────── */

function InboundDialog({ open, onOpenChange, row, orgs, scenarios, onSaved }) {
  const editing = Boolean(row?.id)
  const [phone,        setPhone]        = useState('')
  const [orgId,        setOrgId]        = useState('')
  const [scenIds,      setScenIds]      = useState([])  // array of scenario ids
  const [defaultScen,  setDefaultScen]  = useState('')
  const [agentName,    setAgentName]    = useState('Riya')
  const [gender,       setGender]       = useState('female')
  const [language,     setLanguage]     = useState('en')
  const [welcome,      setWelcome]      = useState('')
  const [notes,        setNotes]        = useState('')
  const [isActive,     setIsActive]     = useState(true)
  const [pending,      setPending]      = useState(false)
  const [error,        setError]        = useState(null)

  // Reset / hydrate form when row changes
  useEffect(() => {
    if (!open) return
    if (row) {
      setPhone(row.phone_number || '')
      setOrgId(row.org_id || '')
      const ids = (row.scenario_ids_csv || '').split(',').map(s => s.trim()).filter(Boolean)
      setScenIds(ids)
      setDefaultScen(row.default_scenario_id || ids[0] || '')
      setAgentName(row.agent_name || 'Riya')
      setGender((row.gender || 'female').toLowerCase())
      setLanguage(row.language || 'en')
      setWelcome(row.welcome_line || '')
      setNotes(row.notes || '')
      setIsActive(row.is_active !== false)
    } else {
      setPhone(''); setOrgId(''); setScenIds([]); setDefaultScen('')
      setAgentName('Riya'); setGender('female'); setLanguage('en')
      setWelcome(''); setNotes(''); setIsActive(true)
    }
    setError(null)
  }, [open, row])

  // Scope scenario picker: org-private scenarios for the selected org + all public
  const visibleScenarios = scenarios.filter(s =>
    !s.is_private || (s.org_id && s.org_id === orgId)
  )

  function toggleScen(id) {
    setScenIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!phone.trim() || !orgId) {
      setError('Phone + org required'); return
    }
    setPending(true)
    try {
      const payload = {
        phone_number:        phone.trim(),
        org_id:              orgId,
        scenario_ids_csv:    scenIds.join(','),
        default_scenario_id: defaultScen || (scenIds[0] || null),
        agent_name:          agentName.trim() || 'Riya',
        gender,
        language,
        welcome_line:        welcome.trim() || null,
        notes:               notes.trim() || null,
      }
      if (editing) {
        payload.is_active = isActive
        await apiFetch(`/superadmin/inbound_numbers/${row.id}`, { method: 'PATCH', body: payload })
      } else {
        await apiFetch('/superadmin/inbound_numbers', { method: 'POST', body: payload })
      }
      toast({ icon: 'success', text: editing ? 'Mapping updated' : 'Mapping created' })
      onSaved?.()
    } catch (err) {
      setError(err?.body?.detail || err?.body?.error || err?.message || 'Save failed')
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto no-scrollbar">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit inbound mapping' : 'New inbound mapping'}</DialogTitle>
          <DialogDescription>
            Configure how the AI answers when this phone number receives a call.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ib-phone">Phone number (E.164)</Label>
              <Input
                id="ib-phone" placeholder="+918031448617"
                value={phone} onChange={e => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ib-org">Client org</Label>
              <Select
                id="ib-org" value={orgId} onChange={e => setOrgId(e.target.value)} required
              >
                <option value="">— pick an org —</option>
                {orgs.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ib-agent">Agent name</Label>
              <Input
                id="ib-agent" placeholder="Riya"
                value={agentName} onChange={e => setAgentName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Voice</Label>
              <Select value={gender} onChange={e => setGender(e.target.value)}>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={language} onChange={e => setLanguage(e.target.value)}>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="hi-en">Hinglish</option>
                <option value="mr">Marathi</option>
                <option value="ta">Tamil</option>
                <option value="te">Telugu</option>
                <option value="kn">Kannada</option>
                <option value="bn">Bengali</option>
                <option value="gu">Gujarati</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Scenarios available on this number</Label>
            <p className="text-xs text-[var(--color-fg-subtle)]">
              Pick one or more. If 2+ selected, AI asks the caller which they need at start.
            </p>
            <div className="rounded-lg border border-[var(--color-border)] max-h-44 overflow-y-auto p-2 space-y-1">
              {visibleScenarios.length === 0 && (
                <p className="text-xs text-[var(--color-fg-subtle)] p-3 text-center">
                  No scenarios visible. Pick an org first or add scenarios in /admin/scenarios.
                </p>
              )}
              {visibleScenarios.map(s => {
                const picked = scenIds.includes(s.id)
                return (
                  <button type="button" key={s.id}
                    onClick={() => toggleScen(s.id)}
                    className={`w-full text-left text-sm rounded-md px-2 py-1.5 flex items-center gap-2 transition-colors ${
                      picked
                        ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                        : 'hover:bg-[var(--color-bg-muted)] text-[var(--color-fg)]'
                    }`}
                  >
                    {picked
                      ? <CheckCircle2 className="size-4 shrink-0" />
                      : <XCircle className="size-4 shrink-0 text-[var(--color-fg-subtle)]" />}
                    <span className="flex-1 truncate">{s.title}</span>
                    {s.is_private && <span className="text-[10px] uppercase tracking-wider text-[var(--color-fg-subtle)]">private</span>}
                  </button>
                )
              })}
            </div>
            {scenIds.length > 1 && (
              <div className="space-y-1 pt-1">
                <Label>Default (used if caller skips menu)</Label>
                <Select value={defaultScen} onChange={e => setDefaultScen(e.target.value)}>
                  {scenIds.map(id => {
                    const s = scenarios.find(x => x.id === id)
                    return <option key={id} value={id}>{s?.title || id}</option>
                  })}
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ib-welcome">Welcome line (optional override)</Label>
            <Input
              id="ib-welcome"
              placeholder="Leave blank to auto-generate. Or: 'Hi, you've reached Acme Insurance, how can I help?'"
              value={welcome} onChange={e => setWelcome(e.target.value)}
              maxLength={200}
            />
            <p className="text-xs text-[var(--color-fg-subtle)]">
              Static welcome string replaces the AI-generated greeting. Useful for compliance-required openings.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ib-notes">Internal notes</Label>
              <Input
                id="ib-notes" placeholder="e.g. main sales line for ACME"
                value={notes} onChange={e => setNotes(e.target.value)}
                maxLength={200}
              />
            </div>
            {editing && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={isActive ? 'active' : 'inactive'} onChange={e => setIsActive(e.target.value === 'active')}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive (stop routing)</option>
                </Select>
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2.5 text-sm text-red-500">
              {String(error)}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={pending || !phone.trim() || !orgId}>
              {pending ? <><Loader2 className="size-4 animate-spin" /> Saving…</> : (editing ? 'Save changes' : 'Create mapping')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
