import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import { HelpTooltip } from '../../components/shared/Tooltip'
import { leads } from '../../data/leads'
import { students } from '../../data/students'
import { salesTeam, serviceTeam } from '../../data/team'
import CsvUploadModal from '../../components/shared/CsvUploadModal'
import {
  TrendingUp,
  Users as UsersIcon,
  FileText,
  Target,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Package as PackageIcon,
  UserPlus,
} from 'lucide-react'

function parseDDMMYY(s) {
  // expects DD/MM/YY
  const [dd, mm, yy] = (s || '').split('/').map(Number)
  if (!dd || !mm || yy === undefined) return null
  const fullYear = 2000 + yy
  const d = new Date(fullYear, mm - 1, dd)
  return isNaN(d.getTime()) ? null : d
}

function initials(name) {
  return (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

export default function SuperAdminDashboard({ user }) {
  const navigate = useNavigate()
  const [showUserUpload, setShowUserUpload] = useState(false)
  const [showPackageUpload, setShowPackageUpload] = useState(false)

  const leadDates = useMemo(() => leads.map(l => parseDDMMYY(l.date)).filter(Boolean), [])
  const latestDate = useMemo(() => {
    if (leadDates.length === 0) return null
    return new Date(Math.max(...leadDates.map(d => d.getTime())))
  }, [leadDates])
  const leadsToday = useMemo(() => {
    if (!latestDate) return 0
    return leads.filter(l => {
      const d = parseDDMMYY(l.date)
      return d && d.toDateString() === latestDate.toDateString()
    }).length
  }, [latestDate])

  // Eligibility analytics
  const totalLeadsReceived = leads.length
  const convertedLeads = leads.filter(l => l.serviceStatus === 'Serviceable' || l.salesStatus === 'Qualified').length
  const conversionRate = totalLeadsReceived > 0 ? Math.round((convertedLeads / totalLeadsReceived) * 100) : 0
  const urgentLeads = leads.filter(l => {
    const status = l.serviceStatus || l.salesStatus || ''
    return status === 'On Hold' || status === 'Rejected' || status === 'More Info Required' || l.salesStatus === 'Lost'
  }).length

  // KPI values with color coding
  const kpis = [
    { label: 'Leads Received', value: String(totalLeadsReceived), trend: '+12%', sub: 'Total leads this month', icon: FileText, bgColor: 'bg-blue-10/50', iconBg: 'bg-blue-10', iconColor: 'text-blue-90' },
    { label: 'Converted', value: String(convertedLeads), trend: '+8%', sub: 'Serviceable & qualified', icon: Target, bgColor: 'bg-green-light/60', iconBg: 'bg-green-light', iconColor: 'text-green' },
    { label: 'Conversion Rate', value: `${conversionRate}%`, trend: '+5%', sub: 'Month to date', icon: TrendingUp, bgColor: 'bg-purple-light/60', iconBg: 'bg-purple-light', iconColor: 'text-purple', help: 'Percentage of leads that became serviceable or qualified' },
    { label: 'Serviceable Rate', value: '72%', trend: '+3%', sub: 'Month to date', icon: CheckCircle2, bgColor: 'bg-info-light/40', iconBg: 'bg-info-light', iconColor: 'text-info', help: 'Percentage of leads marked as serviceable after QC' },
    { label: 'Urgent Attention', value: String(urgentLeads), trend: 'Needs review', sub: 'On hold / rejected / lost', icon: AlertTriangle, isAlert: true, bgColor: 'bg-red-light/60', iconBg: 'bg-red-light', iconColor: 'text-red', help: 'Leads that are on hold, rejected, or lost and need immediate attention' },
    { label: 'Active Students', value: String(students.length), trend: '+4%', sub: 'In active journey', icon: UsersIcon, bgColor: 'bg-amber-light/60', iconBg: 'bg-amber-light', iconColor: 'text-amber' },
  ]

  const statusCounts = useMemo(() => {
    const buckets = {
      Draft: 0,
      'Email Sent': 0,
      'QC Checked': 0,
      Serviceable: 0,
      'In Review': 0,
      Rejected: 0,
      'More Info Required': 0,
    }
    leads.forEach((l) => {
      if (l.salesStatus === 'Draft') buckets.Draft += 1
      else if (l.serviceStatus === 'Email Sent') buckets['Email Sent'] += 1
      else if (l.serviceStatus === 'QC Checked') buckets['QC Checked'] += 1
      else if (l.serviceStatus === 'Serviceable') buckets.Serviceable += 1
      else if (l.serviceStatus === 'In Review' || l.serviceStatus === 'Assigned' || l.serviceStatus === 'Pending Evaluation') buckets['In Review'] += 1
      else if (l.serviceStatus === 'Rejected' || l.salesStatus === 'Lost') buckets.Rejected += 1
      else if (l.serviceStatus === 'More Info Required' || l.salesStatus === 'More info required') buckets['More Info Required'] += 1
      else buckets['In Review'] += 1
    })
    const total = Object.values(buckets).reduce((s, n) => s + n, 0) || 1
    const dist = [
      { label: 'Draft', count: buckets.Draft, pct: Math.round((buckets.Draft / total) * 100), color: 'bg-grey-40', stroke: '#889BAC' },
      { label: 'Email Sent', count: buckets['Email Sent'], pct: Math.round((buckets['Email Sent'] / total) * 100), color: 'bg-purple', stroke: '#7C3AED' },
      { label: 'QC Checked', count: buckets['QC Checked'], pct: Math.round((buckets['QC Checked'] / total) * 100), color: 'bg-green', stroke: '#1C7712' },
      { label: 'Serviceable', count: buckets.Serviceable, pct: Math.round((buckets.Serviceable / total) * 100), color: 'bg-green', stroke: '#16A34A' },
      { label: 'In Review', count: buckets['In Review'], pct: Math.round((buckets['In Review'] / total) * 100), color: 'bg-info', stroke: '#0EA5E9' },
      { label: 'Rejected', count: buckets.Rejected, pct: Math.round((buckets.Rejected / total) * 100), color: 'bg-red', stroke: '#DC2626' },
    ].filter(x => x.count > 0)

    // normalize pct to 100 if rounding drift
    const sumPct = dist.reduce((s, d) => s + d.pct, 0)
    if (sumPct !== 100 && dist.length > 0) dist[0].pct += (100 - sumPct)
    return dist
  }, [])

  const recentLeads = useMemo(() => {
    const sorted = [...leads].sort((a, b) => {
      const da = parseDDMMYY(a.date)?.getTime() || 0
      const db = parseDDMMYY(b.date)?.getTime() || 0
      return db - da
    })
    return sorted.slice(0, 6)
  }, [])

  const quickActions = [
    { label: 'Onboard new user', icon: UserPlus, onClick: () => navigate('/superadmin/users') },
    { label: 'Upload users CSV', icon: Upload, onClick: () => setShowUserUpload(true) },
    { label: 'Create package', icon: PackageIcon, onClick: () => navigate('/superadmin/packages') },
    { label: 'Upload packages CSV', icon: Upload, onClick: () => setShowPackageUpload(true) },
  ]

  const audit = [
    { ts: '12 mins ago', text: 'Package “Premium Germany” updated by Tanisha Admin' },
    { ts: '2 hours ago', text: 'Role changed: Priya Sharma → Sales by Tanisha Admin' },
    { ts: 'Yesterday', text: 'Imported 14 users from CSV (2 skipped duplicates)' },
    { ts: '2 days ago', text: 'Package “Elite” created by Tanisha Admin' },
  ]

  return (
    <div>
      <PageHeader greeting title={`Good morning, ${user?.name?.split(' ')[0] || 'Tanisha'}`} subtitle="Super Admin Dashboard" />

      {/* Quick Actions - Horizontal line at top */}
      <div className="flex items-center gap-3 mb-6">
        {quickActions.map((a) => (
          <button
            key={a.label}
            onClick={a.onClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-blue-40 rounded-lg hover:bg-blue-10 hover:border-blue-90 transition-all text-left group cursor-pointer shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-10 text-blue-90 flex items-center justify-center group-hover:bg-blue-20 transition-colors">
              <a.icon className="w-4 h-4" />
            </div>
            <span className="text-[13px] font-semibold text-grey-95">{a.label}</span>
          </button>
        ))}
      </div>

      {/* KPI Stat cards - with color coding */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        {kpis.map((card) => (
          <div key={card.label} className={`rounded-xl border border-grey-20 p-6 ${card.bgColor || 'bg-white'}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-lg ${card.iconBg || 'bg-grey-10'} flex items-center justify-center flex-shrink-0`}>
                <card.icon className={`w-4 h-4 ${card.iconColor || 'text-grey-60'}`} />
              </div>
              <p className="text-[11px] font-semibold text-grey-40 uppercase tracking-wider flex items-center gap-1">
                {card.label}
                {card.help && <HelpTooltip text={card.help} />}
              </p>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-[28px] font-semibold text-grey-95 tracking-tight">{card.value}</span>
              <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${card.isAlert ? 'text-red' : 'text-green'}`}>
                {!card.isAlert && <TrendingUp className="w-3 h-3" />}
                {card.trend}
              </span>
            </div>
            <p className="text-[12px] text-grey-60">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts and activity row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Lead status distribution */}
        <div className="bg-white rounded-xl border border-grey-20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[14px] font-semibold text-grey-95">Lead Status Distribution</h3>
            <span className="text-[11px] font-medium text-grey-40 uppercase">Snapshot</span>
          </div>
          <div className="flex items-center gap-8">
            <div className="relative w-28 h-28 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {statusCounts.reduce((acc, item) => {
                  const dash = `${item.pct} ${100 - item.pct}`
                  const offset = acc.offset
                  acc.offset -= item.pct
                  acc.segments.push(
                    <circle
                      key={item.label}
                      cx="18" cy="18" r="15.9"
                      fill="none"
                      stroke={item.stroke}
                      strokeWidth="3.8"
                      strokeDasharray={dash}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                    />
                  )
                  return acc
                }, { offset: 0, segments: [] }).segments}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[11px] text-grey-60">Total</span>
                <span className="text-[16px] font-semibold text-grey-95">{leads.length}</span>
              </div>
            </div>
            <div className="space-y-3 flex-1">
              {statusCounts.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      <span className="text-[13px] text-grey-70">{item.label}</span>
                    </div>
                    <span className="text-[13px] font-medium text-grey-95">{item.count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-grey-10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl border border-grey-20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-semibold text-grey-95">Recent Activity</h3>
            <span className="text-[11px] font-medium text-grey-40 uppercase">Audit</span>
          </div>
          <div className="space-y-3">
            {audit.map((a, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-grey-5">
                <p className="text-[12px] text-grey-40">{a.ts}</p>
                <p className="text-[13px] text-grey-70 mt-0.5">{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance tables */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-grey-20 p-6 overflow-hidden">
          <h3 className="text-[14px] font-semibold text-grey-95 mb-4">Sales Performance (Top 5)</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-grey-5 border-b border-grey-20">
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Sales Member</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Total Leads</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Monthly Leads</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Converted</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {salesTeam.slice(0, 5).map((m) => (
                  <tr key={m.name} className="border-b border-grey-10 last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-10 text-blue-90 flex items-center justify-center text-[10px] font-bold">
                          {m.initials}
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-grey-95">{m.name}</p>
                          <p className="text-[11px] text-grey-40">SALES</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-grey-70">{m.totalLeads.toLocaleString()}</td>
                    <td className="px-4 py-3 text-[13px] text-grey-70">{Math.round(m.totalLeads * 0.09).toLocaleString()}</td>
                    <td className="px-4 py-3 text-[13px] text-grey-70">{m.serviceableLeads.toLocaleString()}</td>
                    <td className="px-4 py-3 text-[13px] font-medium text-green">{m.conversionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-grey-20 p-6 overflow-hidden">
          <h3 className="text-[14px] font-semibold text-grey-95 mb-4">Service Performance (Top 5)</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-grey-5 border-b border-grey-20">
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Service Member</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Current Leads</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Serviceable</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Pending</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">On Hold</th>
                </tr>
              </thead>
              <tbody>
                {serviceTeam.slice(0, 5).map((m) => (
                  <tr key={m.name} className="border-b border-grey-10 last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-10 text-blue-90 flex items-center justify-center text-[10px] font-bold">
                          {m.initials}
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-grey-95">{m.name}</p>
                          <p className="text-[11px] text-grey-40">SERVICE</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-grey-70">{m.currentLeads.toLocaleString()}</td>
                    <td className="px-4 py-3 text-[13px] text-grey-70">{m.serviceable.toLocaleString()}</td>
                    <td className="px-4 py-3 text-[13px] text-grey-70">{m.pending.toLocaleString()}</td>
                    <td className="px-4 py-3 text-[13px] text-grey-70">{m.onHold.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent leads */}
      <div className="bg-white rounded-xl border border-grey-20 overflow-hidden">
        <div className="px-6 py-4 border-b border-grey-20 flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-semibold text-grey-95">Recent Leads</h3>
            <p className="text-[12px] text-grey-40 mt-0.5">Latest updates across teams</p>
          </div>
          <button onClick={() => navigate('/germany/admin/new-leads')} className="text-[12px] font-medium text-blue-90 hover:text-blue-90/70 transition-colors">
            View All Leads
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-grey-5 border-b border-grey-20">
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Sales Owner</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Service Owner</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.map((l) => (
                <tr key={l.id} className="border-b border-grey-10 last:border-b-0 hover:bg-blue-5 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-10 flex items-center justify-center text-[10px] font-bold text-blue-90">
                        {initials(l.studentName)}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-grey-95">{l.studentName}</p>
                        <p className="text-[12px] text-grey-60">{l.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[11px] font-medium text-blue-90 bg-blue-10 px-2.5 py-1 rounded-full">
                      {(l.serviceStatus || l.salesStatus || '-').toLowerCase().replaceAll(' ', '_')}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[13px] text-grey-60">{l.assignedToSales || l.salesPOC || '-'}</td>
                  <td className="px-5 py-4 text-[13px] text-grey-60">{l.assignedToService || l.servicePOC || '-'}</td>
                  <td className="px-5 py-4 text-[13px] text-grey-40">{l.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CsvUploadModal
        isOpen={showUserUpload}
        onClose={() => setShowUserUpload(false)}
        title="Upload users (CSV)"
        subtitle="Expected columns: Name, Email, Role, Team, Phone, Username, EmployeeId"
        expectedHeaders={['Name', 'Email', 'Role']}
        onImport={() => {}}
      />
      <CsvUploadModal
        isOpen={showPackageUpload}
        onClose={() => setShowPackageUpload(false)}
        title="Upload packages (CSV)"
        subtitle="Expected columns: Name, Description, Services, FloorPrice, MRP, Currency, Status"
        expectedHeaders={['Name', 'FloorPrice', 'MRP']}
        onImport={() => {}}
      />
    </div>
  )
}

