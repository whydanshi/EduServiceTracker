import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import SearchBar from '../../components/shared/SearchBar'
import DataTable from '../../components/shared/DataTable'
import { SalesStatusPill, ServiceStatusPill } from '../../components/shared/StatusPill'
import TaskButton from '../../components/shared/TaskButton'
import QuickView from '../../components/shared/QuickView'
import { leads } from '../../data/leads'
import { getTaskForStatus } from '../../utils/statusMappings'
import { ArrowUpDown } from 'lucide-react'
import Select from '../../components/shared/Select'
import DateRangeSelect from '../../components/shared/DateRangeSelect'

export default function AdminMyTasks() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [quickViewLead, setQuickViewLead] = useState(null)
  const [columnFilters, setColumnFilters] = useState({})

  const salesStatusOptions = useMemo(() => [...new Set(leads.map(l => l.salesStatus))], [])
  const serviceStatusOptions = useMemo(() => [...new Set(leads.map(l => l.serviceStatus))], [])

  const taskLeads = useMemo(() => {
    let result = leads.filter(l =>
      l.assignedToService === 'Unassigned' || ['In Review', 'Pending Evaluation'].includes(l.serviceStatus)
    )
    if (columnFilters.salesStatus?.length > 0) result = result.filter(l => columnFilters.salesStatus.includes(l.salesStatus))
    if (columnFilters.serviceStatus?.length > 0) result = result.filter(l => columnFilters.serviceStatus.includes(l.serviceStatus))
    return result
  }, [columnFilters])

  const columns = [
    { key: 'date', label: 'Date', width: '90px', render: (val) => <span className="text-grey-40">{val}</span> },
    {
      key: 'studentName',
      label: 'Student',
      render: (val) => (
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
    { key: 'assignedToService', label: 'Service POC', render: (val) => <span className="text-grey-60">{val}</span> },
    { key: 'comments', label: 'Comments', render: (val) => <span className="text-grey-40 truncate max-w-[140px] block text-[12px]">{val || '-'}</span> },
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
      <PageHeader title="My Tasks" />

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
        onColumnFilterChange={(key, val) => setColumnFilters(prev => ({ ...prev, [key]: val }))}
      />

      <QuickView
        isOpen={!!quickViewLead}
        onClose={() => setQuickViewLead(null)}
        lead={quickViewLead}
        detailPath={quickViewLead ? `/admin/lead/${quickViewLead.id}` : ''}
      />
    </div>
  )
}
