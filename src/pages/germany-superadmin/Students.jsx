import { useState, useMemo, useEffect } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import SearchBar from '../../components/shared/SearchBar'
import FilterPills from '../../components/shared/FilterPills'
import DataTable from '../../components/shared/DataTable'
import QuickView from '../../components/shared/QuickView'
import { SalesStatusPill, ServiceStatusPill } from '../../components/shared/StatusPill'
import { relativeTime, fullDate } from '../../utils/relativeTime'
import { readJson, writeJson } from '../../utils/storage'
import { students, journeyStages } from '../../data/students'
import { leads } from '../../data/leads'
import { AlertCircle, ArrowUpDown, Eye, GraduationCap } from 'lucide-react'

const stageColors = {
  'APS Initiation': { bg: 'bg-info-light', text: 'text-info' },
  'APS In Progress': { bg: 'bg-info-light', text: 'text-info' },
  'Applications Submitted': { bg: 'bg-purple-light', text: 'text-purple' },
  'Offer Received': { bg: 'bg-green-light', text: 'text-green' },
  'Visa Process': { bg: 'bg-amber-light', text: 'text-amber' },
  'Pre-Departure': { bg: 'bg-green-light', text: 'text-green' },
}

const isOverdue = (dateStr) => new Date(dateStr) < new Date()

const studentFilters = [
  { id: 'all', label: 'All', count: students.length },
  ...journeyStages.map(s => ({
    id: s,
    label: s,
    dot: true,
    dotColor: stageColors[s]?.text?.replace('text-', 'bg-') || 'bg-grey-40',
    count: students.filter(st => st.currentStage === s).length,
  })),
]

const leadFilters = [
  { id: 'all', label: 'All Statuses', count: leads.length },
  { id: 'Assigned', label: 'Assigned', dot: true, dotColor: 'bg-info', count: leads.filter(l => l.serviceStatus === 'Assigned').length },
  { id: 'In Review', label: 'In Review', dot: true, dotColor: 'bg-info', count: leads.filter(l => l.serviceStatus === 'In Review').length },
  { id: 'Serviceable', label: 'Serviceable', dot: true, dotColor: 'bg-green', count: leads.filter(l => l.serviceStatus === 'Serviceable').length },
  { id: 'Quality Check', label: 'Quality Check', dot: true, dotColor: 'bg-info', count: leads.filter(l => l.serviceStatus === 'Quality Check').length },
  { id: 'On Hold', label: 'On Hold', dot: true, dotColor: 'bg-amber', count: leads.filter(l => l.serviceStatus === 'On Hold').length },
  { id: 'Rejected', label: 'Rejected', dot: true, dotColor: 'bg-red', count: leads.filter(l => l.serviceStatus === 'Rejected').length },
]

const studentColumns = [
  {
    key: 'name',
    label: 'Student Name',
    render: (val) => (
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-grey-10 border border-grey-20 flex items-center justify-center text-[10px] font-semibold text-grey-60">
          {val.split(' ').map(n => n[0]).join('')}
        </div>
        <span className="font-medium text-grey-95">{val}</span>
      </div>
    ),
  },
  { key: 'servicePOC', label: 'Service POC', render: (val) => <span className="text-grey-60">{val}</span> },
  {
    key: 'currentStage',
    label: 'Current Stage',
    render: (val) => {
      const c = stageColors[val] || { bg: 'bg-grey-10', text: 'text-grey-60' }
      return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${c.bg} ${c.text}`}>{val}</span>
    },
  },
  { key: 'lastFollowUp', label: 'Last Follow-up', render: (val) => <span className="text-grey-40">{val}</span> },
  {
    key: 'nextFollowUpDue',
    label: 'Next Follow-up Due',
    render: (val) => {
      const overdue = isOverdue(val)
      return (
        <div className={`flex items-center gap-1 ${overdue ? 'text-red font-medium' : 'text-grey-70'}`}>
          {overdue && <AlertCircle className="w-3 h-3" />}
          <span className="text-[13px]">{val}</span>
        </div>
      )
    },
  },
  {
    key: 'paymentStatus',
    label: 'Payment',
    render: (val) => (
      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${val === 'Full' ? 'bg-green-light text-green' : 'bg-amber-light text-amber'}`}>{val}</span>
    ),
  },
]

