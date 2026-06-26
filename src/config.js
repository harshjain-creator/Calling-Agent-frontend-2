export const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8002').replace(/\/+$/, '')

export const COMPANY = {
  name: 'FI DIGITAL',
  tagline: 'Voice AI for the next generation of enterprise — worldwide.',
}

// Public site nav (anonymous visitors). `hash` → scroll to a landing section.
export const NAV_LINKS = [
  { label: 'Home',          to: '/' },
  { label: 'Features',      to: '/', hash: 'features' },
  { label: 'Run Simulator', to: '/simulator' },
  { label: 'Contact Us',    to: '/', hash: 'contact' },
]

// Client admin nav — visible after login when role=client_admin
export const CLIENT_NAV_LINKS = [
  { label: 'Dashboard',     to: '/dashboard' },
  { label: 'Calls History', to: '/admin/calls' },
  { label: 'Call',          to: '/call' },          // Single + Bulk in one tab
  { label: 'Add Scenario',  to: '/admin/scenarios' },
]

// Super admin nav — FI DIGITAL internal
export const SUPER_NAV_LINKS = [
  { label: 'Dashboard',  to: '/superadmin' },
  { label: 'All Calls',  to: '/admin/calls' },
  { label: 'Call',       to: '/call' },             // Single + Bulk in one tab
  { label: 'Scenarios',  to: '/admin/scenarios' },
  { label: 'Inbound',    to: '/superadmin/inbound' },
  { label: 'Users',      to: '/superadmin/users' },
]

