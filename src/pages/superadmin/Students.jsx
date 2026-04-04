import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Download, UserPlus } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import DataTable from '../../components/shared/DataTable'
import SearchBar from '../../components/shared/SearchBar'
import FilterPills from '../../components/shared/FilterPills'
import CsvUploadModal from '../../components/shared/CsvUploadModal'
import MarginBadge from '../../components/e2e/MarginBadge'
import { e2eStudents } from '../../data/e2eStudents'
import { calculateStudentPnL, formatINR } from '../../utils/pnlCalculator'
import { exportAllStudentsPnL } from '../../utils/excelExport'
import NewE2ELeadModal from '../../components/e2e/NewE2ELeadModal'

export default function Students() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [csvOpen, setCsvOpen] = useState(false)
  const [leadOpen, setLeadOpen] = useState(false)
  const [studentsData, setStudentsData] = useState(e2eStudents)
  const pageSize = 10

  const studentsWithPnL = useMemo(
    () => studentsData.map(s => ({ ...s, pnl: calculateStudentPnL(s) })),
    [studentsData]
  )

  const filters = [
    { id: 'all', label: 'All', count: studentsData.length },
    { id: 'active', label: 'Active', count: studentsData.filter(s => !s.isRefundCase).length },
    { id: 'refund', label: 'Refund Cases', count: studentsData.filter(s => s.isRefundCase).length, dot: true, dotColor: 'bg-red' },
    { id: 'vas', label: 'VAS Only', count: studentsData.filter(s => s.vasItems?.length > 0).length, dot: true, dotColor: 'bg-purple' },
  ]

  const nextId = useMemo(() => {
    const max = studentsData.reduce((acc, s) => {
      const n = Number(String(s.id || '').replace('E2E-', ''))
      return Number.isFinite(n) ? Math.max(acc, n) : acc
    }, 0)
    return `E2E-${String(max + 1).padStart(3, '0')}`
  }, [studentsData])

  const filtered = useMemo(() => {
    let list = studentsWithPnL
    if (filter === 'active') list = list.filter(s => !s.isRefundCase)
    else if (filter === 'refund') list = list.filter(s => s.isRefundCase)
    else if (filter === 'vas') list = list.filter(s => s.vasItems?.length > 0)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(s =>
        s.studentName.toLowerCase().includes(q) ||
        s.university.toLowerCase().includes(q) ||
        s.salesPOC.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
      )
    }
    return list
  }, [studentsWithPnL, filter, search])

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const columns = [
    {
      key: 'studentName',
      label: 'Name',
      render: (_, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-10 flex items-center justify-center text-[11px] font-bold text-blue-90 flex-shrink-0">
            {row.firstName?.[0]}{row.lastName?.[0]}
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
      render: (val) => <span className="font-medium text-grey-95">{formatINR(val)}</span>,
    },
    {
      key: 'margin',
      label: 'Margin',
      render: (_, row) => <MarginBadge margin={row.pnl.marginPct} size="sm" />,
    },
    { key: 'salesPOC', label: 'Sales POC' },
    { key: 'servicePOC', label: 'Service POC' },
  ]

  return (
    <div>
      <PageHeader title="E2E Students">
        <button
          onClick={() => setLeadOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold border border-blue-90 text-blue-90 rounded-lg hover:bg-blue-10 transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" /> Add New Lead
        </button>
        <button
          onClick={() => setCsvOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold border border-grey-20 rounded-lg text-grey-60 hover:border-blue-40 hover:text-grey-70 transition-colors"
        >
          <Upload className="w-3.5 h-3.5" /> CSV Upload
        </button>
        <button
          onClick={() => exportAllStudentsPnL(studentsData)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold bg-blue-90 text-white rounded-lg hover:bg-blue-50 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Export Excel
        </button>
      </PageHeader>

      <div className="flex items-center gap-4 mb-4">
        <SearchBar
          placeholder="Search students, university, POC..."
          value={search}
          onChange={(v) => { setSearch(v); setPage(1) }}
          className="w-[320px]"
        />
        <FilterPills filters={filters} activeFilter={filter} onFilterChange={(f) => { setFilter(f); setPage(1) }} />
      </div>

      <DataTable
        columns={columns}
        data={paged}
        page={page}
        pageSize={pageSize}
        totalItems={filtered.length}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/superadmin/student/${row.id}`)}
        emptyState={{ title: 'No students found', description: 'Try adjusting your search or filters.' }}
      />

      <CsvUploadModal
        isOpen={csvOpen}
        onClose={() => setCsvOpen(false)}
        title="Upload E2E Students CSV"
        subtitle="Upload a CSV file with student data. Preview before importing."
        expectedHeaders={['studentName', 'university', 'packageName', 'totalAmountReceived', 'salesPOC', 'servicePOC']}
        onImport={(rows) => console.log('Imported:', rows)}
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
