import { useEffect, useRef } from 'react'

/**
 * Cursor-tracked radial-gradient spotlight overlay. Renders a soft glow
 * that follows the mouse with LERP damping for a "viscous" professional
 * feel — heavy and intentional rather than twitchy.
 *
 * Theme-aware: reads `--color-accent` from CSS vars so the glow tints
 * cyan in dark mode and deep indigo in light mode. Pointer-events: none
 * so cards/buttons under it remain interactive.
 *
 * Combine with NeuralSubstrate: spotlight is the *light source*, neural
 * particles are the *substrate it illuminates*.
 */
export default function CursorSpotlight({
  radius           = 360,           // soft inner radius in px
  intensityDark    = 0.18,          // 0..1 alpha at center for dark mode
  intensityLight   = 0.12,          // 0..1 alpha at center for light mode
  className        = '',
}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Start centered (so first appearance isn't a hard jump from top-left)
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const pos    = { x: target.x, y: target.y }
    let raf = 0
    let active = true

    function readAccent() {
      return getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#00f2ff'
    }
    function readIsDark() {
      return document.documentElement.getAttribute('data-theme') === 'dark'
    }

    let accent = readAccent()
    let isDark = readIsDark()

    function hexToRgb(hex) {
      const m = hex.replace('#', '')
      if (m.length === 3) {
        return [parseInt(m[0]+m[0],16), parseInt(m[1]+m[1],16), parseInt(m[2]+m[2],16)]
      }
      return [parseInt(m.slice(0,2),16), parseInt(m.slice(2,4),16), parseInt(m.slice(4,6),16)]
    }

    function paint() {
      const [r, g, b] = hexToRgb(accent)
      const a1 = isDark ? intensityDark : intensityLight
      // Two-stop radial: bright core fades to transparent. Soft secondary
      // tint stop adds extra warmth without harsh edge.
      el.style.background = `radial-gradient(${radius}px circle at ${pos.x}px ${pos.y}px,` +
        ` rgba(${r},${g},${b},${a1}) 0%,` +
        ` rgba(${r},${g},${b},${a1 * 0.45}) 30%,` +
        ` rgba(${r},${g},${b},0) 70%)`
    }

    function tick() {
      if (!active) return
      // LERP — viscous follow. 0.08 = noticeably "heavy", not twitchy.
      pos.x += (target.x - pos.x) * 0.08
      pos.y += (target.y - pos.y) * 0.08
      paint()
      raf = requestAnimationFrame(tick)
    }

    function onMove(e) {
      target.x = e.clientX
      target.y = e.clientY
    }
    function onLeave() {
      // Drift to screen center on mouse leave so spotlight doesn't get stuck at edge
      target.x = window.innerWidth / 2
      target.y = window.innerHeight / 2
    }
    function onTouch(e) {
      const t = e.touches[0]
      if (t) { target.x = t.clientX; target.y = t.clientY }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onMove, { passive: true })
    window.addEventListener('mouseleave',  onLeave)
    window.addEventListener('touchmove',   onTouch, { passive: true })

    // Theme switch live
    const themeObs = new MutationObserver(() => {
      accent = readAccent()
      isDark = readIsDark()
    })
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    if (reduced) {
      paint()   // single static frame
    } else {
      raf = requestAnimationFrame(tick)
    }

    return () => {
      active = false
      cancelAnimationFrame(raf)
      themeObs.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onMove)
      window.removeEventListener('mouseleave',  onLeave)
      window.removeEventListener('touchmove',   onTouch)
    }
  }, [radius, intensityDark, intensityLight])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 transition-opacity duration-500 ${className}`}
    />
  )
}
