import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, UserPlus } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import SearchBar from '../../components/shared/SearchBar'
import FilterPills from '../../components/shared/FilterPills'
import DataTable from '../../components/shared/DataTable'
import MarginBadge from '../../components/e2e/MarginBadge'
import { e2eStudents } from '../../data/e2eStudents'
import { calculateStudentPnL, formatINR } from '../../utils/pnlCalculator'
import { exportAllStudentsPnL } from '../../utils/excelExport'
import NewE2ELeadModal from '../../components/e2e/NewE2ELeadModal'

export default function Students() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [leadOpen, setLeadOpen] = useState(false)
  const [studentsData, setStudentsData] = useState(e2eStudents)

  const studentsWithPnL = useMemo(
    () => studentsData.map(s => ({ ...s, pnl: calculateStudentPnL(s) })),
    [studentsData],
  )

  const filtered = useMemo(() => {
    let list = studentsWithPnL

    if (activeFilter === 'active') {
      list = list.filter(s => !s.isRefundCase)
    } else if (activeFilter === 'refund') {
      list = list.filter(s => s.isRefundCase)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        s =>
          s.studentName.toLowerCase().includes(q) ||
          s.university.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q),
      )
    }

    return list
  }, [studentsWithPnL, activeFilter, search])

  const filters = [
    { id: 'all', label: 'All', count: studentsWithPnL.length },
    { id: 'active', label: 'Active', count: studentsWithPnL.filter(s => !s.isRefundCase).length, dot: true, dotColor: 'bg-green' },
    { id: 'refund', label: 'Refund Cases', count: studentsWithPnL.filter(s => s.isRefundCase).length, dot: true, dotColor: 'bg-red' },
  ]

  const nextId = useMemo(() => {
    const max = studentsData.reduce((acc, s) => {
      const n = Number(String(s.id || '').replace('E2E-', ''))
      return Number.isFinite(n) ? Math.max(acc, n) : acc
    }, 0)
    return `E2E-${String(max + 1).padStart(3, '0')}`
  }, [studentsData])

  const columns = [
    {
      key: 'studentName',
      label: 'Name',
      render: (_, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-10 flex items-center justify-center flex-shrink-0">
            <span className="text-[11px] font-bold text-blue-90">
              {row.firstName?.[0]}{row.lastName?.[0]}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-grey-95 truncate">{row.studentName}</p>
            <p className="text-[11px] text-grey-40">{row.id}</p>
          </div>
        </div>
      ),
    },
    { key: 'university', label: 'University' },
    { key: 'packageName', label: 'Package' },
    {
      key: 'totalAmountReceived',
      label: 'Total Received',
      render: v => <span className="font-medium text-grey-95">{formatINR(v)}</span>,
    },
    {
      key: 'margin',
      label: 'Margin',
      render: (_, row) => <MarginBadge margin={row.pnl.marginPct} size="sm" />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, row) => {
        if (row.isRefundCase) {
          return (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-light text-red">
              Refund
            </span>
          )
        }
        const allDone = row.servicesOpted?.every(s => s.status === 'completed')
        return (
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${allDone ? 'bg-green-light text-green' : 'bg-amber-light text-amber'}`}>
            {allDone ? 'Completed' : 'In Progress'}
          </span>
        )
      },
    },
  ]

  return (
    <div>
      <PageHeader title="Students">
        <button
          onClick={() => setLeadOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold border border-blue-90 text-blue-90 rounded-lg hover:bg-blue-10 transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" /> Add New Lead
        </button>
        <button
          onClick={() => exportAllStudentsPnL(filtered)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold bg-blue-90 text-white rounded-lg hover:bg-blue-50 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Export Excel
        </button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <SearchBar
          placeholder="Search by name, university or ID..."
          value={search}
          onChange={v => { setSearch(v); setPage(1) }}
          className="w-full sm:w-72"
        />
        <FilterPills filters={filters} activeFilter={activeFilter} onFilterChange={f => { setActiveFilter(f); setPage(1) }} />
      </div>

      <DataTable
        columns={columns}
        data={filtered.slice((page - 1) * 10, page * 10)}
        page={page}
        totalItems={filtered.length}
        pageSize={10}
        onPageChange={setPage}
        onRowClick={row => navigate(`/e2e/admin/student/${row.id}`)}
        emptyState={{ title: 'No students found', description: 'Try adjusting your search or filters.' }}
      />
      <NewE2ELeadModal
        isOpen={leadOpen}
        onClose={() => setLeadOpen(false)}
        nextId={nextId}
        onSubmit={(newLead) => {
          setStudentsData(prev => [newLead, ...prev])
          setPage(1)
        }}
      />
    </div>
  )
}
