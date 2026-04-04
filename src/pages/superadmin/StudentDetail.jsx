import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, GraduationCap, Clock } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import BentoCard, { Field } from '../../components/shared/BentoCard'
import MarginBadge from '../../components/e2e/MarginBadge'
import PnLSummaryCard from '../../components/e2e/PnLSummaryCard'
import VASPnLCard from '../../components/e2e/VASPnLCard'
import ServicesTable from '../../components/e2e/ServicesTable'
import VASSection from '../../components/e2e/VASSection'
import PaymentsList from '../../components/e2e/PaymentsList'
import RefundCalculator from '../../components/e2e/RefundCalculator'
import { useToast } from '../../components/shared/Toast'
import { e2eStudents } from '../../data/e2eStudents'
import { calculateStudentPnL, formatINR } from '../../utils/pnlCalculator'
import { exportStudentPnL } from '../../utils/excelExport'

const TABS = [
  { id: 'details', label: 'Details' },
  { id: 'services', label: 'Services & P&L' },
  { id: 'refund', label: 'Refund' },
  { id: 'history', label: 'History' },
]

const historyTypeConfig = {
  created: { color: 'bg-green', label: 'Created' },
  payment: { color: 'bg-blue-90', label: 'Payment' },
  status:  { color: 'bg-amber', label: 'Status' },
  refund:  { color: 'bg-red', label: 'Refund' },
}

export default function StudentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('details')

  const student = useMemo(() => e2eStudents.find(s => s.id === id), [id])
  const [services, setServices] = useState(student?.servicesOpted || [])
  const [vasItems] = useState(student?.vasItems || [])

  const pnl = useMemo(() => {
    if (!student) return null
    return calculateStudentPnL({ ...student, servicesOpted: services, vasItems })
  }, [student, services, vasItems])

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-[15px] text-grey-60 mb-4">Student not found</p>
        <button onClick={() => navigate('/superadmin/students')} className="text-[13px] text-blue-90 hover:underline">
          Back to Students
        </button>
      </div>
    )
  }

  const handleUpdateService = (idx, updates) => {
    setServices(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], ...updates }
      return next
    })
    toast({ title: 'Service Updated', description: `Service at row ${idx + 1} updated`, type: 'success' })
  }

  const handleInitiateRefund = (refundData) => {
    toast({ title: 'Refund Initiated', description: `Refund of ${formatINR(refundData.refundAmount)} initiated`, type: 'warning' })
  }

  const statCards = [
    { label: 'Total Received', value: formatINR(pnl?.totalReceived), color: 'text-grey-95' },
    { label: 'Expected Cost', value: formatINR(pnl?.expectedCost), color: 'text-grey-70' },
    { label: 'Actual Cost', value: formatINR(pnl?.actualCost), color: 'text-grey-70' },
    { label: 'Net P&L', value: formatINR(pnl?.netPnL), color: pnl?.netPnL >= 0 ? 'text-green' : 'text-red' },
  ]

  return (
    <div>
      <PageHeader
        title={student.studentName}
        leftAction={(
          <button
            onClick={() => navigate('/superadmin/students')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold border border-grey-20 rounded-lg text-grey-60 hover:border-blue-40 hover:text-grey-70 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        )}
      >
        <MarginBadge margin={pnl?.marginPct} size="md" />
        <button
          onClick={() => exportStudentPnL(student)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold bg-blue-90 text-white rounded-lg hover:bg-blue-50 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Export P&L
        </button>
      </PageHeader>

      <div className="flex items-center gap-3 mb-3">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-full bg-info-light text-info">
          <GraduationCap className="w-3.5 h-3.5" />
          {student.university} · {student.intake}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map(c => (
          <div key={c.label} className="bg-white border border-grey-20 rounded-xl px-5 py-4">
            <p className="text-[11px] font-semibold text-grey-40 uppercase tracking-wider mb-1">{c.label}</p>
            <p className={`text-[20px] font-bold ${c.color} tracking-tight`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 mb-4 border-b border-grey-20">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'text-blue-90 border-blue-90'
                : 'text-grey-40 border-transparent hover:text-grey-60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'details' && (
        <div className="space-y-4">
          <BentoCard title="Student Information">
            <div className="grid grid-cols-3 gap-x-8 gap-y-4">
              <Field label="Full Name" value={student.studentName} />
              <Field label="Email" value={student.email} />
              <Field label="Phone" value={student.phone} />
              <Field label="University" value={student.university} />
              <Field label="Course" value={student.course} />
              <Field label="Country" value={student.country} />
              <Field label="Intake" value={student.intake} />
              <Field label="Package" value={student.packageName} />
              <Field label="City" value={`${student.city}, ${student.state}`} />
              <Field label="Sales POC" value={student.salesPOC} />
              <Field label="Service POC" value={student.servicePOC} />
              <Field label="Offer Letter" value={`${student.offerLetterStatus} (${student.offerLetterDate})`} />
            </div>
          </BentoCard>

          <PaymentsList payments={student.payments} />

          {student.loanDetails?.amount > 0 && (
            <BentoCard title="Loan Details">
              <div className="grid grid-cols-3 gap-x-8 gap-y-4">
                <Field label="Vendor" value={student.loanDetails.vendorId} />
                <Field label="Amount" value={formatINR(student.loanDetails.amount)} />
                <Field label="Subvention" value={formatINR(student.loanDetails.subvention)} />
                <Field label="GST Applicable" value={student.loanDetails.gstApplicable ? 'Yes' : 'No'} />
              </div>
            </BentoCard>
          )}
        </div>
      )}

      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-5">
            <PnLSummaryCard pnl={pnl} />
            <VASPnLCard vasItems={vasItems} />
          </div>
          <ServicesTable services={services} onUpdateService={handleUpdateService} editable editableExpected />
          <VASSection vasItems={vasItems} editable={false} />
        </div>
      )}

      {activeTab === 'refund' && (
        <div>
          {student.isRefundCase ? (
            <RefundCalculator student={{ ...student, servicesOpted: services, vasItems }} onInitiateRefund={handleInitiateRefund} />
          ) : (
            <div className="bg-white border border-grey-20 rounded-xl px-5 py-12 text-center">
              <p className="text-[13px] text-grey-40">This student is not a refund case.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-grey-10">
            <Clock className="w-4 h-4 text-grey-40" />
            <h3 className="text-[14px] font-semibold text-grey-95">Activity History</h3>
          </div>
          <div className="px-5 py-4">
            {(student.history || []).length === 0 ? (
              <p className="text-[13px] text-grey-40 text-center py-6">No history available</p>
            ) : (
              <div className="relative">
                <div className="absolute left-[7px] top-3 bottom-3 w-px bg-grey-20" />
                <div className="space-y-0">
                  {[...student.history].reverse().map((item, i) => {
                    const cfg = historyTypeConfig[item.type] || { color: 'bg-grey-40', label: 'Event' }
                    return (
                      <div key={i} className="flex gap-4 py-3 relative">
                        <div className={`w-[15px] h-[15px] rounded-full ${cfg.color} border-2 border-white flex-shrink-0 z-10`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-[13px] font-medium text-grey-95">{item.action}</p>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-grey-10 text-grey-40 uppercase">{cfg.label}</span>
                          </div>
                          <p className="text-[12px] text-grey-60">{item.detail}</p>
                          <p className="text-[11px] text-grey-40 mt-1">{item.actor} · {item.date} {item.time}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
