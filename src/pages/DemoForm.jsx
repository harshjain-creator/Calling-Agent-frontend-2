import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, PhoneCall } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import DemoCallForm from '@/components/DemoCallForm'

/**
 * Standalone /demo route — same form rendered inside a centered card. Most
 * users hit the modal on the landing page; this URL is for direct-link
 * sharing and SEO.
 */
export default function DemoForm() {
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
                  <PhoneCall className="size-4" />
                </div>
                <div>
                  <CardTitle>Try a Demo Call</CardTitle>
                  <CardDescription>We'll dial your phone in under 10 seconds.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-7">
              <DemoCallForm />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
