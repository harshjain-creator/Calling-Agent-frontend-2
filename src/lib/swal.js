/**
 * Themed SweetAlert2 helper. Uses CSS vars from your design tokens so
 * dialogs auto-match light/dark mode without per-call config.
 *
 * Usage:
 *   import { confirm, toast, alertError, alertSuccess } from '@/lib/swal'
 *
 *   const ok = await confirm({
 *     title: 'Delete scenario?',
 *     text:  'This cannot be undone.',
 *     confirmText: 'Delete',
 *     danger: true,
 *   })
 *   if (!ok) return
 *
 *   await toast({ icon: 'success', text: 'Saved' })
 *   await alertError(err?.body?.detail || err.message)
 */
import Swal from 'sweetalert2'

// Custom CSS classes use your design tokens. Defined in src/index.css below.
const baseCustomClass = {
  popup:        'swal-popup',
  title:        'swal-title',
  htmlContainer:'swal-text',
  confirmButton:'swal-btn swal-btn-primary',
  cancelButton: 'swal-btn swal-btn-ghost',
  actions:      'swal-actions',
}

export async function confirm({
  title = 'Are you sure?',
  text  = '',
  confirmText = 'Confirm',
  cancelText  = 'Cancel',
  danger = false,
  icon   = danger ? 'warning' : 'question',
} = {}) {
  const r = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton:  true,
    confirmButtonText: confirmText,
    cancelButtonText:  cancelText,
    reverseButtons:    true,
    focusCancel:       true,
    buttonsStyling:    false,
    customClass: {
      ...baseCustomClass,
      confirmButton: danger
        ? 'swal-btn swal-btn-danger'
        : 'swal-btn swal-btn-primary',
    },
  })
  return r.isConfirmed
}

export async function alertError(text, title = 'Error') {
  return Swal.fire({
    title, text: String(text || 'Something went wrong'), icon: 'error',
    confirmButtonText: 'OK', buttonsStyling: false, customClass: baseCustomClass,
  })
}

export async function alertSuccess(text, title = 'Done') {
  return Swal.fire({
    title, text, icon: 'success',
    confirmButtonText: 'OK', buttonsStyling: false, customClass: baseCustomClass,
  })
}

const _Toast = Swal.mixin({
  toast: true, position: 'top-end', timer: 3000, timerProgressBar: true,
  showConfirmButton: false, buttonsStyling: false,
  customClass: { popup: 'swal-popup swal-toast' },
})

export function toast({ icon = 'success', text = '' } = {}) {
  return _Toast.fire({ icon, title: text })
}
