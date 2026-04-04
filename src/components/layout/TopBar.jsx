import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Bell, LogOut, Search, Command } from 'lucide-react'
import ConfirmModal from '../shared/ConfirmModal'

const roles = [
  { id: 'superadmin',      label: 'Super Admin' },
  { id: 'admin_germany',   label: 'Admin (DE)' },
  { id: 'admin_e2e',       label: 'Admin (E2E)' },
  { id: 'service_germany', label: 'Service (DE)' },
  { id: 'service_e2e',     label: 'Service (E2E)' },
  { id: 'sales',           label: 'Sales' },
]

export default function TopBar({ user, currentRole, onRoleChange }) {
  const navigate = useNavigate()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="h-[56px] bg-white border-b border-grey-20 flex items-center justify-between px-8 flex-shrink-0">
      <button
        onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-grey-20 bg-grey-5 hover:bg-grey-10 transition-colors cursor-pointer"
      >
        <Search className="w-3.5 h-3.5 text-grey-40" />
        <span className="text-[12px] text-grey-40">Search...</span>
        <kbd className="ml-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white border border-grey-20 text-[10px] text-grey-40 font-medium">
          <Command className="w-2.5 h-2.5" />K
        </kbd>
      </button>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-grey-40 uppercase tracking-wider font-medium">Demo</span>
          <div className="flex items-center bg-grey-10 rounded-lg p-0.5 gap-0.5">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => onRoleChange(r.id)}
                className={`px-2 py-1.5 rounded-md text-[9px] font-semibold transition-all duration-150 whitespace-nowrap ${
                  currentRole === r.id
                    ? 'bg-white text-grey-95 shadow-sm'
                    : 'text-grey-40 hover:text-grey-60'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="w-px h-7 bg-grey-20" />

        <button className="relative p-2 rounded-lg hover:bg-grey-10 transition-colors">
          <Bell className="w-[18px] h-[18px] text-grey-60" strokeWidth={1.8} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red border-2 border-white" />
        </button>

        <div className="w-px h-7 bg-grey-20" />

        <div ref={profileRef} className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-blue-10 flex items-center justify-center text-blue-90 text-[11px] font-bold">
              {user.initials}
            </div>
            <div className="text-right">
              <p className="text-[13px] font-medium text-grey-95 leading-tight">{user.name}</p>
              <p className="text-[11px] text-grey-40 leading-tight">{user.role}</p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-grey-40 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-[200px] bg-white border border-grey-20 rounded-lg shadow-lg py-1 z-50">
              <button
                onClick={() => { setShowLogoutConfirm(true); setShowProfileMenu(false) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red hover:bg-red-light transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => navigate('/login')}
        title="Logout?"
        message="Are you sure you want to logout?"
        confirmLabel="Logout"
        danger={false}
      />
    </header>
  )
}
