import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MessageSquare } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import ContactForm from '@/components/ContactForm'

/**
 * /contact — Contact Us page. Centered card wrapping the ContactForm.
 */
export default function Contact() {
  return (
    <section className="relative w-full px-4 sm:px-6 py-16 lg:py-24">
      <div className="mx-auto max-w-3xl">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/"><ArrowLeft className="size-4" /> Home</Link>
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="glass-strong shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-[var(--color-border)] pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                  <MessageSquare className="size-4" />
                </div>
                <div>
                  <CardTitle>Contact Us</CardTitle>
                  <CardDescription>Tell us what you need — we'll be in touch shortly.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-7">
              <ContactForm />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
