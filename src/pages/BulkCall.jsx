import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Upload, FileText, Play, Loader2, CheckCircle2, AlertCircle,
  Phone, Trash2, Download, Lock, Plus,
} from 'lucide-react'

import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { useScenarios } from '@/hooks/useScenarios'
import ScenarioCreateDialog from '@/components/ScenarioCreateDialog'

// Minimal CSV parser — handles quoted fields + escaped quotes.
function parseCSV(text) {
  const rows = []
  let i = 0, field = '', row = [], inQuote = false
  while (i < text.length) {
    const c = text[i]
    if (inQuote) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i += 2; continue }
      if (c === '"') { inQuote = false; i++; continue }
      field += c; i++; continue
    }
    if (c === '"') { inQuote = true; i++; continue }
    if (c === ',') { row.push(field); field = ''; i++; continue }
    if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field); rows.push(row); row = []; field = ''; i++; continue
    }
    field += c; i++
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  return rows.filter(r => r.length && r.some(v => v.trim()))
}

function csvToObjects(text) {
  const rows = parseCSV(text)
  if (!rows.length) return []
  const header = rows[0].map(h => h.trim().toLowerCase())
  const aliases = {
    name:     ['name', 'full name', 'customer'],
    email:    ['email', 'e-mail', 'mail'],
    phone:    ['phone', 'phone_number', 'phone number', 'mobile', 'number'],
    scenario: ['scenario', 'context', 'pitch'],
  }
  const colIdx = {}
  for (const key of Object.keys(aliases)) {
    colIdx[key] = header.findIndex(h => aliases[key].includes(h))
  }
  return rows.slice(1).map(r => ({
    name:     colIdx.name >= 0     ? (r[colIdx.name]     || '').trim() : '',
    email:    colIdx.email >= 0    ? (r[colIdx.email]    || '').trim() : '',
    phone:    colIdx.phone >= 0    ? (r[colIdx.phone]    || '').trim() : '',
    scenario: colIdx.scenario >= 0 ? (r[colIdx.scenario] || '').trim() : '',
  }))
}

function validateRow(r) {
  if (!r.name)  return 'name required'
  if (!r.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) return 'invalid email'
  const digits = (r.phone || '').replace(/\D/g, '')
  if (digits.length < 10) return 'phone < 10 digits'
  return null
}

const SAMPLE_CSV =
  'name,email,phone,scenario\n' +
  'Harsh Jain,harsh@example.com,9876543210,Call from FI DIGITAL about staffing services\n' +
  'Priya Singh,priya@example.com,9123456780,\n'

