import { useEffect, useRef } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

/**
 * Full-bleed animated background. Particle network + cursor reveal +
 * synaptic pulses. Pulled colour from CSS vars so it follows theme.
 *
 *  - DPR-aware resize (sharp on retina)
 *  - LERP-damped cursor (viscous, intentional feel)
 *  - Connections fade by distance from cursor
 *  - Random pulses travel between connected nodes
 *  - prefers-reduced-motion → renders one static frame only
 */
export default function NeuralSubstrate({ density = 0.00009, className = '' }) {
  const ref     = useRef(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf = 0
    let nodes = []
    let pulses = []
    const cursor = { x: 0, y: 0, lerpX: 0, lerpY: 0, active: false }
    const REVEAL = 480
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    function readColors() {
      const cs = getComputedStyle(document.documentElement)
      return {
        accent: cs.getPropertyValue('--color-accent').trim() || '#00f2ff',
        fg:     cs.getPropertyValue('--color-fg-subtle').trim() || '#94a3b8',
      }
    }
    let palette = readColors()

    function resize() {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      canvas.width  = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const target = Math.max(30, Math.floor(w * h * density))
      nodes = Array.from({ length: target }, () => ({
        x:  Math.random() * w,
        y:  Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r:  Math.random() * 1.4 + 0.6,
      }))
      pulses = []
    }
    resize()
    const ro = new ResizeObserver(resize); ro.observe(canvas)

    function onMove(e) {
      const r = canvas.getBoundingClientRect()
      cursor.x = e.clientX - r.left
      cursor.y = e.clientY - r.top
      cursor.active = true
    }
    function onLeave() { cursor.active = false }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerdown', onMove)
    window.addEventListener('pointerleave', onLeave)

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function spawnPulse() {
      if (pulses.length > 14 || nodes.length < 2) return
      const a = nodes[Math.floor(Math.random() * nodes.length)]
      // Find nearest neighbor
      let best = null, bd = Infinity
      for (const n of nodes) {
        if (n === a) continue
        const d = (n.x - a.x) ** 2 + (n.y - a.y) ** 2
        if (d < bd) { bd = d; best = n }
      }
      if (!best || bd > 38000) return
      pulses.push({ a, b: best, t: 0, dur: 700 + Math.random() * 600 })
    }
    const pulseTimer = setInterval(spawnPulse, 350)

    let last = performance.now()
    function frame(now) {
      const dt = now - last; last = now
      // LERP cursor — viscous follow
      cursor.lerpX += (cursor.x - cursor.lerpX) * 0.06
      cursor.lerpY += (cursor.y - cursor.lerpY) * 0.06

      const w = canvas.clientWidth, h = canvas.clientHeight
      ctx.clearRect(0, 0, w, h)

      // Move nodes
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy
        if (n.x < 0 || n.x > w) n.vx *= -1
        if (n.y < 0 || n.y > h) n.vy *= -1
      }

      // Draw connections — opacity decays with distance, brightens near cursor
      const MAX_DIST  = 130
      const MAX_DIST2 = MAX_DIST * MAX_DIST
      ctx.lineWidth = 1
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 > MAX_DIST2) continue
          const d = Math.sqrt(d2)
          let alpha = 1 - d / MAX_DIST
          // Cursor reveal boost
          if (cursor.active) {
            const mx = (a.x + b.x) / 2 - cursor.lerpX
            const my = (a.y + b.y) / 2 - cursor.lerpY
            const md = Math.sqrt(mx * mx + my * my)
            if (md < REVEAL) alpha *= 1 + (1 - md / REVEAL) * 2.2
          }
          alpha = Math.min(0.55, alpha * 0.35)
          ctx.strokeStyle = `${palette.accent}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }

      // Draw nodes
      for (const n of nodes) {
        let glow = 0
        if (cursor.active) {
          const dx = n.x - cursor.lerpX, dy = n.y - cursor.lerpY
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < REVEAL) glow = (1 - d / REVEAL)
        }
        ctx.fillStyle = `${palette.accent}${Math.floor((0.35 + glow * 0.6) * 255).toString(16).padStart(2, '0')}`
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r + glow * 1.4, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i]
        p.t += dt
        const k = Math.min(1, p.t / p.dur)
        if (k >= 1) { pulses.splice(i, 1); continue }
        const x = p.a.x + (p.b.x - p.a.x) * k
        const y = p.a.y + (p.b.y - p.a.y) * k
        ctx.fillStyle = palette.accent
        ctx.shadowColor = palette.accent
        ctx.shadowBlur = 12
        ctx.beginPath()
        ctx.arc(x, y, 2.2, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }

      if (!reduced) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    const themeObs = new MutationObserver(() => { palette = readColors() })
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    return () => {
      cancelAnimationFrame(raf)
      clearInterval(pulseTimer)
      ro.disconnect()
      themeObs.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onMove)
      window.removeEventListener('pointerleave', onLeave)
    }
  }, [theme, density])

  return (
    <canvas
      ref={ref}
      className={`neural-substrate pointer-events-none fixed inset-0 z-0 h-full w-full opacity-80 ${className}`}
      aria-hidden="true"
    />
  )
}
