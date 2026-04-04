import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import SearchBar from '../../components/shared/SearchBar'
import FilterPills from '../../components/shared/FilterPills'
import DataTable from '../../components/shared/DataTable'
import { SalesStatusPill, ServiceStatusPill } from '../../components/shared/StatusPill'
import TaskButton from '../../components/shared/TaskButton'
import QuickView from '../../components/shared/QuickView'
import Modal from '../../components/shared/Modal'
import { leads } from '../../data/leads'
import { serviceTeam } from '../../data/team'
import { getTaskForStatus } from '../../utils/statusMappings'
import { useToast } from '../../components/shared/Toast'
import { Calendar, Download, ChevronDown } from 'lucide-react'

const SERVICE_MEMBERS = serviceTeam.map(m => m.name)

const getFilters = (preConversionLeads) => [
  { id: 'all', label: 'All Statuses', count: preConversionLeads.length },
  { id: 'New', label: 'New', dot: true, dotColor: 'bg-purple' },
  { id: 'Assigned', label: 'Assigned', dot: true, dotColor: 'bg-info' },
  { id: 'In Review', label: 'In Review', dot: true, dotColor: 'bg-info' },
  { id: 'Serviceable', label: 'Serviceable', dot: true, dotColor: 'bg-green' },
  { id: 'QC Check', label: 'QC Check', dot: true, dotColor: 'bg-info' },
  { id: 'On Hold', label: 'On Hold', dot: true, dotColor: 'bg-amber' },
  { id: 'Not Serviceable', label: 'Not Serviceable', dot: true, dotColor: 'bg-red' },
]

