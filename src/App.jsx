import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import { ToastProvider } from './components/shared/Toast'
import GlobalSearch from './components/shared/GlobalSearch'

// ── Super Admin (E2E + Germany overview) ──
import SuperAdminDashboard from './pages/superadmin/Dashboard'
import SuperAdminStudents from './pages/superadmin/Students'
import SuperAdminStudentDetail from './pages/superadmin/StudentDetail'
import SuperAdminApprovals from './pages/superadmin/Approvals'
import SuperAdminPackages from './pages/superadmin/Packages'
import SuperAdminTeam from './pages/superadmin/Team'
import SuperAdminReports from './pages/superadmin/Reports'

// ── Admin (E2E) ──
import E2EAdminDashboard from './pages/admin/Dashboard'
import E2EAdminStudents from './pages/admin/Students'
import E2EAdminStudentDetail from './pages/admin/StudentDetail'
import E2EAdminApprovals from './pages/admin/Approvals'
import E2EAdminTeam from './pages/admin/Team'

// ── Service (E2E) ──
import E2EServiceDashboard from './pages/service/Dashboard'
import E2EServiceStudents from './pages/service/Students'
import E2EServiceStudentDetail from './pages/service/StudentDetail'
import E2EServicePayouts from './pages/service/Payouts'

// ── Admin (Germany) ──
import GermanyAdminDashboard from './pages/germany-admin/Dashboard'
import GermanyAdminMyTasks from './pages/germany-admin/MyTasks'
import GermanyAdminAllLeads from './pages/germany-admin/AllLeads'
import GermanyAdminAllStudents from './pages/germany-admin/AllStudents'
import GermanyAdminPayments from './pages/germany-admin/Payments'
import GermanyAdminTeamDetails from './pages/germany-admin/TeamDetails'
import GermanyAdminNotifications from './pages/germany-admin/Notifications'
import GermanyAdminLeadDetail from './pages/germany-admin/LeadDetail'

// ── Service (Germany) ──
import GermanyServiceDashboard from './pages/germany-service/Dashboard'
import GermanyServiceMyTasks from './pages/germany-service/MyTasks'
import GermanyServiceNewLeads from './pages/germany-service/NewLeads'
import GermanyServiceAllStudents from './pages/germany-service/AllStudents'
import GermanyServiceLeadDetail from './pages/germany-service/LeadDetail'
import GermanyServiceNotifications from './pages/germany-service/Notifications'

// ── Sales (Germany) ──
import SalesDashboard from './pages/germany-sales/Dashboard'
import SalesMyLeads from './pages/germany-sales/MyLeads'
import SalesMyTasks from './pages/germany-sales/MyTasks'
import SalesLeadDetail from './pages/germany-sales/LeadDetail'
import SalesNotifications from './pages/germany-sales/Notifications'
import SalesPayments from './pages/germany-sales/Payments'

// ── Shared ──
import StudentProfilePage from './pages/shared/StudentProfilePage'

const roleUsers = {
  superadmin:      { name: 'Tanisha Admin',  role: 'Super Admin',        initials: 'TA' },
  admin_germany:   { name: 'Anjali Sharma',  role: 'Admin (Germany)',    initials: 'AS' },
  admin_e2e:       { name: 'Priya Verma',    role: 'Admin (E2E)',        initials: 'PV' },
  service_germany: { name: 'Amit Verma',     role: 'Service (Germany)',  initials: 'AV' },
  service_e2e:     { name: 'Neha Gupta',     role: 'Service (E2E)',      initials: 'NG' },
  sales:           { name: 'Raj Kumar',      role: 'Sales',              initials: 'RK' },
}

const defaultRoutes = {
  superadmin:      '/superadmin/dashboard',
  admin_germany:   '/germany/admin/dashboard',
  admin_e2e:       '/e2e/admin/dashboard',
  service_germany: '/germany/service/dashboard',
  service_e2e:     '/e2e/service/dashboard',
  sales:           '/germany/sales/dashboard',
}

const routePrefixes = {
  superadmin:      '/superadmin',
  admin_germany:   '/germany/admin',
  admin_e2e:       '/e2e/admin',
  service_germany: '/germany/service',
  service_e2e:     '/e2e/service',
  sales:           '/germany/sales',
}

