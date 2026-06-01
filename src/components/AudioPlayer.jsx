import { useEffect, useRef, useState } from 'react'
import { Play, Pause, Volume2, Download, Trash2, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function fmt(s) {
  if (!isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

export default function AudioPlayer({ src, filename = 'call-recording.wav', onDelete }) {
  const ref = useRef(null)
  const [playing,     setPlaying]     = useState(false)
  const [cur,         setCur]         = useState(0)
  const [dur,         setDur]         = useState(0)
  const [vol,         setVol]         = useState(1)
  const [err,         setErr]         = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [deleting,    setDeleting]    = useState(false)

  async function handleDelete() {
    if (!onDelete) return
    if (!confirm('Delete this recording permanently? This cannot be undone.')) return
    setDeleting(true)
    try {
      await onDelete()
    } finally {
      setDeleting(false)
    }
  }

  /**
   * Download recording. Fetch as blob first → object URL → anchor click.
   * Avoids relying on `download` attr cross-origin (Supabase signed URLs
   * don't set Content-Disposition by default).
   */
  async function handleDownload() {
    if (!src) return
    setDownloading(true)
    try {
      const r = await fetch(src)
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const blob = await r.blob()
      const url  = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      // Revoke after short delay (Safari needs the URL alive briefly)
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (e) {
      // Fallback: direct link
      window.open(src, '_blank', 'noopener')
    } finally {
      setDownloading(false)
    }
  }

  useEffect(() => {
    const a = ref.current
    if (!a) return
    const onTime = () => setCur(a.currentTime)
    const onMeta = () => setDur(a.duration)
    const onEnd  = () => setPlaying(false)
    const onErr  = () => setErr(true)
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('loadedmetadata', onMeta)
    a.addEventListener('ended', onEnd)
    a.addEventListener('error', onErr)
    return () => {
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('loadedmetadata', onMeta)
      a.removeEventListener('ended', onEnd)
      a.removeEventListener('error', onErr)
    }
  }, [src])

  const toggle = () => {
    const a = ref.current
    if (!a) return
    if (playing) { a.pause(); setPlaying(false) }
    else { a.play(); setPlaying(true) }
  }
  const seek = e => {
    const a = ref.current
    if (!a) return
    a.currentTime = Number(e.target.value)
    setCur(a.currentTime)
  }
  const changeVol = e => {
    const a = ref.current
    if (!a) return
    a.volume = Number(e.target.value)
    setVol(a.volume)
  }

  if (!src) {
    return (
      <Card>
        <CardContent className="pt-6 text-[var(--color-fg-muted)] text-sm">
          No recording available for this call.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <audio ref={ref} src={src} preload="metadata" />
        {err ? (
          <div className="text-red-500 text-sm">Failed to load recording. Signed URL may have expired.</div>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <button
                onClick={toggle}
                className="h-12 w-12 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-[var(--color-accent-soft)]"
              >
                {playing ? <Pause className="size-5" /> : <Play className="size-5 ml-0.5" />}
              </button>
              <div className="flex-1 flex items-center gap-3 min-w-0">
                <span className="text-[var(--color-fg-muted)] text-sm tabular-nums w-12">{fmt(cur)}</span>
                <input
                  type="range" min={0} max={dur || 0} value={cur} step="0.1"
                  onChange={seek}
                  className="flex-1 accent-[var(--color-accent)]"
                />
                <span className="text-[var(--color-fg-muted)] text-sm tabular-nums w-12 text-right">{fmt(dur)}</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 w-32">
                <Volume2 className="size-4 text-[var(--color-fg-subtle)]" />
                <input
                  type="range" min={0} max={1} step="0.05" value={vol}
                  onChange={changeVol}
                  className="flex-1 accent-[var(--color-accent)]"
                />
              </div>
              <Button
                variant="outline" size="icon"
                onClick={handleDownload}
                disabled={downloading}
                aria-label="Download recording"
                title="Download recording"
              >
                <Download className={`size-4 ${downloading ? 'animate-pulse' : ''}`} />
              </Button>
              {onDelete && (
                <Button
                  variant="outline" size="icon"
                  onClick={handleDelete}
                  disabled={deleting}
                  aria-label="Delete recording"
                  title="Delete recording"
                  className="text-red-500 hover:bg-red-500/10 hover:border-red-500/40"
                >
                  {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                </Button>
              )}
            </div>
            <p className="text-xs text-[var(--color-fg-subtle)] mt-3">
              Stereo recording — caller on left channel, agent on right.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
