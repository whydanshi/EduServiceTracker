import { useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import SearchBar from '../../components/shared/SearchBar'
import FilterPills from '../../components/shared/FilterPills'
import { notifications } from '../../data/notifications'
import { RefreshCw, CreditCard, AlertTriangle, ClipboardCheck } from 'lucide-react'

const timeFilters = [
  { id: 'all', label: 'All' },
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'week', label: 'Last 7 Days' },
]

const typeIcons = {
  task: { icon: ClipboardCheck, bg: 'bg-info-light', color: 'text-info' },
  status: { icon: RefreshCw, bg: 'bg-amber-light', color: 'text-amber' },
  payment: { icon: CreditCard, bg: 'bg-green-light', color: 'text-green' },
  alert: { icon: AlertTriangle, bg: 'bg-red-light', color: 'text-red' },
}

export default function AdminNotifications() {
  const [timeFilter, setTimeFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = notifications.filter(n => {
    if (timeFilter === 'today' && n.date !== 'today') return false
    if (timeFilter === 'yesterday' && n.date !== 'yesterday') return false
    if (timeFilter === 'week' && n.date === 'older') return false
    return true
  })

  const grouped = {
    today: filtered.filter(n => n.date === 'today'),
    yesterday: filtered.filter(n => n.date === 'yesterday'),
    older: filtered.filter(n => n.date === 'older'),
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-grey-95 tracking-tight">Notifications</h1>
        <button className="text-[13px] font-medium text-blue-90 hover:text-blue-90/70 transition-colors">Mark all as read</button>
      </div>

      <div className="mb-4">
        <SearchBar placeholder="Search notifications" value={search} onChange={setSearch} className="w-[320px]" />
      </div>

      <div className="mb-6">
        <FilterPills filters={timeFilters} activeFilter={timeFilter} onFilterChange={setTimeFilter} />
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([group, items]) => {
          if (items.length === 0) return null
          return (
            <div key={group}>
              <p className="text-[11px] font-semibold text-grey-40 uppercase tracking-wider mb-3">
                {group === 'today' ? 'Today' : group === 'yesterday' ? 'Yesterday' : 'Older'}
              </p>
              <div className="space-y-2">
                {items.map((notif) => {
                  const config = typeIcons[notif.type] || typeIcons.task
                  const IconComp = config.icon
                  return (
                    <div key={notif.id}
                      className={`rounded-xl p-4 flex items-start gap-3 transition-all border ${notif.read ? 'border-grey-20 bg-white' : 'border-blue-90/10 bg-blue-10/30'}`}>
                      <div className={`w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                        <IconComp className={`w-4 h-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] ${notif.read ? 'text-grey-70' : 'text-grey-95 font-medium'}`}>{notif.title}</p>
                        <p className="text-[12px] text-grey-40 mt-0.5">{notif.description}</p>
                        {!notif.read && (
                          <button className="text-[12px] font-medium text-blue-90 mt-1.5 hover:text-blue-90/70 transition-colors">View Details</button>
                        )}
                      </div>
                      <span className="text-[11px] text-grey-40 flex-shrink-0 pt-0.5">{notif.timestamp}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-center mt-8">
        <button className="text-[13px] font-medium text-blue-90 hover:text-blue-90/70 transition-colors">Load older notifications</button>
      </div>
    </div>
  )
}
