import { useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import SearchBar from '../../components/shared/SearchBar'
import DataTable from '../../components/shared/DataTable'
import { salesTeam, serviceTeam, pocTeam } from '../../data/team'
import { Calendar, SlidersHorizontal } from 'lucide-react'

const tabs = [
  { id: 'sales', label: 'Sales Team' },
  { id: 'service', label: 'Service Team' },
  { id: 'poc', label: 'POC' },
]

const avatar = (row) => (
  <div className="flex items-center gap-2.5">
    <div className="w-7 h-7 rounded-full bg-grey-10 border border-grey-20 flex items-center justify-center text-[10px] font-semibold text-grey-60">{row.initials}</div>
    <span className="font-medium text-grey-95">{row.name}</span>
  </div>
)

const dotNum = (val, color) => (
  <div className="flex items-center gap-1.5">
    <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
    <span className="text-grey-70">{typeof val === 'number' ? val.toLocaleString() : val}</span>
  </div>
)

const salesColumns = [
  { key: 'name', label: 'Team Member', render: (_, row) => avatar(row) },
  { key: 'totalLeads', label: 'Total Leads', render: (v) => <span className="font-medium">{v.toLocaleString()}</span> },
  { key: 'serviceableLeads', label: 'Serviceable', render: (v) => dotNum(v, 'bg-green') },
  { key: 'rejectedLeads', label: 'Rejected', render: (v) => dotNum(v, 'bg-red') },
  { key: 'pendingLeads', label: 'Pending', render: (v) => dotNum(v, 'bg-amber') },
  { key: 'upsellingLeads', label: 'Upselling', render: (v) => <span className="text-grey-60">{v}</span> },
  { key: 'conversionRate', label: 'Conversion', render: (v) => <span className="font-medium text-green">{v}%</span> },
]

const serviceColumns = [
  { key: 'name', label: 'Team Member', render: (_, row) => avatar(row) },
  { key: 'currentLeads', label: 'Current Leads', render: (v) => <span className="font-medium">{v.toLocaleString()}</span> },
  { key: 'activeStudents', label: 'Active Students', render: (v) => <span className="text-info font-medium">{v}</span> },
  { key: 'serviceable', label: 'Serviceable', render: (v) => dotNum(v, 'bg-green') },
  { key: 'rejected', label: 'Rejected', render: (v) => dotNum(v, 'bg-red') },
  { key: 'onHold', label: 'On Hold', render: (v) => dotNum(v, 'bg-amber') },
  { key: 'pending', label: 'Pending', render: (v) => dotNum(v, 'bg-grey-40') },
  { key: 'offerReceived', label: 'Offer Received', render: (v) => <span className="bg-green-light text-green text-[11px] font-medium px-2 py-0.5 rounded-full">{v}</span> },
]

const pocColumns = [
  { key: 'name', label: 'POC Name', render: (_, row) => avatar(row) },
  { key: 'assignedStudents', label: 'Students', render: (v) => <span className="font-medium">{v}</span> },
  { key: 'apsCount', label: 'APS' },
  { key: 'applicationsCount', label: 'Applications' },
  { key: 'offerCount', label: 'Offer' },
  { key: 'visaCount', label: 'Visa' },
  { key: 'preDepartureCount', label: 'Pre-Departure' },
  { key: 'avgResponseTime', label: 'Avg Response', render: (v) => <span className="text-grey-40">{v}</span> },
  { key: 'followUpCompliance', label: 'Follow-up %', render: (v) => <span className={`font-medium ${v >= 95 ? 'text-green' : v >= 90 ? 'text-amber' : 'text-red'}`}>{v}%</span> },
]

export default function AdminTeamDetails() {
  const [activeTab, setActiveTab] = useState('sales')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const cols = activeTab === 'sales' ? salesColumns : activeTab === 'service' ? serviceColumns : pocColumns
  const data = activeTab === 'sales' ? salesTeam : activeTab === 'service' ? serviceTeam : pocTeam

  return (
    <div>
      <PageHeader greeting title="Team Details" />
      <div className="flex items-center gap-0 mb-6 border-b border-grey-20">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setPage(1) }}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'text-blue-90 border-blue-90' : 'text-grey-40 border-transparent hover:text-grey-70'}`}>
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between mb-6">
        <SearchBar placeholder="Search team member" value={search} onChange={setSearch} className="w-[260px]" />
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-grey-60 border border-grey-20 hover:bg-grey-10"><Calendar className="w-3.5 h-3.5" /> Last 30 Days</button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-grey-60 border border-grey-20 hover:bg-grey-10"><SlidersHorizontal className="w-3.5 h-3.5" /> Filters</button>
        </div>
      </div>
      <DataTable columns={cols} data={data} page={page} totalItems={24} pageSize={10} onPageChange={setPage} />
    </div>
  )
}