const sortOptions = [
  { id: 'name-asc', label: 'Name A–Z' },
  { id: 'name-desc', label: 'Name Z–A' },
  { id: 'stage', label: 'Stage' },
  { id: 'date-desc', label: 'Newest first' },
  { id: 'date-asc', label: 'Oldest first' },
]

function applySorting(data, sortBy) {
  const sorted = [...data]
  switch (sortBy) {
    case 'name-asc':
      return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    case 'name-desc':
      return sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''))
    case 'stage':
      return sorted.sort((a, b) => (a.currentStage || '').localeCompare(b.currentStage || ''))
    case 'date-desc':
      return sorted.sort((a, b) => {
        const da = new Date(a.lastFollowUp || a.nextFollowUpDue || 0)
        const db = new Date(b.lastFollowUp || b.nextFollowUpDue || 0)
        return db.getTime() - da.getTime()
      })
    case 'date-asc':
      return sorted.sort((a, b) => {
        const da = new Date(a.lastFollowUp || a.nextFollowUpDue || 0)
        const db = new Date(b.lastFollowUp || b.nextFollowUpDue || 0)
        return da.getTime() - db.getTime()
      })
    default:
      return sorted
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const STU_PREFS_KEY = 'leverage.superadmin.students.prefs'

export default function SuperAdminStudents() {
  const [prefs] = useState(() => readJson(STU_PREFS_KEY, {}))
  const [tab, setTab] = useState(prefs.tab || 'active')
  const [activeStudentFilter, setActiveStudentFilter] = useState('all')
  const [leadFilter, setLeadFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [studentPage, setStudentPage] = useState(1)
  const [leadPage, setLeadPage] = useState(1)
  const [studentSortBy, setStudentSortBy] = useState(prefs.sortBy || 'name-asc')
  const [leadColumnFilters, setLeadColumnFilters] = useState({})
  const [quickViewLead, setQuickViewLead] = useState(null)

  useEffect(() => {
    writeJson(STU_PREFS_KEY, { tab, sortBy: studentSortBy })
  }, [tab, studentSortBy])

  const salesStatusOptions = useMemo(() => [...new Set(leads.map(l => l.salesStatus))], [])
  const serviceStatusOptions = useMemo(() => [...new Set(leads.map(l => l.serviceStatus))], [])

  const leadColumnsWithFilters = useMemo(() => [
    { key: 'date', label: 'Date', width: '90px', render: (val) => <span className="text-grey-40">{val}</span> },
    {
      key: 'studentName',
      label: 'Student',
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-grey-10 border border-grey-20 flex items-center justify-center text-[10px] font-semibold text-grey-60">
            {val.split(' ').map(n => n[0]).join('')}
          </div>
          <span 
            className="font-medium text-grey-95 cursor-pointer hover:text-blue-90 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              setQuickViewLead(row)
            }}
          >
            {val}
          </span>
        </div>
      ),
    },
    { key: 'salesStatus', label: 'Sales Status', filterOptions: salesStatusOptions, render: (val) => <SalesStatusPill status={val} /> },
    { key: 'serviceStatus', label: 'Service Status', filterOptions: serviceStatusOptions, render: (val) => <ServiceStatusPill status={val} /> },
    {
      key: 'lastEdited',
      label: 'Last edited on',
      render: (val, row) => <span className="text-grey-40 text-[12px]" title={fullDate(row.date || row.lastEdited)}>{relativeTime(row.date || row.lastEdited)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (val, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            window.open(`/admin/lead/${row.id}?standalone=true`, '_blank')
          }}
          className="p-2 rounded-lg border border-grey-20 hover:bg-grey-10 transition-colors"
          title="View in new tab"
        >
          <Eye className="w-4 h-4 text-grey-60" />
        </button>
      ),
    },
  ], [salesStatusOptions, serviceStatusOptions])

  const filteredStudents = useMemo(() => {
    let data = activeStudentFilter === 'all' ? students : students.filter(s => s.currentStage === activeStudentFilter)
    const q = search.trim().toLowerCase()
    if (q) data = data.filter(s => [s.name, s.servicePOC, s.currentStage].some(v => (v || '').toLowerCase().includes(q)))
    return applySorting(data, studentSortBy)
  }, [activeStudentFilter, search, studentSortBy])

  const filteredLeads = useMemo(() => {
    let data = leadFilter === 'all' ? leads : leads.filter(l => l.serviceStatus === leadFilter)
    if (leadColumnFilters.salesStatus?.length > 0) data = data.filter(l => leadColumnFilters.salesStatus.includes(l.salesStatus))
    if (leadColumnFilters.serviceStatus?.length > 0) data = data.filter(l => leadColumnFilters.serviceStatus.includes(l.serviceStatus))
    const q = search.trim().toLowerCase()
    if (q) data = data.filter(l => [l.studentName, l.salesStatus, l.serviceStatus].some(v => (v || '').toLowerCase().includes(q)))
    return data
  }, [leadFilter, search, leadColumnFilters])

  return (
    <div>
      <PageHeader title="Students" subtitle="View active students and leads across the organisation" />

      <div className="flex items-center gap-0 mb-6 border-b border-grey-20">
        <button
          onClick={() => { setTab('active'); setSearch('') }}
          className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${tab === 'active' ? 'text-blue-90 border-blue-90' : 'text-grey-40 border-transparent hover:text-grey-70'}`}
        >
          Active Students
        </button>
        <button
          onClick={() => { setTab('leads'); setSearch('') }}
          className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${tab === 'leads' ? 'text-blue-90 border-blue-90' : 'text-grey-40 border-transparent hover:text-grey-70'}`}
        >
          Leads
        </button>
      </div>

      {tab === 'active' ? (
        <>
          <div className="mb-4">
            <FilterPills filters={studentFilters} activeFilter={activeStudentFilter} onFilterChange={(id) => { setActiveStudentFilter(id); setStudentPage(1) }} />
          </div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <SearchBar placeholder="Search students..." value={search} onChange={setSearch} className="w-[300px]" />
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-grey-40" />
                <select
                  value={studentSortBy}
                  onChange={(e) => setStudentSortBy(e.target.value)}
                  className="text-[12px] text-grey-60 bg-transparent border border-grey-20 rounded-lg px-2 py-1.5 outline-none cursor-pointer hover:border-grey-40 transition-colors"
                >
                  {sortOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <p className="text-[12px] text-grey-40">{filteredStudents.length} students</p>
          </div>
          <DataTable
            columns={studentColumns}
            data={filteredStudents}
            page={studentPage}
            totalItems={filteredStudents.length}
            pageSize={10}
            onPageChange={setStudentPage}
            emptyState={{
              icon: GraduationCap,
              title: 'No active students',
              description: 'Active students will appear here once leads are converted.',
            }}
          />
        </>
      ) : (
        <>
          <div className="mb-4">
            <FilterPills filters={leadFilters} activeFilter={leadFilter} onFilterChange={(id) => { setLeadFilter(id); setLeadPage(1) }} />
          </div>
          <div className="flex items-center justify-between mb-6">
            <SearchBar placeholder="Search leads..." value={search} onChange={setSearch} className="w-[300px]" />
            <p className="text-[12px] text-grey-40">{filteredLeads.length} leads</p>
          </div>
          <DataTable
            columns={leadColumnsWithFilters}
            data={filteredLeads}
            page={leadPage}
            totalItems={filteredLeads.length}
            pageSize={10}
            onPageChange={setLeadPage}
            onRowClick={(row) => setQuickViewLead(row)}
            columnFilters={leadColumnFilters}
            onColumnFilterChange={(key, val) => setLeadColumnFilters(prev => ({ ...prev, [key]: val }))}
            emptyState={{
              title: 'No leads found',
              description: 'Leads matching your filters will appear here.',
            }}
          />
        </>
      )}

      <QuickView
        isOpen={!!quickViewLead}
        onClose={() => setQuickViewLead(null)}
        lead={quickViewLead}
        detailPath={quickViewLead ? `/admin/lead/${quickViewLead.id}` : ''}
      />
    </div>
  )
}
