import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, IndianRupee } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import MarginBadge from '../../components/e2e/MarginBadge'
import { e2eStudents } from '../../data/e2eStudents'
import { calculateStudentPnL, formatINR } from '../../utils/pnlCalculator'

export default function Dashboard() {
  const navigate = useNavigate()

  const myStudents = useMemo(
    () => e2eStudents.filter(s => s.salesPOC === 'Karan Mehta' || s.salesPOC === 'Raj Kumar'),
    [],
  )

  const totalRevenue = useMemo(
    () => myStudents.reduce((sum, s) => sum + (s.totalAmountReceived || 0), 0),
    [myStudents],
  )

  const metrics = [
    { label: 'My Students', value: myStudents.length, icon: Users, color: 'text-blue-90', bg: 'bg-blue-10' },
    { label: 'Total Revenue', value: formatINR(totalRevenue), icon: IndianRupee, color: 'text-green', bg: 'bg-green-light' },
  ]

  return (
    <div>
      <PageHeader title="Sales Dashboard" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {metrics.map(m => (
          <div key={m.label} className="bg-white border border-grey-20 rounded-xl px-5 py-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg ${m.bg} flex items-center justify-center`}>
              <m.icon className={`w-5 h-5 ${m.color}`} />
            </div>
            <div>
              <p className="text-[11px] text-grey-40 uppercase tracking-wider">{m.label}</p>
              <p className="text-[24px] font-semibold text-grey-95 leading-tight">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-grey-10">
          <h3 className="text-[14px] font-semibold text-grey-95">My Students</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-grey-5 border-b border-grey-20">
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Student</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">University</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Package</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Total Received</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Margin</th>
              </tr>
            </thead>
            <tbody>
              {myStudents.map(s => {
                const pnl = calculateStudentPnL(s)
                return (
                  <tr
                    key={s.id}
                    onClick={() => navigate(`/sales/student/${s.id}`)}
                    className="border-b border-grey-10 last:border-b-0 cursor-pointer hover:bg-blue-5 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <p className="text-[13px] font-medium text-grey-95">{s.studentName}</p>
                      <p className="text-[11px] text-grey-40">{s.id}</p>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-grey-70">{s.university}</td>
                    <td className="px-5 py-3.5 text-[13px] text-grey-70">{s.packageName}</td>
                    <td className="px-5 py-3.5 text-[13px] font-medium text-grey-95">{formatINR(s.totalAmountReceived)}</td>
                    <td className="px-5 py-3.5"><MarginBadge margin={pnl.marginPct} size="sm" /></td>
                  </tr>
                )
              })}
              {myStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-[13px] text-grey-40">
                    No students assigned
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
