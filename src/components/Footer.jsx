import { Link } from 'react-router-dom'
import { Mail, Linkedin } from 'lucide-react'
import Logo from '@/components/Logo'
import { COMPANY } from '@/config'

const CONTACT_EMAIL = 'admin@fristinetech.com'
const LINKEDIN_URL  = 'https://www.linkedin.com/company/fristine-infotech'

/**
 * Footer — semi-transparent muted with a top border. Logo only (no brand
 * text) on the left, social/contact icons on the right; stacks vertically on
 * mobile. Centered copyright bar below, separated by a top border.
 */
export default function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-[var(--color-border)] glass">
      <div className="w-full px-4 sm:px-6 py-12">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Left — logo only */}
          <Link to="/" className="inline-flex items-center" aria-label={COMPANY.name}>
            <Logo className="h-8 w-auto object-contain" />
          </Link>

          {/* Right — social / contact icons */}
          <div className="flex items-center gap-2">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              aria-label="Email"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-fg-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-fg)]"
            >
              <Mail className="size-4" />
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-fg-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-fg)]"
            >
              <Linkedin className="size-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--color-border)] py-5 text-center text-xs text-[var(--color-fg-subtle)]">
        © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
      </div>
    </footer>
  )
}
