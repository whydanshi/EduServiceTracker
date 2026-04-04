import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  FileText,
  CreditCard,
  UserCog,
  Settings,
  GraduationCap,
  ShieldCheck,
  Package,
  BarChart3,
} from 'lucide-react'
import trackEduLogo from '../../assets/logo-trackedu.svg'

const navConfig = {
  superadmin: [
    { to: '/superadmin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/superadmin/students', label: 'E2E Students', icon: GraduationCap },
    { to: '/superadmin/approvals', label: 'Payout Approvals', icon: ShieldCheck },
    { to: '/superadmin/packages', label: 'Packages', icon: Package },
    { to: '/superadmin/team', label: 'Team', icon: Users },
    { to: '/superadmin/reports', label: 'Reports', icon: BarChart3 },
  ],
  admin_germany: [
    { to: '/germany/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/germany/admin/my-tasks', label: 'My Tasks', icon: ClipboardCheck },
    { to: '/germany/admin/new-leads', label: 'Leads', icon: FileText },
    { to: '/germany/admin/all-students', label: 'Active Students', icon: Users },
    { to: '/germany/admin/payments', label: 'Payments', icon: CreditCard },
    { to: '/germany/admin/team-details', label: 'Team Details', icon: UserCog },
  ],
  admin_e2e: [
    { to: '/e2e/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/e2e/admin/students', label: 'Students', icon: GraduationCap },
    { to: '/e2e/admin/approvals', label: 'Payout Approvals', icon: ShieldCheck },
    { to: '/e2e/admin/team', label: 'Team', icon: Users },
  ],
  service_germany: [
    { to: '/germany/service/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/germany/service/my-tasks', label: 'My Tasks', icon: ClipboardCheck },
    { to: '/germany/service/new-leads', label: 'Leads', icon: FileText },
    { to: '/germany/service/all-students', label: 'Active Students', icon: Users },
  ],
  service_e2e: [
    { to: '/e2e/service/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/e2e/service/students', label: 'My Students', icon: GraduationCap },
    { to: '/e2e/service/payouts', label: 'Payouts', icon: CreditCard },
  ],
  sales: [
    { to: '/germany/sales/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/germany/sales/my-leads', label: 'My Leads', icon: FileText },
    { to: '/germany/sales/my-tasks', label: 'My Tasks', icon: ClipboardCheck },
    { to: '/germany/sales/payments', label: 'Payments', icon: CreditCard },
  ],
}

const productLabels = {
  superadmin:      { text: 'Germany + E2E', bgClass: 'bg-purple-light text-purple' },
  admin_germany:   { text: 'Germany',       bgClass: 'bg-grey-10 text-grey-60' },
  admin_e2e:       { text: 'E2E Services',  bgClass: 'bg-blue-10 text-blue-90' },
  service_germany: { text: 'Germany',       bgClass: 'bg-grey-10 text-grey-60' },
  service_e2e:     { text: 'E2E Services',  bgClass: 'bg-blue-10 text-blue-90' },
  sales:           { text: 'Germany',       bgClass: 'bg-grey-10 text-grey-60' },
}

export default function Sidebar({ role }) {
  const items = navConfig[role] || navConfig.admin_e2e
  const product = productLabels[role] || productLabels.admin_e2e

  return (
    <aside className="w-[232px] min-w-[232px] h-screen bg-white border-r border-grey-20 flex flex-col">
      <div className="px-6 pt-6 pb-2">
        <img src={trackEduLogo} alt="Leverage Edu" className="h-[18px] w-auto object-contain" />
      </div>
      <div className="px-6 pb-4">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${product.bgClass}`}>
          {product.text}
        </span>
      </div>

      <nav className="flex-1 px-3 overflow-y-auto">
        <div className="flex flex-col gap-0.5">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-10 text-blue-90 font-semibold'
                    : 'text-grey-60 hover:bg-grey-5 hover:text-grey-70 font-medium'
                }`
              }
            >
              <item.icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="px-3 py-3 border-t border-grey-20">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-grey-60 hover:bg-grey-5 hover:text-grey-70 w-full transition-all duration-150">
          <Settings className="w-[18px] h-[18px]" strokeWidth={1.8} />
          Settings
        </button>
      </div>
    </aside>
  )
}
