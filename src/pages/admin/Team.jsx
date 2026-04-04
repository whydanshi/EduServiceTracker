import { useMemo } from 'react'
import { Users, AlertTriangle } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import MarginBadge from '../../components/e2e/MarginBadge'
import { e2eStudents } from '../../data/e2eStudents'
import { calculateStudentPnL, formatPct } from '../../utils/pnlCalculator'

export default function Team() {
  const pocStats = useMemo(() => {
    const map = {}

    for (const s of e2eStudents) {
      const pnl = calculateStudentPnL(s)
      const pocs = [
        { role: 'Sales', name: s.salesPOC },
        { role: 'Service', name: s.servicePOC },
      ]
      for (const poc of pocs) {
        if (!poc.name) continue
        const key = `${poc.name}__${poc.role}`
        if (!map[key]) {
          map[key] = { name: poc.name, role: poc.role, students: 0, marginSum: 0 }
        }
        map[key].students += 1
        map[key].marginSum += pnl.marginPct
      }
    }

    return Object.values(map)
      .map(p => ({ ...p, avgMargin: p.students > 0 ? p.marginSum / p.students : 0 }))
      .sort((a, b) => a.avgMargin - b.avgMargin)
  }, [])

  const lowMarginPOCs = pocStats.filter(p => p.avgMargin < 10)

  return (
    <div>
      <PageHeader title="Team Overview" />

      {lowMarginPOCs.length > 0 && (
        <div className="bg-white border border-red/30 rounded-xl overflow-hidden mb-6">
          <div className="px-5 py-3.5 border-b border-red/20 bg-red-light flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red" />
            <h3 className="text-[14px] font-semibold text-red">
              Low Margin Alert — {lowMarginPOCs.length} POC{lowMarginPOCs.length > 1 ? 's' : ''} below 10% avg margin
            </h3>
          </div>
          <div className="divide-y divide-grey-10">
            {lowMarginPOCs.map(p => (
              <div key={`${p.name}-${p.role}`} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-red-light flex items-center justify-center">
                    <span className="text-[11px] font-bold text-red">
                      {p.name.split(' ').map(w => w[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-grey-95">{p.name}</p>
                    <p className="text-[11px] text-grey-40">{p.role} POC · {p.students} student{p.students > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <MarginBadge margin={p.avgMargin} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-grey-10 flex items-center gap-2">
          <Users className="w-4 h-4 text-grey-40" />
          <h3 className="text-[14px] font-semibold text-grey-95">POC Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-grey-5 border-b border-grey-20">
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Role</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Students</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Avg Margin</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {pocStats.map(p => (
                <tr key={`${p.name}-${p.role}`} className="border-b border-grey-10 last:border-b-0">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[11px] font-bold text-blue-90">
                          {p.name.split(' ').map(w => w[0]).join('')}
                        </span>
                      </div>
                      <span className="text-[13px] font-medium text-grey-95">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      p.role === 'Sales' ? 'bg-purple-light text-purple' : 'bg-info-light text-info'
                    }`}>
                      {p.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-grey-70">{p.students}</td>
                  <td className="px-5 py-3.5">
                    <MarginBadge margin={p.avgMargin} size="sm" />
                  </td>
                  <td className="px-5 py-3.5">
                    {p.avgMargin < 10 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red">
                        <AlertTriangle className="w-3 h-3" /> Needs Review
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-green">Healthy</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