function AssignDropdown({ lead, onAssign, onRequestAssign }) {
  const [open, setOpen] = useState(false)
  const [selectedName, setSelectedName] = useState(null)

  const handleOpen = () => {
    setOpen(true)
    setSelectedName(null)
  }

  if (lead.serviceStatus === 'New') {
    return (
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => { const next = !open; setOpen(next); if (next) setSelectedName(null) }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border border-purple bg-purple-light text-purple hover:bg-[#EDE9FE] transition-colors"
        >
          Assign <ChevronDown className="w-3 h-3" />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => { setOpen(false); setSelectedName(null) }} />
            <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-grey-20 rounded-xl shadow-lg z-30 overflow-hidden">
              <button
                onClick={() => { onAssign(lead, '__self__'); setOpen(false) }}
                className="w-full text-left px-4 py-2.5 text-[13px] font-normal text-grey-95 hover:bg-grey-5 transition-colors border-b border-grey-10"
              >
                Review Myself
              </button>
              <div className="max-h-40 overflow-y-auto">
                {SERVICE_MEMBERS.map(name => (
                  <button
                    key={name}
                    onClick={() => setSelectedName(name)}
                    className={`w-full text-left px-4 py-2 text-[13px] transition-colors ${selectedName === name ? 'bg-blue-10 text-blue-90 font-medium' : 'text-grey-70 hover:bg-grey-5'}`}
                  >
                    {name}
                  </button>
                ))}
              </div>
              <div className="border-t border-grey-20 p-3 bg-grey-5">
                {selectedName ? (
                  <p className="text-[11px] text-grey-50 mb-2">Assign to <span className="font-semibold text-grey-70">{selectedName}</span></p>
                ) : (
                  <p className="text-[11px] text-grey-40 mb-2">Select a person above, then press Assign</p>
                )}
                <button
                  onClick={() => {
                    if (!selectedName) return
                    onRequestAssign(lead, selectedName)
                    setOpen(false)
                    setSelectedName(null)
                  }}
                  disabled={!selectedName}
                  className="w-full py-2.5 rounded-lg text-[13px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-blue-90 text-white hover:bg-blue-50 disabled:hover:bg-blue-90"
                >
                  Assign
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  if (lead.serviceStatus === 'Assigned') {
    return (
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <span className="text-[12px] font-medium text-grey-70">{lead.assignedToService || '—'}</span>
        <select
          className="appearance-none border-2 border-info rounded-lg pl-2.5 pr-8 py-1.5 text-[12px] font-medium text-info bg-info-light cursor-pointer hover:bg-[#E0F2FE] transition-colors min-w-[110px]"
          value=""
          onChange={(e) => e.target.value && onRequestAssign(lead, e.target.value)}
        >
          <option value="">Change assignee</option>
          {SERVICE_MEMBERS.filter(m => m !== lead.assignedToService).map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <span className="text-[12px] text-grey-50">
      {lead.assignedToService || '—'}
    </span>
  )
}

export default function AdminAllLeads() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [activeFilter, setActiveFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [quickViewLead, setQuickViewLead] = useState(null)
  const [columnFilters, setColumnFilters] = useState({})
  const [assignments, setAssignments] = useState({})
  const [pendingAssign, setPendingAssign] = useState(null)

  const preConversionLeads = useMemo(() => leads.filter(l => !(l.journey?.started || l.serviceStatus === 'Converted')), [])

  const leadsWithAssignments = useMemo(() => preConversionLeads.map(l => {
    const a = assignments[l.id]
    if (!a) return l
    return { ...l, serviceStatus: a.status, assignedToService: a.assignee }
  }), [preConversionLeads, assignments])

  const filters = useMemo(() => getFilters(leadsWithAssignments), [leadsWithAssignments])

  const salesStatusOptions = useMemo(() => [...new Set(leadsWithAssignments.map(l => l.salesStatus))], [leadsWithAssignments])
  const serviceStatusOptions = useMemo(() => [...new Set(leadsWithAssignments.map(l => l.serviceStatus))], [leadsWithAssignments])

  const filtered = useMemo(() => {
    let result = activeFilter === 'all' ? leadsWithAssignments : leadsWithAssignments.filter(l => l.serviceStatus === activeFilter)
    if (columnFilters.salesStatus?.length > 0) result = result.filter(l => columnFilters.salesStatus.includes(l.salesStatus))
    if (columnFilters.serviceStatus?.length > 0) result = result.filter(l => columnFilters.serviceStatus.includes(l.serviceStatus))
    return result
  }, [activeFilter, columnFilters, leadsWithAssignments])

  const handleAssign = (lead, value) => {
    if (value === '__self__') {
      setAssignments(prev => ({ ...prev, [lead.id]: { status: 'In Review', assignee: 'Admin' } }))
      toast({ title: 'Reviewing lead', description: `You are now reviewing ${lead.studentName}`, type: 'info' })
      navigate(`/germany/admin/lead/${lead.id}`)
    } else {
      setAssignments(prev => ({ ...prev, [lead.id]: { status: 'Assigned', assignee: value } }))
      toast({ title: 'Lead assigned', description: `${lead.studentName} assigned to ${value}`, type: 'success' })
    }
  }

  const handleRequestAssign = (lead, assigneeName) => {
    setPendingAssign({ lead, assigneeName })
  }

  const handleConfirmAssign = () => {
    if (!pendingAssign) return
    handleAssign(pendingAssign.lead, pendingAssign.assigneeName)
    setPendingAssign(null)
  }

  const columns = [
    { key: 'date', label: 'Date', width: '90px', render: (val) => <span className="text-grey-40">{val}</span> },
    {
      key: 'studentName',
      label: 'Student',
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-grey-10 border border-grey-20 flex items-center justify-center text-[10px] font-semibold text-grey-60">
            {val.split(' ').map(n => n[0]).join('')}
          </div>
          <span className="font-medium text-grey-95">{val}</span>
        </div>
      ),
    },
    { key: 'salesStatus', label: 'Sales Status', filterOptions: salesStatusOptions, render: (val) => <SalesStatusPill status={val} /> },
    { key: 'serviceStatus', label: 'Service Status', filterOptions: serviceStatusOptions, render: (val) => <ServiceStatusPill status={val} /> },
    {
      key: 'assign',
      label: 'Assign',
      width: '200px',
      render: (_val, row) => <AssignDropdown lead={row} onAssign={handleAssign} onRequestAssign={handleRequestAssign} />,
    },
    {
      key: 'nextTask',
      label: 'Task',
      render: (val, row) => {
        const task = getTaskForStatus(row.salesStatus, row.serviceStatus, row.nextTask)
        if (task === 'Sale closed' || task === '-') return <span className="text-grey-40 text-[12px]">{task}</span>
        return <TaskButton label={task} href={`/germany/admin/lead/${row.id}`} />
      },
    },
  ]

  return (
    <div>
      <PageHeader greeting title="Leads" subtitle="Students whose service has not started yet" />

      <div className="mb-5">
        <FilterPills filters={filters} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      </div>

      <div className="flex items-center justify-between mb-6">
        <SearchBar placeholder="Search by student, ID, or phone..." value={search} onChange={setSearch} className="w-[300px]" />
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-grey-60 border border-grey-20 hover:bg-grey-10 transition-colors">
            <Calendar className="w-3.5 h-3.5" /> Date Range
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-grey-60 border border-grey-20 hover:bg-grey-10 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
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
      />

      <QuickView
        isOpen={!!quickViewLead}
        onClose={() => setQuickViewLead(null)}
        lead={quickViewLead}
        detailPath={quickViewLead ? `/admin/lead/${quickViewLead.id}` : ''}
        readOnly={true}
      />

      <Modal
        isOpen={!!pendingAssign}
        onClose={() => setPendingAssign(null)}
        title="Confirm assignment"
        maxWidth="max-w-md"
      >
        <div className="space-y-5">
          <p className="text-[14px] text-grey-80">
            Do you want to assign <span className="font-semibold text-grey-95">{pendingAssign?.lead?.studentName}</span> to{' '}
            <span className="font-bold text-blue-90 text-[15px]">{pendingAssign?.assigneeName}</span>?
          </p>
          <div className="flex justify-end gap-3 pt-1">
            <button
              onClick={() => setPendingAssign(null)}
              className="px-4 py-2.5 rounded-lg text-[13px] font-medium text-grey-60 hover:bg-grey-10 border border-grey-20"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmAssign}
              className="px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-blue-90 text-white hover:bg-blue-50"
            >
              OK
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
