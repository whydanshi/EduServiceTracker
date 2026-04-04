import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, GraduationCap, Package, ClipboardCheck,
  FileText, CreditCard, UserCog, Search, Command,
} from 'lucide-react'

const iconMap = {
  LayoutDashboard, Users, GraduationCap, Package,
  ClipboardCheck, FileText, CreditCard, UserCog,
}

const navMap = {
  superadmin: [
    { label: 'Dashboard', path: '/superadmin/dashboard', icon: 'LayoutDashboard', description: 'Overview & analytics' },
    { label: 'E2E Students', path: '/superadmin/students', icon: 'GraduationCap', description: 'E2E students & P&L' },
    { label: 'Payout Approvals', path: '/superadmin/approvals', icon: 'ClipboardCheck', description: 'Pending approvals' },
    { label: 'Packages', path: '/superadmin/packages', icon: 'Package', description: 'Manage packages' },
    { label: 'Team', path: '/superadmin/team', icon: 'Users', description: 'Manage team members' },
  ],
  admin_germany: [
    { label: 'Dashboard', path: '/germany/admin/dashboard', icon: 'LayoutDashboard', description: 'Germany overview' },
    { label: 'My Tasks', path: '/germany/admin/my-tasks', icon: 'ClipboardCheck', description: 'Pending actions' },
    { label: 'Leads', path: '/germany/admin/new-leads', icon: 'FileText', description: 'All leads' },
    { label: 'Active Students', path: '/germany/admin/all-students', icon: 'Users', description: 'Student list' },
    { label: 'Payments', path: '/germany/admin/payments', icon: 'CreditCard', description: 'Payment tracking' },
    { label: 'Team Details', path: '/germany/admin/team-details', icon: 'UserCog', description: 'Team info' },
  ],
  admin_e2e: [
    { label: 'Dashboard', path: '/e2e/admin/dashboard', icon: 'LayoutDashboard', description: 'E2E overview' },
    { label: 'Students', path: '/e2e/admin/students', icon: 'GraduationCap', description: 'E2E students' },
    { label: 'Payout Approvals', path: '/e2e/admin/approvals', icon: 'ClipboardCheck', description: 'Payout approvals' },
    { label: 'Team', path: '/e2e/admin/team', icon: 'Users', description: 'Team info' },
  ],
  service_germany: [
    { label: 'Dashboard', path: '/germany/service/dashboard', icon: 'LayoutDashboard', description: 'Germany overview' },
    { label: 'My Tasks', path: '/germany/service/my-tasks', icon: 'ClipboardCheck', description: 'Pending actions' },
    { label: 'Leads', path: '/germany/service/new-leads', icon: 'FileText', description: 'All leads' },
    { label: 'Active Students', path: '/germany/service/all-students', icon: 'Users', description: 'Student list' },
  ],
  service_e2e: [
    { label: 'Dashboard', path: '/e2e/service/dashboard', icon: 'LayoutDashboard', description: 'E2E overview' },
    { label: 'My Students', path: '/e2e/service/students', icon: 'GraduationCap', description: 'E2E students' },
    { label: 'Payouts', path: '/e2e/service/payouts', icon: 'CreditCard', description: 'Payout requests' },
  ],
  sales: [
    { label: 'Dashboard', path: '/germany/sales/dashboard', icon: 'LayoutDashboard', description: 'Sales overview' },
    { label: 'My Leads', path: '/germany/sales/my-leads', icon: 'FileText', description: 'Your leads' },
    { label: 'My Tasks', path: '/germany/sales/my-tasks', icon: 'ClipboardCheck', description: 'Pending actions' },
    { label: 'Payments', path: '/germany/sales/payments', icon: 'CreditCard', description: 'Payment tracking' },
  ],
}

export default function GlobalSearch({ isOpen, onClose, currentRole }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const inputRef = useRef(null)

  const items = useMemo(() => navMap[currentRole] || [], [currentRole])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (i) =>
        i.label.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.path.toLowerCase().includes(q)
    )
  }, [query, items])

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIdx(0)
  }, [filtered])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIdx((prev) => Math.min(prev + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIdx((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter' && filtered[selectedIdx]) {
        e.preventDefault()
        navigate(filtered[selectedIdx].path)
        onClose()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, filtered, selectedIdx, navigate, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex justify-center pt-[20vh]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-w-lg w-full mx-4 bg-white rounded-xl shadow-2xl border border-grey-20 overflow-hidden self-start">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-grey-20">
          <Search className="w-5 h-5 text-grey-40 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, actions..."
            className="flex-1 text-[15px] text-grey-95 placeholder:text-grey-40 outline-none bg-transparent"
          />
          <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-grey-10 text-[10px] text-grey-40 font-medium">
            esc
          </kbd>
        </div>

        <div className="max-h-[300px] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-grey-40">No results found</p>
          ) : (
            filtered.map((item, idx) => {
              const IconComp = iconMap[item.icon] || FileText
              return (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); onClose() }}
                  onMouseEnter={() => setSelectedIdx(idx)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    selectedIdx === idx ? 'bg-blue-10' : 'hover:bg-grey-5'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    selectedIdx === idx ? 'bg-blue-20 text-blue-90' : 'bg-grey-10 text-grey-60'
                  }`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-grey-95">{item.label}</p>
                    <p className="text-[11px] text-grey-40">{item.description}</p>
                  </div>
                  {selectedIdx === idx && (
                    <span className="text-[10px] text-grey-40 flex-shrink-0">↵ Open</span>
                  )}
                </button>
              )
            })
          )}
        </div>

        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-grey-20 bg-grey-5">
          <span className="text-[11px] text-grey-40 flex items-center gap-1"><span className="font-mono">↑↓</span> Navigate</span>
          <span className="text-[11px] text-grey-40 flex items-center gap-1"><span className="font-mono">↵</span> Open</span>
          <span className="text-[11px] text-grey-40 flex items-center gap-1"><span className="font-mono">esc</span> Close</span>
        </div>
      </div>
    </div>
  )
}
