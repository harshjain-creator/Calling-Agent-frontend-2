/**
 * Styled <select> replacement. Tailwind-only — no Radix dependency to keep
 * bundle small. Adds custom chevron, matches Input.jsx visual weight,
 * supports dark + light tokens via var(--color-*).
 *
 * Usage:
 *   <Select value={x} onChange={e => setX(e.target.value)}>
 *     <option value="a">A</option>
 *   </Select>
 *
 * Drop-in for any native <select>.
 */
import { ChevronDown } from 'lucide-react'

export function Select({ className = '', children, ...props }) {
  return (
    <div className="relative">
      <select
        {...props}
        className={
          'w-full appearance-none rounded-lg border border-[var(--color-border)] ' +
          'bg-[var(--color-bg)] text-[var(--color-fg)] ' +
          'px-3 py-2.5 pr-10 text-sm leading-tight ' +
          'transition-colors ' +
          'hover:border-[var(--color-fg-subtle)] ' +
          'focus:outline-none focus:border-[var(--color-accent)] ' +
          'focus:ring-2 focus:ring-[var(--color-accent)]/30 ' +
          'disabled:opacity-50 disabled:cursor-not-allowed ' +
          className
        }
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-fg-subtle)]" />
    </div>
  )
}
