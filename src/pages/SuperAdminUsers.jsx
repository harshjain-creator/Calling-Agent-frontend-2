import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, RefreshCw, Loader2, AlertCircle, User2, Building2, Trash2, Shield,
  Sparkles,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { SkeletonTable } from '@/components/ui/skeleton'
import { apiFetch } from '@/lib/api'
import { confirm as swalConfirm, toast, alertError } from '@/lib/swal'

export default function SuperAdminUsers() {
  const [users, setUsers] = useState([])
  const [orgs,  setOrgs]  = useState([])
  const [loading, setLoading] = useState(true)
  const [err,     setErr]     = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [orgOpen,    setOrgOpen]    = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  async function load() {
    setLoading(true); setErr(null)
    try {
      const [u, o] = await Promise.all([
        apiFetch('/superadmin/users'),
        apiFetch('/superadmin/orgs'),
      ])
      setUsers(u?.users || [])
      setOrgs(o?.orgs || [])
    } catch (e) {
      setErr(e?.body?.detail || e?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const orgMap = Object.fromEntries(orgs.map(o => [o.id, o.name]))

  async function handleDelete(u) {
    const ok = await swalConfirm({
      title: 'Delete user?',
      text:  `User ${u.email} will be removed and active refresh tokens revoked.`,
      confirmText: 'Delete', danger: true,
    })
    if (!ok) return
    setDeletingId(u.id)
    try {
      await apiFetch(`/superadmin/users/${u.id}`, { method: 'DELETE' })
      await load()
      toast({ icon: 'success', text: 'User deleted' })
    } catch (e) {
      await alertError(e?.body?.detail || 'Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="w-full px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-[var(--color-fg-muted)] mt-1">
            Client admins + super admins. One client admin per org.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={load}>
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => setOrgOpen(true)}>
            <Building2 className="size-4" /> New Org
          </Button>
          <Button variant="gradient" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> New User
          </Button>
        </div>
      </div>

      {err && (
        <Card className="border-red-500/40 bg-red-500/10">
          <CardContent className="pt-5 text-red-500 text-sm">{String(err)}</CardContent>
        </Card>
      )}

      {loading && !users.length && <SkeletonTable rows={5} cols={4} />}
      {false && (
        <div className="flex items-center justify-center py-16 text-[var(--color-fg-muted)]">
          <Loader2 className="size-5 animate-spin mr-3" /> Loading…
        </div>
      )}

      {!loading && users.length > 0 && (
        <div className="space-y-3">
          {users.map((u, i) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.4) }}
            >
              <Card className="hover:border-[var(--color-accent)] transition-all">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start gap-4">
                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      u.role === 'super_admin'
                        ? 'bg-amber-500/15 text-amber-500'
                        : 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                    }`}>
                      {u.role === 'super_admin' ? <Shield className="size-5" /> : <User2 className="size-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline gap-2 mb-1">
                        <span className="text-[var(--color-fg)] font-semibold">{u.full_name || u.email}</span>
                        <span className="text-[var(--color-fg-subtle)] text-xs">·</span>
                        <span className="text-[var(--color-fg-muted)] text-sm">{u.email}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-[var(--color-fg-subtle)]">
                        <span className="uppercase tracking-wider">{u.role.replace('_', ' ')}</span>
                        {u.org_id && <><span>·</span><span>Org: {orgMap[u.org_id] || u.org_id.slice(0, 8) + '…'}</span></>}
                        {u.last_login_at && <><span>·</span><span>Last login {new Date(u.last_login_at).toLocaleDateString()}</span></>}
                        {!u.is_active && <><span>·</span><span className="text-amber-500">Disabled</span></>}
                      </div>
                    </div>
                    <Button
                      variant="ghost" size="icon" aria-label="Delete"
                      disabled={deletingId === u.id}
                      onClick={() => handleDelete(u)}
                      className="text-red-500 hover:bg-red-500/10"
                    >
                      {deletingId === u.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Orgs section w/ Assign Plan */}
      {orgs.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-xl font-semibold mt-4">Organisations</h2>
          {orgs.map(o => <OrgPlanRow key={o.id} org={o} />)}
        </div>
      )}

      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} orgs={orgs} onCreated={load} />
      <CreateOrgDialog  open={orgOpen}    onOpenChange={setOrgOpen}    onCreated={load} />
    </div>
  )
}

function OrgPlanRow({ org }) {
  const [sub,    setSub]    = useState(null)
  const [open,   setOpen]   = useState(false)
  const [loading,setLoading]= useState(true)

  async function loadSub() {
    setLoading(true)
    try {
      const r = await apiFetch(`/superadmin/orgs/${org.id}/subscription`)
      setSub(r?.subscription || null)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }
  useEffect(() => { loadSub() }, [org.id])

  const plan = sub?.plans
  const ends = sub?.ends_at ? new Date(sub.ends_at) : null
  return (
    <>
      <Card>
        <CardContent className="pt-4 pb-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center">
            <Building2 className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold">{org.name}</p>
            <p className="text-xs text-[var(--color-fg-subtle)] mt-0.5">
              {loading
                ? 'Loading plan…'
                : plan
                  ? <>Plan: <span className="text-[var(--color-fg)]">{plan.name}</span> · ₹{Number(plan.rate_per_min_inr).toFixed(2)}/min · {plan.calls_per_day ?? '∞'} calls/day · ends {ends?.toLocaleDateString()}</>
                  : <span className="text-amber-500">No active plan</span>}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            <Sparkles className="size-4" /> Assign Plan
          </Button>
        </CardContent>
      </Card>
      <AssignPlanDialog open={open} onOpenChange={setOpen} org={org} onAssigned={loadSub} />
    </>
  )
}

function AssignPlanDialog({ open, onOpenChange, org, onAssigned }) {
  const [plans,   setPlans]   = useState([])
  const [planId,  setPlanId]  = useState('')
  const [months,  setMonths]  = useState(1)
  const [pending, setPending] = useState(false)
  const [err,     setErr]     = useState(null)

  useEffect(() => {
    if (!open) return
    apiFetch('/superadmin/plans')
      .then(r => {
        const list = (r?.plans || []).filter(p => p.is_active)
        setPlans(list)
        if (list[0]) setPlanId(list[0].id)
      })
      .catch(e => setErr(e?.body?.detail || e?.message))
  }, [open])

  async function submit(e) {
    e.preventDefault()
    setErr(null); setPending(true)
    try {
      await apiFetch(`/superadmin/orgs/${org.id}/subscription`, {
        method: 'POST', body: { plan_id: planId, months: Number(months) },
      })
      onAssigned?.()
      onOpenChange(false)
    } catch (e) {
      setErr(e?.body?.detail || e?.message || 'Failed')
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Plan</DialogTitle>
          <DialogDescription>{org.name} — replaces any active subscription.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Plan</Label>
            <Select value={planId} onChange={e => setPlanId(e.target.value)} required
              className="w-full h-11 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-3 text-sm">
              {plans.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — ₹{Number(p.rate_per_min_inr).toFixed(2)}/min · {p.calls_per_day ?? '∞'}/day
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Duration (months)</Label>
            <Select value={months} onChange={e => setMonths(Number(e.target.value))}
              className="w-full h-11 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-3 text-sm">
              <option value={1}>1 month</option>
              <option value={3}>3 months</option>
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
            </Select>
          </div>
          {err && (
            <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2.5 text-sm text-red-500">
              <AlertCircle className="size-4 mt-0.5 shrink-0" /><span>{String(err)}</span>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="gradient" disabled={pending || !planId}>
              {pending ? <><Loader2 className="size-4 animate-spin" /> Saving…</> : 'Assign'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CreateUserDialog({ open, onOpenChange, orgs, onCreated }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role,     setRole]     = useState('client_admin')
  const [orgId,    setOrgId]    = useState('')
  const [err, setErr] = useState(null)
  const [pending, setPending] = useState(false)

  function reset() {
    setEmail(''); setPassword(''); setFullName('')
    setRole('client_admin'); setOrgId('')
    setErr(null); setPending(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErr(null); setPending(true)
    try {
      const body = {
        email: email.trim(), password, full_name: fullName.trim() || null, role,
        org_id: role === 'client_admin' ? orgId : null,
      }
      await apiFetch('/superadmin/users', { method: 'POST', body })
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
          <DialogTitle>New User</DialogTitle>
          <DialogDescription>One client_admin per org enforced server-side.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5"><Label>Email</Label><Input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Password</Label><Input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Full name</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} /></div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onChange={e => setRole(e.target.value)}
              className="w-full h-11 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-3 text-sm">
              <option value="client_admin">client_admin</option>
              <option value="super_admin">super_admin</option>
            </Select>
          </div>
          {role === 'client_admin' && (
            <div className="space-y-1.5">
              <Label>Org</Label>
              <Select required value={orgId} onChange={e => setOrgId(e.target.value)}
                className="w-full h-11 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-3 text-sm">
                <option value="">Select org…</option>
                {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </Select>
            </div>
          )}
          {err && (
            <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2.5 text-sm text-red-500">
              <AlertCircle className="size-4 mt-0.5 shrink-0" /><span>{String(err)}</span>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => { reset(); onOpenChange(false) }}>Cancel</Button>
            <Button type="submit" variant="gradient" disabled={pending}>
              {pending ? <><Loader2 className="size-4 animate-spin" /> Saving…</> : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CreateOrgDialog({ open, onOpenChange, onCreated }) {
  const [name, setName] = useState('')
  const [err, setErr] = useState(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErr(null); setPending(true)
    try {
      await apiFetch('/superadmin/orgs', { method: 'POST', body: { name: name.trim() } })
      setName(''); onOpenChange(false); onCreated?.()
    } catch (e) {
      setErr(e?.body?.detail || e?.message || 'Failed')
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setName(''); setErr(null) } onOpenChange(v) }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Org</DialogTitle>
          <DialogDescription>Client organisation. Each org gets one client_admin.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5"><Label>Org name</Label><Input required value={name} onChange={e => setName(e.target.value)} placeholder="Acme Corp" /></div>
          {err && (
            <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2.5 text-sm text-red-500">
              <AlertCircle className="size-4 mt-0.5 shrink-0" /><span>{String(err)}</span>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="gradient" disabled={pending || !name.trim()}>
              {pending ? <><Loader2 className="size-4 animate-spin" /> Saving…</> : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
