import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Guard for routes requiring specific role(s).
 *   <Route element={<RequireAuth roles={['client_admin','super_admin']} />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *   </Route>
 */
export default function RequireAuth({ roles, children }) {
  const { isAuthed, role } = useAuth()
  const loc = useLocation()
  if (!isAuthed)                       return <Navigate to="/" state={{ from: loc, needLogin: true }} replace />
  if (roles && !roles.includes(role))  return <Navigate to="/" replace />
  return children ?? <Outlet />
}
