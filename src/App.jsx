import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import PublicLayout       from '@/components/PublicLayout'
import RequireAuth        from '@/components/RequireAuth'
import RedirectIfAuthed   from '@/components/RedirectIfAuthed'

import LandingPage  from '@/pages/LandingPage'
import About        from '@/pages/About'
import Services     from '@/pages/Services'
import Pricing      from '@/pages/Pricing'
import Contact      from '@/pages/Contact'
import DemoForm     from '@/pages/DemoForm'

import Simulator            from '@/pages/Simulator'
import ClientDashboard      from '@/pages/ClientDashboard'
import AdminCalls           from '@/pages/AdminCalls'
import AdminCallDetail      from '@/pages/AdminCallDetail'
import BulkCall             from '@/pages/BulkCall'
import CallPage             from '@/pages/CallPage'
import ScenariosPage        from '@/pages/ScenariosPage'

import SuperAdminDashboard  from '@/pages/SuperAdminDashboard'
import SuperAdminUsers      from '@/pages/SuperAdminUsers'
import SuperAdminCostRates  from '@/pages/SuperAdminCostRates'
import SuperAdminPlans      from '@/pages/SuperAdminPlans'
import SuperAdminInbound    from '@/pages/SuperAdminInbound'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          {/* Public static demo sandbox — open to anonymous visitors from the landing page. */}
          <Route path="/simulator" element={<Simulator />} />

          {/* Marketing routes — anonymous only. Authed users redirect to dashboard. */}
          <Route element={<RedirectIfAuthed />}>
            <Route path="/"           element={<LandingPage />} />
            <Route path="/about"      element={<About />} />
            <Route path="/services"   element={<Services />} />
            <Route path="/pricing"    element={<Pricing />} />
            <Route path="/contact"    element={<Contact />} />
            <Route path="/demo"       element={<DemoForm />} />
          </Route>

          {/* Client admin + super admin shared scope */}
          <Route element={<RequireAuth roles={['client_admin', 'super_admin']} />}>
            <Route path="/dashboard"        element={<ClientDashboard />} />
            <Route path="/call"             element={<CallPage />} />
            <Route path="/bulk"             element={<Navigate to="/call" replace />} />
            <Route path="/admin/calls"      element={<AdminCalls />} />
            <Route path="/admin/calls/:id"  element={<AdminCallDetail />} />
            <Route path="/admin/scenarios"  element={<ScenariosPage />} />
          </Route>

          {/* Super-admin-only routes */}
          <Route element={<RequireAuth roles={['super_admin']} />}>
            <Route path="/superadmin"            element={<SuperAdminDashboard />} />
            <Route path="/superadmin/users"      element={<SuperAdminUsers />} />
            <Route path="/superadmin/cost_rates" element={<SuperAdminCostRates />} />
            <Route path="/superadmin/plans"      element={<SuperAdminPlans />} />
            <Route path="/superadmin/inbound"    element={<SuperAdminInbound />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
