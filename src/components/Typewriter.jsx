import { useEffect, useState, useMemo } from 'react'

/**
 * Typewriter — cycles `phrases`, types char-by-char, holds, then erases.
 * Reserves width = longest phrase via CSS grid stack so layout never reflows.
 *
 * No caret. Speeds jitter slightly so typing feels human, not metronomic.
 *
 * Descender fix: wrapper has explicit line-height 1.2 + pb-[0.15em] so
 * 'g', 'j', 'p', 'q', 'y' tails don't get clipped by ancestor leading.
 */
export default function Typewriter({
  phrases     = [],
  typeSpeed   = 60,
  deleteSpeed = 32,
  holdMs      = 1400,
  className   = '',
}) {
  const [idx,   setIdx]   = useState(0)
  const [text,  setText]  = useState('')
  const [phase, setPhase] = useState('typing')

  const longest = useMemo(
    () => phrases.reduce((a, b) => (b.length > a.length ? b : a), ''),
    [phrases]
  )

  useEffect(() => {
    if (phrases.length === 0) return
    const full = phrases[idx % phrases.length]
    // Slight per-char jitter for natural feel (±25%)
    const jitter = (base) => base * (0.85 + Math.random() * 0.3)
    let t
    if (phase === 'typing') {
      if (text.length < full.length) {
        t = setTimeout(() => setText(full.slice(0, text.length + 1)), jitter(typeSpeed))
      } else {
        t = setTimeout(() => setPhase('deleting'), holdMs)
      }
    } else if (phase === 'deleting') {
      if (text.length > 0) {
        t = setTimeout(() => setText(full.slice(0, text.length - 1)), jitter(deleteSpeed))
      } else {
        setIdx(i => (i + 1) % phrases.length)
        setPhase('typing')
      }
    }
    return () => t && clearTimeout(t)
  }, [text, phase, idx, phrases, typeSpeed, deleteSpeed, holdMs])

  return (
    <span
      className={`inline-grid whitespace-nowrap pb-[0.15em] ${className}`}
      style={{ gridTemplateAreas: '"a"', gridTemplateColumns: 'auto', lineHeight: 1.2 }}
    >
      {/* placeholder reserves width = longest phrase */}
      <span aria-hidden className="invisible select-none" style={{ gridArea: 'a' }}>
        {longest}
      </span>
      {/* live text — inherits parent gradient/color since not absolutely positioned */}
      <span style={{ gridArea: 'a' }}>{text}</span>
    </span>
  )
}
