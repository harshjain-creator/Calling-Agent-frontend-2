import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

/**
 * If a logged-in user hits a public marketing route (landing, demo, etc),
 * bounce them to their role-appropriate dashboard. Anonymous users see the
 * route normally.
 */
export default function RedirectIfAuthed({ to, children }) {
  const { isAuthed, role } = useAuth()
  if (isAuthed) {
    const target = to || (role === 'super_admin' ? '/superadmin' : '/admin/calls')
    return <Navigate to={target} replace />
  }
  return children ?? <Outlet />
}
