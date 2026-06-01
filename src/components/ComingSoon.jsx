import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Construction, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ComingSoon({ title, subtitle = '' }) {
  return (
    <section className="relative w-full px-4 py-24 lg:py-32 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] mb-5">
          <Construction className="size-6" />
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]">Coming soon</p>
        {subtitle && (
          <p className="mt-4 max-w-xl mx-auto text-sm text-[var(--color-fg-muted)] leading-relaxed">{subtitle}</p>
        )}
        <Button variant="outline" size="default" asChild className="mt-7">
          <Link to="/">
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>
        </Button>
      </motion.div>
    </section>
  )
}
