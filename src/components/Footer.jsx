import { Link } from 'react-router-dom'
import Logo from '@/components/Logo'
import { COMPANY } from '@/config'

export default function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-[var(--color-border)] glass">
      <div className="w-full px-4 sm:px-6 py-12">
        <Link to="/" className="inline-flex items-center" aria-label={COMPANY.name}>
          <Logo className="h-10 w-auto object-contain" />
        </Link>
        <p className="mt-4 max-w-md text-sm text-[var(--color-fg-muted)] leading-relaxed">
          {COMPANY.tagline}
        </p>
      </div>

      <div className="border-t border-[var(--color-border)] py-5 text-center text-xs text-[var(--color-fg-subtle)]">
        © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
      </div>
    </footer>
  )
}
