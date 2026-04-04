import { useMemo } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import DataTable from '../../components/shared/DataTable'
import MarginBadge from '../../components/e2e/MarginBadge'
import { e2eStudents } from '../../data/e2eStudents'
import { calculateStudentPnL } from '../../utils/pnlCalculator'

export default function Team() {
  const pocData = useMemo(() => {
    const map = {}
    for (const student of e2eStudents) {
      const poc = student.salesPOC
      const pnl = calculateStudentPnL(student)
      if (!map[poc]) map[poc] = { id: poc, name: poc, students: 0, totalMargin: 0, margins: [] }
      map[poc].students++
      map[poc].totalMargin += pnl.marginPct
      map[poc].margins.push(pnl.marginPct)
    }
    return Object.values(map).map(p => ({
      ...p,
      avgMargin: p.totalMargin / p.students,
      highestMargin: Math.max(...p.margins),
      lowestMargin: Math.min(...p.margins),
    }))
  }, [])

  const columns = [
    {
      key: 'name',
      label: 'Sales POC',
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-10 flex items-center justify-center text-[11px] font-bold text-blue-90 flex-shrink-0">
            {val.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="text-[13px] font-medium text-grey-95">{val}</p>
            {row.avgMargin < 10 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red">
                <span className="w-1.5 h-1.5 rounded-full bg-red" />
                Below 10% target
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'students',
      label: 'Students',
      render: (val) => <span className="text-[13px] font-semibold text-grey-95">{val}</span>,
    },
    {
      key: 'avgMargin',
      label: 'Avg Margin',
      render: (val) => <MarginBadge margin={val} size="sm" />,
    },
    {
      key: 'highestMargin',
      label: 'Highest',
      render: (val) => <MarginBadge margin={val} size="sm" />,
    },
    {
      key: 'lowestMargin',
      label: 'Lowest',
      render: (val) => <MarginBadge margin={val} size="sm" />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, row) => (
        row.avgMargin < 10 ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-light text-red">
            <span className="w-1.5 h-1.5 rounded-full bg-red" />
            Needs Review
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-light text-green">
            <span className="w-1.5 h-1.5 rounded-full bg-green" />
            On Track
          </span>
        )
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Team & POC Performance" />
      <DataTable
        columns={columns}
        data={pocData}
        emptyState={{ title: 'No POC data', description: 'No sales POC data available.' }}
      />
    </div>
  )
}
