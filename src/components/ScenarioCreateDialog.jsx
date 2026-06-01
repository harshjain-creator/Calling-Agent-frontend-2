import { useState } from 'react'
import { Loader2, AlertCircle, FileText } from 'lucide-react'
import { motion } from 'framer-motion'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Modal for client_admin / super_admin to create a new PRIVATE scenario.
 * Posts to /admin/scenarios — backend forces is_private=true scoped to current org_id.
 *
 * Props:
 *   open        : boolean
 *   onOpenChange(open)
 *   onCreated(newScenario)   : called with response { id, is_private, org_id }
 */
export default function ScenarioCreateDialog({ open, onOpenChange, onCreated }) {
  const { role } = useAuth()
  const isSuper = role === 'super_admin'
  const [title,   setTitle]   = useState('')
  const [summary, setSummary] = useState('')
  const [body,    setBody]    = useState('')
  const [pending, setPending] = useState(false)
  const [error,   setError]   = useState(null)

  function reset() {
    setTitle(''); setSummary(''); setBody('')
    setError(null); setPending(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null); setPending(true)
    try {
      // super_admin → /superadmin/scenarios (creates PUBLIC by default, cross-org).
      // client_admin → /admin/scenarios (creates PRIVATE scoped to their org).
      const endpoint = isSuper ? '/superadmin/scenarios' : '/admin/scenarios'
      const payload = isSuper
        ? { title: title.trim(), summary: summary.trim() || null, body: body.trim(),
            is_private: false, org_id: null }
        : { title: title.trim(), summary: summary.trim() || null, body: body.trim() }
      const created = await apiFetch(endpoint, { method: 'POST', body: payload })
      onCreated?.({ ...created, title: title.trim(), summary: summary.trim() || null })
      reset()
      onOpenChange(false)
    } catch (err) {
      setError(err?.body?.detail || err?.body?.error || err?.message || 'Failed to create')
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto no-scrollbar">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              <FileText className="size-4" />
            </div>
            <div>
              <DialogTitle>New Scenario</DialogTitle>
              <DialogDescription>
                Saved as a private scenario scoped to your organisation.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="sc-title">Title</Label>
            <Input
              id="sc-title"
              placeholder="Real Estate — Luxury Site Visit"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              maxLength={120}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sc-summary">Summary (optional)</Label>
            <Input
              id="sc-summary"
              placeholder="One-line description shown on the scenario picker"
              value={summary}
              onChange={e => setSummary(e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sc-body">Scenario body</Label>
            <Textarea
              id="sc-body"
              rows={10}
              placeholder="Full call script / context / dos and don'ts. The agent reads this as the system prompt."
              value={body}
              onChange={e => setBody(e.target.value)}
              required
              minLength={20}
              className="min-h-[200px]"
            />
            <p className="text-xs text-[var(--color-fg-subtle)]">
              {body.length.toLocaleString()} chars · Agent name + gender are LOCKED to env values; do not write them in this body.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2.5 text-sm text-red-500"
            >
              <AlertCircle className="size-4 mt-0.5 shrink-0" />
              <span>{String(error)}</span>
            </motion.div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => { reset(); onOpenChange(false) }}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={pending || !title.trim() || body.trim().length < 20}>
              {pending ? <><Loader2 className="size-4 animate-spin" /> Saving…</> : 'Save Scenario'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
