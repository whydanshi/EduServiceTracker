import { useState, useMemo } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import SearchBar from '../../components/shared/SearchBar'
import FilterPills from '../../components/shared/FilterPills'
import DataTable from '../../components/shared/DataTable'
import { SalesStatusPill, ServiceStatusPill } from '../../components/shared/StatusPill'
import TaskButton from '../../components/shared/TaskButton'
import QuickView from '../../components/shared/QuickView'
import { leads } from '../../data/leads'

// Canonical service statuses ordered by workflow stage
const STAGE_LABELS = {
  'Assigned':                 { label: 'Assigned',           dot: 'bg-info',    stage: '1 – Eligibility' },
  'Serviceable':              { label: 'Serviceable',         dot: 'bg-green',   stage: '1 done' },
  'Not Serviceable':          { label: 'Not Serviceable',     dot: 'bg-red',     stage: '–' },
  'Need More Info':           { label: 'Need More Info',      dot: 'bg-amber',   stage: '–' },
  'QC Check':                 { label: 'QC Check',           dot: 'bg-info',    stage: '2 – QC Review' },
  'QC Checked':               { label: 'QC Checked',         dot: 'bg-green',   stage: '2 done' },
  'Acknowledgement Sent':     { label: 'Ack. Sent',          dot: 'bg-purple',  stage: '3' },
  'Acknowledgement Received': { label: 'Ack. Received',      dot: 'bg-purple',  stage: '3' },
  'Converted':                { label: 'Converted',          dot: 'bg-green',   stage: '3 done' },
}

