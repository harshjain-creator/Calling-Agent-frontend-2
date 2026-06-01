import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PhoneCall, Upload } from 'lucide-react'

import SingleCallForm from '@/components/SingleCallForm'
import BulkCall from '@/pages/BulkCall'

/**
 * /call — unified call page with two tabs:
 *   - Single  → SingleCallForm (POST /single_call)
 *   - Bulk    → existing BulkCall component (POST /bulk_call)
 */
export default function CallPage() {
  const [view, setView] = useState('single')

  return (
    <div className="w-full px-4 sm:px-6 py-8 space-y-6">
      {/* Heading */}
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Call</h1>
        <p className="text-sm text-[var(--color-fg-muted)] mt-1">
          Dial one customer at a time, or run a bulk CSV campaign.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="inline-flex rounded-full glass p-1 border border-[var(--color-border)]">
        <TabBtn active={view === 'single'} onClick={() => setView('single')}>
          <PhoneCall className="size-4" /> Single Call
        </TabBtn>
        <TabBtn active={view === 'bulk'} onClick={() => setView('bulk')}>
          <Upload className="size-4" /> Bulk Call
        </TabBtn>
      </div>

      <AnimatePresence mode="wait">
        {view === 'single' ? (
          <motion.div
            key="single"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <SingleCallForm />
          </motion.div>
        ) : (
          <motion.div
            key="bulk"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {/* BulkCall already includes its own padding/heading — render inline here.
                We strip its outer wrapper by rendering inside our container. */}
            <BulkCall embedded />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all ${
        active
          ? 'bg-[var(--color-accent)] text-white shadow-md'
          : 'text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]'
      }`}
    >
      {children}
    </button>
  )
}
