import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Lock, Globe2, Trash2, Loader2, AlertCircle, FileText, RefreshCw } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SkeletonList } from '@/components/ui/skeleton'
import { apiFetch } from '@/lib/api'
import { useScenarios } from '@/hooks/useScenarios'
import { useAuth } from '@/contexts/AuthContext'
import ScenarioCreateDialog from '@/components/ScenarioCreateDialog'
import { confirm as swalConfirm, toast, alertError } from '@/lib/swal'

/**
 * /admin/scenarios — scenario management.
 *
 * Role behaviour (backend-enforced; UI mirrors):
 *   client_admin: sees public + own-org private. CRUD only own-org private.
 *   super_admin:  sees everything. Create button still uses /admin/scenarios
 *                 (creates private scoped to a hidden org); to create PUBLIC
 *                 they should use /superadmin/scenarios API directly.
 */
export default function ScenariosPage() {
  const { scenarios, loading, error, reload } = useScenarios()
  const { role } = useAuth()
  const isSuper = role === 'super_admin'

  const [modalOpen, setModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [deleteErr,  setDeleteErr]  = useState(null)

  async function handleDelete(s) {
    const ok = await swalConfirm({
      title: 'Delete scenario?',
      text:  `"${s.title}" will be permanently removed. This cannot be undone.`,
      confirmText: 'Delete',
      danger: true,
    })
    if (!ok) return
    setDeletingId(s.id); setDeleteErr(null)
    try {
      const path = isSuper && !s.is_private
        ? `/superadmin/scenarios/${s.id}`     // public-deleted only via super route
        : `/admin/scenarios/${s.id}`
      await apiFetch(path, { method: 'DELETE' })
      await reload()
      toast({ icon: 'success', text: 'Scenario deleted' })
    } catch (err) {
      const msg = err?.body?.detail || err?.message || 'Failed to delete'
      setDeleteErr(msg)
      await alertError(msg)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="w-full px-4 sm:px-6 py-8 space-y-6">
      {/* Heading */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Scenarios</h1>
          <p className="text-sm text-[var(--color-fg-muted)] mt-1">
            {isSuper
              ? 'All scenarios across orgs. Click a row to inspect, delete, or create new private ones.'
              : 'Your private scenarios + public templates. Add your own to use during bulk calls.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={reload}>
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button variant="gradient" size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="size-4" /> New Scenario
          </Button>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total"   value={scenarios.length} />
        <StatCard label="Public"  value={scenarios.filter(s => !s.is_private).length} icon={Globe2} />
        <StatCard label="Private" value={scenarios.filter(s => s.is_private).length}  icon={Lock} />
      </div>

      {deleteErr && (
        <Card className="border-red-500/40 bg-red-500/10">
          <CardContent className="pt-5 flex gap-3">
            <AlertCircle className="size-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-red-500 text-sm">{deleteErr}</div>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {loading && <SkeletonList count={4} />}
      {error && !loading && (
        <Card className="border-red-500/40 bg-red-500/10">
          <CardContent className="pt-6 text-red-500 text-sm">{String(error)}</CardContent>
        </Card>
      )}
      {!loading && !error && scenarios.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="size-10 text-[var(--color-fg-subtle)] mx-auto mb-3" />
            <p className="text-[var(--color-fg)] text-base mb-1">No scenarios yet</p>
            <p className="text-[var(--color-fg-subtle)] text-sm mb-5">Create your first one to start dialing.</p>
            <Button variant="outline" size="default" onClick={() => setModalOpen(true)}>
              <Plus className="size-4" /> Create scenario
            </Button>
          </CardContent>
        </Card>
      )}
      {!loading && !error && scenarios.length > 0 && (
        <div className="space-y-3">
          {scenarios.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.4) }}
            >
              <Card className="hover:border-[var(--color-accent)] transition-all">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start gap-4">
                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      s.is_private
                        ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                        : 'bg-emerald-500/15 text-emerald-500'
                    }`}>
                      {s.is_private ? <Lock className="size-5" /> : <Globe2 className="size-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline gap-2 mb-1">
                        <span className="text-[var(--color-fg)] font-semibold">{s.title}</span>
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          s.is_private
                            ? 'text-[var(--color-accent)] border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                            : 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10'
                        }`}>
                          {s.is_private ? 'Private' : 'Public'}
                        </span>
                        {!s.is_active && (
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-[var(--color-border)] text-[var(--color-fg-subtle)]">
                            Inactive
                          </span>
                        )}
                      </div>
                      {s.summary && (
                        <p className="text-[var(--color-fg-muted)] text-sm leading-relaxed line-clamp-2">{s.summary}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[var(--color-fg-subtle)]">
                        {s.org_id && <span>Org: {String(s.org_id).slice(0, 8)}…</span>}
                        <span>·</span>
                        <span>Created {new Date(s.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost" size="icon" aria-label="Delete"
                      disabled={deletingId === s.id}
                      onClick={() => handleDelete(s)}
                      className="text-red-500 hover:bg-red-500/10"
                    >
                      {deletingId === s.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <ScenarioCreateDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        onCreated={() => reload()}
      />
    </div>
  )
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-[var(--color-fg-subtle)] text-xs uppercase tracking-wider mb-2">
          {Icon && <Icon className="size-3.5" />}
          {label}
        </div>
        <p className="text-[var(--color-fg)] text-2xl font-bold tracking-tight font-display">{value}</p>
      </CardContent>
    </Card>
  )
}