export default function ServiceNewLeads() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [quickViewLead, setQuickViewLead] = useState(null)
  const [columnFilters, setColumnFilters] = useState({})

  // Dynamic counts per status (excluding converted students)
  const preConversionLeads = useMemo(() => leads.filter(l => !(l.journey?.started || l.serviceStatus === 'Converted')), [])
  const counts = useMemo(() => {
    const c = {}
    preConversionLeads.forEach(l => { c[l.serviceStatus] = (c[l.serviceStatus] || 0) + 1 })
    return c
  }, [preConversionLeads])

  const filters = useMemo(() => [
    { id: 'all', label: 'All', count: preConversionLeads.length },
    // Stage 1
    { id: 'Assigned',       label: 'Assigned',        dot: true, dotColor: 'bg-info',   count: counts['Assigned'] || 0 },
    { id: 'Serviceable',    label: 'Serviceable',     dot: true, dotColor: 'bg-green',  count: counts['Serviceable'] || 0 },
    { id: 'Not Serviceable',label: 'Not Serviceable', dot: true, dotColor: 'bg-red',    count: counts['Not Serviceable'] || 0 },
    { id: 'Need More Info', label: 'Need More Info',  dot: true, dotColor: 'bg-amber',  count: counts['Need More Info'] || 0 },
    // Stage 2
    { id: 'QC Check',       label: 'QC Check',        dot: true, dotColor: 'bg-info',   count: counts['QC Check'] || 0 },
    { id: 'QC Checked',     label: 'QC Checked',      dot: true, dotColor: 'bg-green',  count: counts['QC Checked'] || 0 },
    // Stage 3
    { id: 'Acknowledgement Sent',     label: 'Ack. Sent',     dot: true, dotColor: 'bg-purple', count: counts['Acknowledgement Sent'] || 0 },
    { id: 'Acknowledgement Received', label: 'Ack. Received', dot: true, dotColor: 'bg-purple', count: counts['Acknowledgement Received'] || 0 },
    // Note: Converted students appear in Active Students, not here
  ], [counts])

  const salesStatusOptions = useMemo(() => [...new Set(leads.map(l => l.salesStatus))], [])
  const serviceStatusOptions = useMemo(() => Object.keys(STAGE_LABELS), [])

  const filtered = useMemo(() => {
    // Exclude converted students (they appear in Active Students)
    const preConversionLeads = leads.filter(l => !(l.journey?.started || l.serviceStatus === 'Converted'))
    
    let result = activeFilter === 'all' ? preConversionLeads : preConversionLeads.filter(l => l.serviceStatus === activeFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(l =>
        l.studentName.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.id?.toLowerCase().includes(q)
      )
    }
    if (columnFilters.salesStatus?.length > 0) result = result.filter(l => columnFilters.salesStatus.includes(l.salesStatus))
    if (columnFilters.serviceStatus?.length > 0) result = result.filter(l => columnFilters.serviceStatus.includes(l.serviceStatus))
    return result
  }, [activeFilter, search, columnFilters])

  // Determine the stage label to show for the subtitle
  const stageSubtitle = useMemo(() => {
    if (activeFilter === 'all') return 'All leads assigned to the service team (before conversion)'
    if (['Assigned'].includes(activeFilter)) return 'Stage 1 – Eligibility check: review profile submitted by sales'
    if (['Serviceable', 'Not Serviceable', 'Need More Info'].includes(activeFilter)) return 'Stage 1 complete'
    if (activeFilter === 'QC Check') return 'Stage 2 – QC review: sales Form 2 has been submitted'
    if (activeFilter === 'QC Checked') return 'Stage 2 complete – ready to send acknowledgement'
    if (['Acknowledgement Sent', 'Acknowledgement Received'].includes(activeFilter)) return 'Stage 3 – Acknowledgement (before conversion)'
    return ''
  }, [activeFilter])

  const columns = [
    {
      key: 'date', label: 'Date', width: '90px',
      render: (val) => <span className="text-grey-40 text-[12px]">{val}</span>,
    },
    {
      key: 'studentName', label: 'Student',
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-blue-10 border border-blue-40 flex items-center justify-center text-[10px] font-semibold text-blue-90 flex-shrink-0">
            {val.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="font-medium text-grey-95 text-[13px]">{val}</p>
            <p className="text-[11px] text-grey-40">{row.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'salesPOC', label: 'Sales POC',
      render: (val) => <span className="text-[13px] text-grey-60">{val || '—'}</span>,
    },
    {
      key: 'salesStatus', label: 'Sales Status',
      filterOptions: salesStatusOptions,
      render: (val) => <SalesStatusPill status={val} />,
    },
    {
      key: 'serviceStatus', label: 'Service Status',
      filterOptions: serviceStatusOptions,
      render: (val) => <ServiceStatusPill status={val} />,
    },
    {
      key: 'id', label: 'Action',
      render: (val, row) => {
        const closed = ['Not Serviceable', 'Rejected', 'Lost'].includes(row.serviceStatus)
        if (closed) return <span className="text-[12px] text-grey-40">Closed</span>
        return <TaskButton label="View Details" href={`/germany/service/lead/${row.id}`} />
      },
    },
  ]

  return (
    <div>
      <PageHeader title="Leads" subtitle={stageSubtitle} />

      {/* Filter pills */}
      <div className="mb-5 overflow-x-auto">
        <FilterPills filters={filters} activeFilter={activeFilter} onFilterChange={(f) => { setActiveFilter(f); setPage(1) }} />
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar placeholder="Search by name, email or ID" value={search} onChange={setSearch} className="w-[280px]" />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        page={page}
        totalItems={filtered.length}
        pageSize={10}
        onPageChange={setPage}
        onRowClick={(row) => setQuickViewLead(row)}
        columnFilters={columnFilters}
        onColumnFilterChange={(key, val) => setColumnFilters(prev => ({ ...prev, [key]: val }))}
        emptyState={
          <div className="py-14 text-center">
            <p className="text-[14px] font-medium text-grey-60 mb-1">No leads found</p>
            <p className="text-[12px] text-grey-40">Try adjusting your filters or search</p>
          </div>
        }
      />

      <QuickView
        isOpen={!!quickViewLead}
        onClose={() => setQuickViewLead(null)}
        lead={quickViewLead}
        detailPath={quickViewLead ? `/service/lead/${quickViewLead.id}` : ''}
      />
    </div>
  )
}
