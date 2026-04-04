import { useMemo, useState } from 'react'
import MarginBadge from './MarginBadge'
import { calculateStudentPnL } from '../../utils/pnlCalculator'

export default function POCHeatmap({ students = [], pocField = 'salesPOC', title = 'Sales POC Margins' }) {
  const [sortOrder, setSortOrder] = useState('asc')

  const pocData = useMemo(() => {
    const map = {}
    for (const s of students) {
      const poc = s[pocField] || 'Unknown'
      if (!map[poc]) map[poc] = { name: poc, margins: [], totalRevenue: 0, studentCount: 0 }
      const pnl = calculateStudentPnL(s)
      map[poc].margins.push(pnl.marginPct)
      map[poc].totalRevenue += s.totalAmountReceived || 0
      map[poc].studentCount += 1
    }

    const rows = Object.values(map)
      .map(p => ({
        ...p,
        avgMargin: p.margins.reduce((a, b) => a + b, 0) / p.margins.length,
        minMargin: Math.min(...p.margins),
        maxMargin: Math.max(...p.margins),
      }))
    rows.sort((a, b) => (sortOrder === 'asc' ? a.avgMargin - b.avgMargin : b.avgMargin - a.avgMargin))
    return rows
  }, [students, pocField, sortOrder])

  if (pocData.length === 0) return null

  const worstMargin = pocData[0]?.avgMargin ?? 0
  const bestMargin = pocData[pocData.length - 1]?.avgMargin ?? 0

  function barColor(margin) {
    if (margin > 15) return 'bg-green'
    if (margin >= 10) return 'bg-amber'
    return 'bg-red'
  }

  function barWidth(margin) {
    const range = Math.max(bestMargin - worstMargin, 1)
    const pct = ((margin - worstMargin) / range) * 70 + 30
    return `${Math.min(100, Math.max(8, pct))}%`
  }

  return (
    <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-grey-10">
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-semibold text-grey-95">{title}</h3>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="text-[11px] font-medium border border-grey-20 rounded-md px-2 py-1 text-grey-60 bg-white"
          >
            <option value="asc">Low to High</option>
            <option value="desc">High to Low</option>
          </select>
        </div>
      </div>
      <div className="divide-y divide-grey-10">
        {pocData.map(p => (
          <div key={p.name} className="px-5 py-3 flex items-center gap-4">
            <div className="w-28 flex-shrink-0">
              <p className="text-[13px] font-medium text-grey-95 truncate">{p.name}</p>
              <p className="text-[11px] text-grey-40">{p.studentCount} student{p.studentCount !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex-1 min-w-0">
              <div className="h-5 bg-grey-5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${barColor(p.avgMargin)} opacity-70`}
                  style={{ width: barWidth(p.avgMargin) }}
                />
              </div>
            </div>
            <div className="flex-shrink-0 w-20 text-right">
              <MarginBadge margin={p.avgMargin} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
