import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  PhoneCall, Globe, ShieldCheck, Zap, Languages, Headphones, Users,
  ArrowRight, BarChart3, MessageSquare, TrendingUp, FlaskConical,
} from 'lucide-react'

import Typewriter from '@/components/Typewriter'
import DemoCallModal from '@/components/DemoCallModal'
import ContactForm from '@/components/ContactForm'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { COMPANY } from '@/config'

const HERO_PHRASES = [
  'real-time voice agents.',
  'multilingual conversations.',
  'outbound sales at scale.',
  'sub-second response times.',
]

const FEATURES = [
  { Icon: Zap,         title: 'Instant Interruption Detection', desc: 'The agent senses the moment a caller speaks over it and yields mid-sentence — no awkward overlap, just a natural back-and-forth.' },
  { Icon: Languages,   title: 'Mid-Call Language Switching',    desc: 'Seamlessly flips between languages within the same call, matching whatever the caller speaks — no menus, no restarts.' },
  { Icon: Headphones,  title: 'Human-Like Ambience',           desc: 'Subtle background ambience and natural pacing make every call feel like a real person on the line — warm, believable, never robotic.' },
  { Icon: BarChart3,   title: 'Conversation Intelligence',     desc: 'Every session recorded, transcribed and auto-summarized. Structured post-call insights without manual review.' },
  { Icon: Users,       title: 'Multi-Tenant Role System',      desc: 'Client admins see only their own dashboards while you keep org-wide visibility — many teams, one secure platform.' },
  { Icon: Globe,       title: 'Parallel Multi-Language Handling', desc: 'Handle thousands of active calls at once across dozens of languages worldwide — scale far beyond what human teams can.' },
]

const PILLS = [
  { Icon: MessageSquare, label: 'Smarter Conversations' },
  { Icon: TrendingUp,    label: 'Built for Scale' },
  { Icon: ShieldCheck,   label: 'Secure. Reliable. Always On.' },
]

export default function LandingPage() {
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden w-full px-4 sm:px-6">
        <div className="pt-8 lg:pt-12 pb-20 lg:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mx-auto"
          >
            <span className="my-8 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-fg-muted)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent)]" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-accent)]" />
              </span>
              Voice AI by {COMPANY.name}
            </span>

            {/* Two-line hero — line 1 bold solid, line 2 gradient typewriter.
                Wraps on mobile; stays single-line on desktop (lg+, unchanged). */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.12]">
              <span className="block whitespace-normal lg:whitespace-nowrap break-words text-[var(--color-fg)]">The AI-Powered voice layer for</span>
              <span className="block mb-6 text-gradient-shimmer">
                <Typewriter phrases={HERO_PHRASES} />
              </span>
            </h1>

            <p className="mt-6 mx-auto text-base lg:text-lg leading-relaxed text-[var(--color-fg-muted)] max-w-2xl">
              {COMPANY.name} powers human-grade phone conversations at machine scale.
              Place a free demo call right now — no signup required.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button variant="gradient" size="lg" onClick={() => setDemoOpen(true)}>
                <PhoneCall className="size-4" />
                Try Demo Call
                <ArrowRight className="size-4" />
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/simulator">
                  <FlaskConical className="size-4" />
                  Explore the Simulator
                </Link>
              </Button>
            </div>

            <p className="mt-6 text-xs text-[var(--color-fg-subtle)]">
              Free demo — 3 calls per email per 24 hours. No card required.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Feature bento ─────────────────────────────────────────────── */}
      <section id="features" className="relative w-full px-4 sm:px-6 py-20 lg:py-28 scroll-mt-20">
        <div className="text-center mx-auto max-w-2xl mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Built for the next generation of enterprise.
          </h2>
          <p className="mt-4 text-base lg:text-lg text-[var(--color-fg-muted)] leading-relaxed">
            Everything you need to run human-grade phone conversations at global scale.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {FEATURES.map(({ Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.45, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card className="h-full hover:border-[var(--color-accent)] hover:shadow-xl hover:shadow-[var(--color-accent-soft)] transition-all">
                <CardHeader>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                      <Icon className="size-5" />
                    </div>
                    <span className="font-display text-sm font-bold tabular-nums text-[var(--color-fg-subtle)]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">{desc}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust pills */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 max-w-7xl mx-auto">
          {PILLS.map(({ Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium text-[var(--color-fg-muted)]"
            >
              <Icon className="size-4 text-[var(--color-accent)]" />
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* ── Contact Us ────────────────────────────────────────────────── */}
      <section id="contact" className="relative w-full px-4 sm:px-6 py-20 lg:py-28 scroll-mt-20">
        <div className="text-center mx-auto max-w-2xl mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Contact Us
          </h2>
          <p className="mt-4 text-base lg:text-lg text-[var(--color-fg-muted)] leading-relaxed">
            Tell us what you need — our team will get back to you shortly.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl"
        >
          <Card className="glass-strong shadow-2xl overflow-hidden">
            <CardContent className="pt-7">
              <ContactForm />
            </CardContent>
          </Card>
        </motion.div>
      </section>

      <DemoCallModal open={demoOpen} onOpenChange={setDemoOpen} />
    </>
  )
}
