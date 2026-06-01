import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Loader2, CheckCircle2, Send, User, Mail, Phone,
  ChevronDown, Search, Globe,
} from 'lucide-react'

import emailjs from '@emailjs/browser'

import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/lib/api'
import { COUNTRIES } from '@/lib/countries'

// EmailJS config — set in frontend .env (VITE_*). If unset, email step is
// skipped (DB insert still happens).
const EMAILJS = {
  serviceId:  import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
  publicKey:  import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
}

const DEFAULT_COUNTRY = COUNTRIES.find(c => c.iso2 === 'IN') || COUNTRIES[0]

/**
 * ContactForm — body-only Contact-Us form. Reused by the /contact page.
 * Collects name, email, country (searchable dropdown that auto-fills the
 * dial code), phone, and a message. POSTs to /contact (no auth).
 *
 * Props:
 *   onSuccess(data) — optional callback after a successful POST /contact
 */
export default function ContactForm({ onSuccess } = {}) {
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [country, setCountry] = useState(DEFAULT_COUNTRY)
  const [phone,   setPhone]   = useState('')
  const [message, setMessage] = useState('')

  const [pickerOpen, setPickerOpen] = useState(false)
  const [query,      setQuery]      = useState('')
  const pickerRef = useRef(null)

  const [pending, setPending] = useState(false)
  const [success, setSuccess] = useState(false)

  // Close the country dropdown on outside-click / Escape.
  useEffect(() => {
    if (!pickerOpen) return
    const onClick = (e) => { if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false) }
    const onKey   = (e) => { if (e.key === 'Escape') setPickerOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey) }
  }, [pickerOpen])

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) || c.dial.includes(query)
  )

  async function handleSubmit(e) {
    e.preventDefault()
    setPending(true); setSuccess(false)
    const fullPhone = `${country.dial} ${phone.trim()}`.trim()

    // 1) Persist to backend (contactus table). Best-effort.
    const data = await apiFetch('/contact', {
      method: 'POST', skipAuth: true,
      body: {
        name:         name.trim(),
        email:        email.trim(),
        country:      country.name,
        country_code: country.dial,
        phone:        phone.trim(),
        message:      message.trim(),
      },
    }).catch(() => null)

    // 2) Notification email via EmailJS — best-effort, never blocks the form.
    if (EMAILJS.serviceId && EMAILJS.templateId && EMAILJS.publicKey) {
      try {
        await emailjs.send(
          EMAILJS.serviceId,
          EMAILJS.templateId,
          {
            name:         name.trim(),
            email:        email.trim(),
            country:      country.name,
            country_code: country.dial,
            phone:        fullPhone,
            message:      message.trim() || '—',
          },
          { publicKey: EMAILJS.publicKey },
        )
      } catch { /* notification failure shouldn't fail the submission */ }
    }

    setSuccess(true)
    onSuccess?.(data)
    setPending(false)
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="text-center py-10"
      >
        <CheckCircle2 className="size-12 mx-auto mb-4 text-emerald-500" />
        <h3 className="font-display text-2xl font-semibold">Message sent!</h3>
        <p className="mt-2 text-base text-[var(--color-fg-muted)]">
          Thanks for reaching out. Our team will get back to you shortly.
        </p>
        <Button
          variant="outline" size="default" className="mt-6"
          onClick={() => { setSuccess(false); setName(''); setEmail(''); setPhone(''); setMessage('') }}
        >
          Send another
        </Button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ct-name">Your name</Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--color-fg-subtle)]" />
            <Input id="ct-name" placeholder="Rahul Sharma" value={name} onChange={e => setName(e.target.value)} required className="pl-10" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ct-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--color-fg-subtle)]" />
            <Input id="ct-email" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required className="pl-10" />
          </div>
        </div>
      </div>

      {/* Country — searchable dropdown that drives the dial code */}
      <div className="space-y-2">
        <Label>Country</Label>
        <div className="relative" ref={pickerRef}>
          <button
            type="button"
            onClick={() => { setPickerOpen(o => !o); setQuery('') }}
            className="flex h-11 w-full items-center gap-2 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-4 text-sm transition-colors hover:border-[var(--color-fg-subtle)]"
          >
            <Globe className="size-4 text-[var(--color-fg-subtle)]" />
            <span className="flex-1 text-left">{country.name}</span>
            <span className="text-[var(--color-fg-muted)] tabular-nums">{country.dial}</span>
            <ChevronDown className={`size-4 text-[var(--color-fg-subtle)] transition-transform ${pickerOpen ? 'rotate-180' : ''}`} />
          </button>

          {pickerOpen && (
            <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] shadow-2xl">
              <div className="relative border-b border-[var(--color-border)] p-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[var(--color-fg-subtle)]" />
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search country…"
                  className="h-9 w-full rounded-lg bg-transparent pl-9 pr-3 text-sm outline-none placeholder:text-[var(--color-fg-subtle)]"
                />
              </div>
              <ul className="max-h-60 overflow-y-auto py-1">
                {filtered.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-[var(--color-fg-subtle)]">No match</li>
                ) : filtered.map(c => (
                  <li key={c.iso2}>
                    <button
                      type="button"
                      onClick={() => { setCountry(c); setPickerOpen(false) }}
                      className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors hover:bg-[var(--color-bg-muted)] ${
                        c.iso2 === country.iso2 ? 'text-[var(--color-accent)]' : ''
                      }`}
                    >
                      <span className="flex-1">{c.name}</span>
                      <span className="text-[var(--color-fg-muted)] tabular-nums">{c.dial}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Phone — dial code prefix from the selected country */}
      <div className="space-y-2">
        <Label htmlFor="ct-phone">Contact number</Label>
        <div className="flex gap-2">
          <span className="inline-flex h-11 min-w-[68px] items-center justify-center rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg-muted)] px-3 text-sm font-medium tabular-nums text-[var(--color-fg-muted)]">
            {country.dial}
          </span>
          <div className="relative flex-1">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--color-fg-subtle)]" />
            <Input id="ct-phone" type="tel" placeholder="98765 43210" value={phone} onChange={e => setPhone(e.target.value)} required className="pl-10" />
          </div>
        </div>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="ct-message">Message</Label>
        <Textarea
          id="ct-message" rows={4} value={message} onChange={e => setMessage(e.target.value)}
          placeholder="Tell us a bit about what you're looking for…"
          className="min-h-[110px]"
        />
      </div>

      <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={pending}>
        {pending
          ? <><Loader2 className="size-4 animate-spin" /> Sending…</>
          : <><Send className="size-4" /> Send Message</>
        }
      </Button>
    </form>
  )
}