export default function BulkCall({ embedded = false } = {}) {
  const navigate = useNavigate()
  const fileRef  = useRef(null)
  const { scenarios, loading: loadingScenarios, error: scenariosError, reload: reloadScenarios } = useScenarios()
  const [scenarioModalOpen, setScenarioModalOpen] = useState(false)

  const [rows, setRows] = useState([])
  const [defaultScenarioId, setDefaultScenarioId] = useState('')
  const [delayMs,   setDelayMs]   = useState(4000)
  const [maxConcur, setMaxConcur] = useState(3)
  const [gender,    setGender]    = useState('male')
  const [submitting, setSubmitting] = useState(false)
  const [runId,    setRunId]    = useState(null)
  const [progress, setProgress] = useState(null)
  const [error,    setError]    = useState(null)
  const [dragging, setDragging] = useState(false)

  // Auto-pick first scenario when fetched
  useEffect(() => {
    if (!defaultScenarioId && scenarios.length) setDefaultScenarioId(scenarios[0].id)
  }, [scenarios, defaultScenarioId])

  const selectedScenario = scenarios.find(s => s.id === defaultScenarioId)

  const ingestFile = async (f) => {
    setError(null)
    if (!f) return
    if (!/\.csv$/i.test(f.name) && f.type !== 'text/csv' && f.type !== 'application/vnd.ms-excel') {
      setError(`Not a CSV file: ${f.name}`); return
    }
    const text = await f.text()
    const parsed = csvToObjects(text)
    if (!parsed.length) { setError('No rows parsed. Check CSV header row.'); return }
    setRows(parsed)
  }
  const handleFile  = (e) => ingestFile(e.target.files?.[0])
  const onDragOver  = (e) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'; setDragging(true) }
  const onDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setDragging(false) }
  const onDrop      = (e) => { e.preventDefault(); e.stopPropagation(); setDragging(false); const f = e.dataTransfer?.files?.[0]; if (f) ingestFile(f) }
  const clearRows   = () => { setRows([]); if (fileRef.current) fileRef.current.value = '' }

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'bulk_call_sample.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const validRows = rows.map(r => ({ ...r, _err: validateRow(r) })).map(r => {
    // If row has inline scenario text → OK. Else needs default scenario_id selected.
    if (!r.scenario && !defaultScenarioId) return { ...r, _err: r._err || 'no scenario (pick a default above)' }
    return r
  })
  const okCount  = validRows.filter(r => !r._err).length
  const errCount = validRows.length - okCount

  const submit = async () => {
    setError(null); setSubmitting(true); setProgress(null); setRunId(null)
    try {
      const payload = {
        rows: validRows.filter(r => !r._err).map(r => ({
          name: r.name, email: r.email, phone: r.phone,
          // Inline row scenario takes priority; otherwise backend uses default_scenario_id
          ...(r.scenario ? { scenario: r.scenario } : {}),
        })),
        default_scenario_id: defaultScenarioId,
        delay_ms: delayMs,
        max_concurrent: maxConcur,
        gender,
      }
      if (!payload.rows.length) throw new Error('No valid rows to dial')
      if (!defaultScenarioId)  throw new Error('Pick a default scenario first')
      const data = await apiFetch('/bulk_call', { method: 'POST', body: payload })
      if (data.status !== 'started' && !data.run_id) throw new Error(data.error || 'Failed to start')
      setRunId(data.run_id)
    } catch (e) {
      setError(e.body?.detail || e.body?.error || e.message || 'Failed')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (!runId) return
    let active = true
    const tick = async () => {
      try {
        const d = await apiFetch(`/bulk_call/${runId}`)
        if (active) setProgress(d)
        if (d.done) return
      } catch {}
      if (active) setTimeout(tick, 2000)
    }
    tick()
    return () => { active = false }
  }, [runId])

  return (
    <div className={embedded
      ? "w-full space-y-6"
      : "w-full px-4 sm:px-6 py-8 space-y-6 max-w-5xl mx-auto"}>
      {/* Heading — hidden when embedded inside /call page (CallPage already has its own heading) */}
      {!embedded && (
        <div className="flex items-start gap-3 flex-wrap">
          <Button variant="ghost" size="icon" asChild className="mt-0.5">
            <Link to="/admin/calls"><ArrowLeft className="size-4" /></Link>
          </Button>
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Bulk Call</h1>
            <p className="text-sm text-[var(--color-fg-muted)] mt-1">Upload CSV → dial everyone in parallel.</p>
          </div>
        </div>
      )}

      {/* CSV upload */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="size-5 text-[var(--color-accent)]" /> CSV File
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={downloadSample}>
            <Download className="size-3.5" /> Sample CSV
          </Button>
        </CardHeader>
        <CardContent>
          <label
            onDragEnter={onDragOver}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition ${
              dragging
                ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                : 'border-[var(--color-border-strong)] bg-[var(--color-bg-muted)] hover:border-[var(--color-accent)]'
            }`}
          >
            <Upload className={`size-8 mb-2 transition ${dragging ? 'text-[var(--color-accent)]' : 'text-[var(--color-fg-subtle)]'}`} />
            <p className="text-[var(--color-fg)] text-sm font-medium pointer-events-none">
              {dragging ? 'Drop CSV here' : 'Click to upload or drop CSV'}
            </p>
            <p className="text-xs text-[var(--color-fg-subtle)] mt-1 pointer-events-none">
              Columns: name, email, phone, scenario (optional)
            </p>
            <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleFile} className="hidden" />
          </label>

          {rows.length > 0 && (
            <div className="mt-4 flex items-center gap-3 text-sm">
              <span className="text-emerald-500">{okCount} ready</span>
              {errCount > 0 && <span className="text-red-500">· {errCount} invalid</span>}
              <Button variant="ghost" size="sm" onClick={clearRows} className="ml-auto">
                <Trash2 className="size-3.5" /> Clear
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview table */}
      {rows.length > 0 && (
        <Card>
          <CardContent className="p-0 overflow-hidden">
            <div className="max-h-[300px] overflow-y-auto no-scrollbar">
              <table className="w-full text-sm">
                <thead className="bg-[var(--color-bg-muted)] sticky top-0">
                  <tr className="text-left text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
                    <th className="px-4 py-2">#</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Phone</th>
                    <th className="px-4 py-2">Scenario</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {validRows.map((r, i) => (
                    <tr key={i} className="border-t border-[var(--color-border)]">
                      <td className="px-4 py-2 text-[var(--color-fg-subtle)]">{i + 1}</td>
                      <td className="px-4 py-2 text-[var(--color-fg)]">{r.name || '—'}</td>
                      <td className="px-4 py-2 text-[var(--color-fg-muted)]">{r.email || '—'}</td>
                      <td className="px-4 py-2 text-[var(--color-fg-muted)]">{r.phone || '—'}</td>
                      <td className="px-4 py-2 text-[var(--color-fg-muted)] max-w-xs truncate">
                        {r.scenario || <em className="text-[var(--color-fg-subtle)]">default</em>}
                      </td>
                      <td className="px-4 py-2">
                        {r._err
                          ? <span className="text-red-500 text-xs">{r._err}</span>
                          : <span className="text-emerald-500 text-xs">ready</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Default Scenario</label>
              <Button type="button" variant="ghost" size="sm" onClick={() => setScenarioModalOpen(true)}>
                <Plus className="size-3.5" /> New Scenario
              </Button>
            </div>
            {loadingScenarios ? (
              <div className="flex items-center gap-2 text-sm text-[var(--color-fg-muted)] py-2">
                <Loader2 className="size-4 animate-spin" /> Loading scenarios…
              </div>
            ) : scenariosError ? (
              <p className="text-sm text-red-500">{String(scenariosError)}</p>
            ) : scenarios.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[var(--color-border-strong)] p-4 text-center">
                <p className="text-sm text-[var(--color-fg-muted)]">No scenarios yet.</p>
                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => setScenarioModalOpen(true)}>
                  <Plus className="size-3.5" /> Create first scenario
                </Button>
              </div>
            ) : (
              <>
                <Select
                  value={defaultScenarioId}
                  onChange={e => setDefaultScenarioId(e.target.value)}
                >
                  {scenarios.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.is_private ? '🔒 ' : ''}{s.title}
                    </option>
                  ))}
                </Select>
                {selectedScenario?.summary && (
                  <p className="text-xs text-[var(--color-fg-muted)] mt-2 leading-relaxed">
                    {selectedScenario.is_private && <Lock className="inline size-3 text-[var(--color-accent)] mr-1 align-[-2px]" />}
                    {selectedScenario.summary}
                  </p>
                )}
                <p className="text-xs text-[var(--color-fg-subtle)] mt-1.5">
                  Used when a CSV row leaves the <code className="text-[var(--color-fg-muted)]">scenario</code> column blank.
                </p>
              </>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Delay between dials: {(delayMs / 1000).toFixed(1)}s
              </label>
              <input
                type="range" min={1000} max={15000} step={500} value={delayMs}
                onChange={e => setDelayMs(Number(e.target.value))}
                className="w-full accent-[var(--color-accent)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Max concurrent calls: {maxConcur}
              </label>
              <input
                type="range" min={1} max={10} step={1} value={maxConcur}
                onChange={e => setMaxConcur(Number(e.target.value))}
                className="w-full accent-[var(--color-accent)]"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Agent voice</label>
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
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-red-500/40 bg-red-500/10">
          <CardContent className="pt-5 flex gap-3">
            <AlertCircle className="size-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-red-500 text-sm">{error}</div>
          </CardContent>
        </Card>
      )}

      {/* Submit */}
      {!runId && (
        <Button
          onClick={submit}
          disabled={submitting || okCount === 0}
          variant="gradient"
          size="lg"
          className="w-full"
        >
          {submitting
            ? <><Loader2 className="size-5 animate-spin" /> Starting…</>
            : <><Play className="size-5" /> Dial {okCount} {okCount === 1 ? 'Call' : 'Calls'}</>}
        </Button>
      )}

      {/* Progress */}
      {runId && progress && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="size-5 text-[var(--color-accent)]" />
              Bulk Run Progress
            </CardTitle>
            {progress.done
              ? <span className="text-emerald-500 text-sm flex items-center gap-1"><CheckCircle2 className="size-4" /> Done</span>
              : <span className="text-[var(--color-accent)] text-sm flex items-center gap-1"><Loader2 className="size-4 animate-spin" /> Running</span>}
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-[var(--color-fg-subtle)] mb-1">
                <span>{progress.succeeded + progress.failed} / {progress.total}</span>
                <span>{progress.succeeded} dialed · {progress.failed} failed</span>
              </div>
              <div className="w-full h-2 bg-[var(--color-bg-muted)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--color-accent)] transition-all"
                  style={{ width: `${progress.total ? ((progress.succeeded + progress.failed) / progress.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="max-h-[260px] overflow-y-auto no-scrollbar space-y-1.5">
              {progress.results.map((r, i) => (
                <div key={i} className="flex items-center gap-3 text-xs bg-[var(--color-bg-muted)] rounded-md px-3 py-2">
                  <span className="text-[var(--color-fg-subtle)] w-6">{r.idx + 1}</span>
                  <span className="text-[var(--color-fg)] flex-1 truncate">{r.name} · {r.phone}</span>
                  {r.status === 'dialed'  && <span className="text-emerald-500">✓ dialed</span>}
                  {r.status === 'failed'  && <span className="text-red-500">✗ {r.error}</span>}
                  {r.status === 'skipped' && <span className="text-amber-500">skipped</span>}
                </div>
              ))}
            </div>

            {progress.done && (
              <Button variant="outline" className="w-full" onClick={() => navigate('/admin/calls')}>
                View calls in dashboard
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <ScenarioCreateDialog
        open={scenarioModalOpen}
        onOpenChange={setScenarioModalOpen}
        onCreated={async (created) => {
          await reloadScenarios()
          if (created?.id) setDefaultScenarioId(created.id)
        }}
      />
    </div>
  )
}
