import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import SearchBar from '../../components/shared/SearchBar'
import DataTable from '../../components/shared/DataTable'
import { SalesStatusPill, ServiceStatusPill } from '../../components/shared/StatusPill'
import TaskButton from '../../components/shared/TaskButton'
import QuickView from '../../components/shared/QuickView'
import NewLeadModal from '../../components/shared/NewLeadModal'
import { leads } from '../../data/leads'
import { getTaskForStatus } from '../../utils/statusMappings'
import { Plus, ArrowUpDown } from 'lucide-react'
import Select from '../../components/shared/Select'
import DateRangeSelect from '../../components/shared/DateRangeSelect'

export default function SalesMyTasks() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [quickViewLead, setQuickViewLead] = useState(null)
  const [showNewLead, setShowNewLead] = useState(false)
  const [columnFilters, setColumnFilters] = useState({})

  const salesStatusOptions = useMemo(() => [...new Set(leads.map(l => l.salesStatus))], [])
  const serviceStatusOptions = useMemo(() => [...new Set(leads.map(l => l.serviceStatus))], [])

  const taskLeads = useMemo(() => {
    let result = leads.filter(l =>
      l.salesStatus === 'Draft' ||
      l.salesStatus === 'Sales form required' ||
      l.serviceStatus === 'QC Check' ||
      l.salesStatus === 'More info required' ||
      l.serviceStatus === 'Need More Info' ||
      l.serviceStatus === 'More Info Required'
    )
    
    // Apply column filters
    if (columnFilters.salesStatus?.length > 0) result = result.filter(l => columnFilters.salesStatus.includes(l.salesStatus))
    if (columnFilters.serviceStatus?.length > 0) result = result.filter(l => columnFilters.serviceStatus.includes(l.serviceStatus))
    return result
  }, [columnFilters])

  const columns = [
    { key: 'date', label: 'Last Edited Date', width: '110px', render: (val) => <span className="text-grey-40">{val}</span> },
    {
      key: 'studentName', label: 'Student',
      render: (val) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-grey-10 border border-grey-20 flex items-center justify-center text-[10px] font-semibold text-grey-60">
            {val.split(' ').map(n => n[0]).join('')}
          </div>
          <span className="font-medium text-grey-95">{val}</span>
        </div>
      ),
    },
    {
      key: 'salesStatus', 
      label: 'Sales Status', 
      render: (val) => <SalesStatusPill status={val} />,
      filterOptions: salesStatusOptions,
    },
    {
      key: 'serviceStatus', 
      label: 'Service Status',
      render: (val) => {
        if (!val || val === '-') return <span className="text-grey-40">-</span>
        return <ServiceStatusPill status={val} />
      },
      filterOptions: serviceStatusOptions,
    },
    {
      key: 'nextTask', label: 'Task',
      render: (_, row) => {
        const task = getTaskForStatus(row.salesStatus, row.serviceStatus, row.nextTask)
        if (task === '-') return <span className="text-grey-40">-</span>
        return <TaskButton label={task} href={`/germany/sales/lead/${row.id}`} />
      },
    },
  ]

  return (
    <div>
      <PageHeader title="My Tasks">
        <button
          onClick={() => setShowNewLead(true)}
          className="flex items-center gap-1.5 bg-blue-90 text-white px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-blue-50 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Student
        </button>
      </PageHeader>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <SearchBar placeholder="Search student" value={search} onChange={setSearch} className="w-[240px]" />
        </div>
        <div className="flex items-center gap-2">
          <DateRangeSelect value="All Dates" onChange={(val) => console.log('Date range:', val)} className="w-[180px]" />
          <Select options={['Newest First', 'Oldest First', 'A-Z', 'Z-A']} placeholder="Newest First" className="w-[150px]" icon={ArrowUpDown} />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={taskLeads}
        page={page}
        totalItems={taskLeads.length}
        pageSize={10}
        onPageChange={setPage}
        onRowClick={(row) => setQuickViewLead(row)}
        columnFilters={columnFilters}
        onColumnFilterChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
      />

      <QuickView
        isOpen={!!quickViewLead}
        onClose={() => setQuickViewLead(null)}
        lead={quickViewLead}
        detailPath={quickViewLead ? `/sales/lead/${quickViewLead.id}` : ''}
      />

      <NewLeadModal isOpen={showNewLead} onClose={() => setShowNewLead(false)} />
    </div>
  )
}
