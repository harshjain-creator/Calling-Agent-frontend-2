import { PhoneCall } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import DemoCallForm from '@/components/DemoCallForm'

/**
 * Demo call popup launched from Landing's hero CTA. Wraps DemoCallForm in
 * a Dialog so callers stay on the landing page.
 */
export default function DemoCallModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              <PhoneCall className="size-4" />
            </div>
            <div>
              <DialogTitle>Try a Demo Call</DialogTitle>
              <DialogDescription>
                We'll dial your phone in under 10 seconds.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="pt-4">
          <DemoCallForm />
        </div>
      </DialogContent>
    </Dialog>
  )
}
