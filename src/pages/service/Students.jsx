import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import SearchBar from '../../components/shared/SearchBar'
import FilterPills from '../../components/shared/FilterPills'
import DataTable from '../../components/shared/DataTable'
import MarginBadge from '../../components/e2e/MarginBadge'
import { e2eStudents } from '../../data/e2eStudents'
import { calculateStudentPnL } from '../../utils/pnlCalculator'
import { exportAllStudentsPnL } from '../../utils/excelExport'

export default function Students() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const myStudents = useMemo(
    () => e2eStudents.filter(s => s.servicePOC === 'Neha Gupta' || s.servicePOC === 'Amit Verma'),
    [],
  )

  const filtered = useMemo(() => {
    let list = myStudents

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        s => s.studentName.toLowerCase().includes(q) || s.university.toLowerCase().includes(q) || s.id.toLowerCase().includes(q),
      )
    }

    if (filter === 'in-progress') {
      list = list.filter(s => s.servicesOpted.some(svc => svc.status !== 'completed'))
    } else if (filter === 'completed') {
      list = list.filter(s => s.servicesOpted.every(svc => svc.status === 'completed'))
    }

    return list
  }, [myStudents, search, filter])

  const filterOptions = [
    { id: 'all', label: 'All', count: myStudents.length },
    {
      id: 'in-progress',
      label: 'In Progress',
      dot: true,
      dotColor: 'bg-amber',
      count: myStudents.filter(s => s.servicesOpted.some(svc => svc.status !== 'completed')).length,
    },
    {
      id: 'completed',
      label: 'Completed',
      dot: true,
      dotColor: 'bg-green',
      count: myStudents.filter(s => s.servicesOpted.every(svc => svc.status === 'completed')).length,
    },
  ]

  const columns = [
    {
      key: 'studentName',
      label: 'Name',
      render: (_, row) => (
        <div>
          <p className="text-[13px] font-medium text-grey-95">{row.studentName}</p>
          <p className="text-[11px] text-grey-40">{row.id}</p>
        </div>
      ),
    },
    { key: 'university', label: 'University' },
    { key: 'packageName', label: 'Package' },
    {
      key: 'pendingServices',
      label: 'Pending Services',
      render: (_, row) => {
        const count = row.servicesOpted.filter(svc => svc.status !== 'completed').length
        return count > 0 ? (
          <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-light text-amber">
            {count}
          </span>
        ) : (
          <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md bg-green-light text-green">
            Done
          </span>
        )
      },
    },
    {
      key: 'margin',
      label: 'Margin',
      render: (_, row) => {
        const pnl = calculateStudentPnL(row)
        return <MarginBadge margin={pnl.marginPct} size="sm" />
      },
    },
  ]

  return (
    <div>
      <PageHeader title="My Students">
        <button
          onClick={() => exportAllStudentsPnL(filtered)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold bg-blue-90 text-white rounded-lg hover:bg-blue-50 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Export Excel
        </button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        <SearchBar placeholder="Search students..." value={search} onChange={setSearch} className="w-full sm:w-72" />
        <FilterPills filters={filterOptions} activeFilter={filter} onFilterChange={setFilter} />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={row => navigate(`/e2e/service/student/${row.id}`)}
        emptyState={{ title: 'No students found', description: 'Try adjusting your search or filters.' }}
      />
    </div>
  )
}
