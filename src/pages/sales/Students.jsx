import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import SearchBar from '../../components/shared/SearchBar'
import DataTable from '../../components/shared/DataTable'
import MarginBadge from '../../components/e2e/MarginBadge'
import { e2eStudents } from '../../data/e2eStudents'
import { calculateStudentPnL, formatINR } from '../../utils/pnlCalculator'

export default function Students() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const myStudents = useMemo(
    () => e2eStudents.filter(s => s.salesPOC === 'Karan Mehta' || s.salesPOC === 'Raj Kumar'),
    [],
  )

  const filtered = useMemo(() => {
    if (!search) return myStudents
    const q = search.toLowerCase()
    return myStudents.filter(
      s => s.studentName.toLowerCase().includes(q) || s.university.toLowerCase().includes(q) || s.id.toLowerCase().includes(q),
    )
  }, [myStudents, search])

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
      key: 'totalAmountReceived',
      label: 'Total Received',
      render: (val) => <span className="font-medium text-grey-95">{formatINR(val)}</span>,
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
      <PageHeader title="My Students" />

      <div className="mb-5">
        <SearchBar placeholder="Search students..." value={search} onChange={setSearch} className="w-full sm:w-72" />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={row => navigate(`/sales/student/${row.id}`)}
        emptyState={{ title: 'No students found', description: 'Try adjusting your search.' }}
      />
    </div>
  )
}
