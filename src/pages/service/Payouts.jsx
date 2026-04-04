import { useMemo } from 'react'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import { e2eStudents } from '../../data/e2eStudents'
import { formatINR } from '../../utils/pnlCalculator'

const approvalConfig = {
  approved: { bg: 'bg-green-light', text: 'text-green', Icon: CheckCircle2 },
  pending:  { bg: 'bg-amber-light', text: 'text-amber', Icon: Clock },
  rejected: { bg: 'bg-red-light',   text: 'text-red',   Icon: AlertCircle },
}

export default function Payouts() {
  const myStudents = useMemo(
    () => e2eStudents.filter(s => s.servicePOC === 'Neha Gupta' || s.servicePOC === 'Amit Verma'),
    [],
  )

  const allVasItems = useMemo(() => {
    const items = []
    for (const student of myStudents) {
      for (const vas of student.vasItems || []) {
        items.push({ ...vas, studentName: student.studentName, studentId: student.id })
      }
    }
    return items
  }, [myStudents])

  return (
    <div>
      <PageHeader title="Payout Requests" />

      <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
        {allVasItems.length === 0 ? (
          <div className="px-5 py-12 text-center text-[13px] text-grey-40">No payout requests found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-grey-5 border-b border-grey-20">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Student</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">VAS ID</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">VAS Name</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Amount</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Approval Status</th>
                </tr>
              </thead>
              <tbody>
                {allVasItems.map((item, idx) => {
                  const cfg = approvalConfig[item.approvalStatus] || approvalConfig.pending
                  const StatusIcon = cfg.Icon
                  return (
                    <tr key={`${item.studentId}-${item.id}-${idx}`} className="border-b border-grey-10 last:border-b-0">
                      <td className="px-5 py-3.5">
                        <p className="text-[13px] font-medium text-grey-95">{item.studentName}</p>
                        <p className="text-[11px] text-grey-40">{item.studentId}</p>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-grey-70">{item.id}</td>
                      <td className="px-5 py-3.5 text-[13px] text-grey-70">{item.name}</td>
                      <td className="px-5 py-3.5 text-[13px] font-medium text-grey-95">{formatINR(item.amount)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                          <StatusIcon className="w-3 h-3" />
                          {item.approvalStatus}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