export default function App() {
  const [currentRole, setCurrentRole] = useState('superadmin')
  const [showSearch, setShowSearch] = useState(false)
  const user = roleUsers[currentRole]
  const navigate = useNavigate()
  const location = useLocation()

  const handleRoleChange = (role) => {
    setCurrentRole(role)
    const prefix = routePrefixes[role]
    if (!location.pathname.startsWith(prefix)) {
      navigate(defaultRoutes[role])
    }
  }

  const handleSearchClose = useCallback(() => setShowSearch(false), [])

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const isStandalone = new URLSearchParams(location.search).get('standalone') === 'true'
  const isProfilePage = location.pathname.startsWith('/profile/')

  const routes = (
    <Routes>
      {/* Standalone profile */}
      <Route path="/profile/lead/:id" element={<StudentProfilePage />} />

      {/* ── Super Admin ── */}
      <Route path="/superadmin/dashboard" element={<SuperAdminDashboard user={user} />} />
      <Route path="/superadmin/students" element={<SuperAdminStudents />} />
      <Route path="/superadmin/student/:id" element={<SuperAdminStudentDetail />} />
      <Route path="/superadmin/approvals" element={<SuperAdminApprovals />} />
      <Route path="/superadmin/packages" element={<SuperAdminPackages />} />
      <Route path="/superadmin/team" element={<SuperAdminTeam />} />
      <Route path="/superadmin/reports" element={<SuperAdminReports />} />

      {/* ── Admin (E2E) ── */}
      <Route path="/e2e/admin/dashboard" element={<E2EAdminDashboard />} />
      <Route path="/e2e/admin/students" element={<E2EAdminStudents />} />
      <Route path="/e2e/admin/student/:id" element={<E2EAdminStudentDetail />} />
      <Route path="/e2e/admin/approvals" element={<E2EAdminApprovals />} />
      <Route path="/e2e/admin/team" element={<E2EAdminTeam />} />

      {/* ── Service (E2E) ── */}
      <Route path="/e2e/service/dashboard" element={<E2EServiceDashboard />} />
      <Route path="/e2e/service/students" element={<E2EServiceStudents />} />
      <Route path="/e2e/service/student/:id" element={<E2EServiceStudentDetail />} />
      <Route path="/e2e/service/payouts" element={<E2EServicePayouts />} />

      {/* ── Admin (Germany) ── */}
      <Route path="/germany/admin/dashboard" element={<GermanyAdminDashboard user={user} />} />
      <Route path="/germany/admin/my-tasks" element={<GermanyAdminMyTasks />} />
      <Route path="/germany/admin/new-leads" element={<GermanyAdminAllLeads />} />
      <Route path="/germany/admin/all-students" element={<GermanyAdminAllStudents />} />
      <Route path="/germany/admin/payments" element={<GermanyAdminPayments />} />
      <Route path="/germany/admin/team-details" element={<GermanyAdminTeamDetails />} />
      <Route path="/germany/admin/notifications" element={<GermanyAdminNotifications />} />
      <Route path="/germany/admin/lead/:id" element={<GermanyAdminLeadDetail standalone={isStandalone} />} />

      {/* ── Service (Germany) ── */}
      <Route path="/germany/service/dashboard" element={<GermanyServiceDashboard user={user} />} />
      <Route path="/germany/service/my-tasks" element={<GermanyServiceMyTasks />} />
      <Route path="/germany/service/new-leads" element={<GermanyServiceNewLeads />} />
      <Route path="/germany/service/all-students" element={<GermanyServiceAllStudents />} />
      <Route path="/germany/service/lead/:id" element={<GermanyServiceLeadDetail standalone={isStandalone} />} />
      <Route path="/germany/service/notifications" element={<GermanyServiceNotifications />} />

      {/* ── Sales (Germany) ── */}
      <Route path="/germany/sales/dashboard" element={<SalesDashboard user={user} />} />
      <Route path="/germany/sales/my-leads" element={<SalesMyLeads />} />
      <Route path="/germany/sales/my-tasks" element={<SalesMyTasks />} />
      <Route path="/germany/sales/payments" element={<SalesPayments />} />
      <Route path="/germany/sales/lead/:id" element={<SalesLeadDetail standalone={isStandalone} />} />
      <Route path="/germany/sales/notifications" element={<SalesNotifications />} />

      {/* Default */}
      <Route path="*" element={<Navigate to={defaultRoutes[currentRole]} replace />} />
    </Routes>
  )

  if (isStandalone || isProfilePage) {
    return (
      <ToastProvider>
        <div className="min-h-screen bg-grey-5">
          <main className="overflow-y-auto">
            <div className={isProfilePage ? '' : 'max-w-[1000px] mx-auto px-8 py-8'}>
              {routes}
            </div>
          </main>
        </div>
      </ToastProvider>
    )
  }

  return (
    <ToastProvider>
      <div className="flex h-screen bg-grey-5">
        <Sidebar role={currentRole} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar user={user} currentRole={currentRole} onRoleChange={handleRoleChange} />
          <main className="flex-1 min-h-0 overflow-y-auto bg-grey-5">
            <div className="px-8 py-6">
              {routes}
            </div>
          </main>
        </div>
      </div>
      <GlobalSearch isOpen={showSearch} onClose={handleSearchClose} currentRole={currentRole} />
    </ToastProvider>
  )
}
