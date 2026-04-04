import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, BookOpen, ReceiptText, Clock, Plus, Download } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import BentoCard, { Field, StatusBadge } from '../../components/shared/BentoCard'
import MarginBadge from '../../components/e2e/MarginBadge'
import PnLSummaryCard from '../../components/e2e/PnLSummaryCard'
import VASPnLCard from '../../components/e2e/VASPnLCard'
import ServicesTable from '../../components/e2e/ServicesTable'
import VASSection from '../../components/e2e/VASSection'
import PaymentsList from '../../components/e2e/PaymentsList'
import RefundCalculator from '../../components/e2e/RefundCalculator'
import AddPayoutModal from '../../components/e2e/AddPayoutModal'
import { useToast } from '../../components/shared/Toast'
import { e2eStudents } from '../../data/e2eStudents'
import { calculateStudentPnL, formatINR } from '../../utils/pnlCalculator'
import { exportStudentPnL } from '../../utils/excelExport'
import { createApproval } from '../../utils/approvalStore'

const tabs = [
  { id: 'details', label: 'Details', icon: User },
  { id: 'services', label: 'Services & P&L', icon: BookOpen },
  { id: 'refund', label: 'Refund', icon: ReceiptText },
  { id: 'history', label: 'History', icon: Clock },
]

export default function StudentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('details')
  const [payoutModalType, setPayoutModalType] = useState(null)

  const baseStudent = useMemo(() => e2eStudents.find(s => s.id === id), [id])
  const [services, setServices] = useState(() => baseStudent ? [...baseStudent.servicesOpted] : [])
  const [vasItems, setVasItems] = useState(() => baseStudent ? [...(baseStudent.vasItems || [])] : [])

  const pnl = useMemo(() => {
    if (!baseStudent) return null
    return calculateStudentPnL({ ...baseStudent, servicesOpted: services, vasItems })
  }, [baseStudent, services, vasItems])

  if (!baseStudent) {
    return (
      <div className="text-center py-20">
        <p className="text-[15px] text-grey-60">Student not found</p>
        <button onClick={() => navigate('/e2e/admin/students')} className="mt-3 text-[13px] text-blue-90 hover:underline">
          Back to Students
        </button>
      </div>
    )
  }

  const student = { ...baseStudent, servicesOpted: services, vasItems }
  const requestedDate = new Date().toLocaleDateString('en-GB')

  const handleUpdateService = (idx, updates) => {
    setServices(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], ...updates }
      return next
    })
    toast({ title: 'Service Updated', description: `Service at row ${idx + 1} updated`, type: 'success' })
  }

  const handleUploadProof = (paymentId) => {
    toast({ title: 'Proof Uploaded', description: `Payment proof uploaded for ${paymentId}`, type: 'success' })
  }

  const handleInitiateRefund = (refundData) => {
    toast({ title: 'Refund Initiated', description: `Refund of ${formatINR(refundData.refundAmount)} initiated`, type: 'warning' })
  }

  const handleAddPayout = (payoutData) => {
    const financeSuffix = payoutData.sendToFinance ? ' · Forwarded to Finance' : ''

    if (payoutData.type === 'vas') {
      const nextNum = vasItems.length + 1
      const vasId = `VAS${nextNum}`
      setVasItems(prev => [...prev, {
        id: vasId,
        name: vasId,
        amount: 0,
        cost: payoutData.amount,
        status: 'pending',
        approvalStatus: 'pending',
      }])
      createApproval({
        studentId: student.id,
        studentName: student.studentName,
        type: 'vas',
        serviceName: vasId,
        amount: payoutData.amount,
        requestedBy: 'Admin Team',
        requestedDate,
        margin: payoutData.projectedMargin,
        escalated: false,
        remarks: payoutData.remarks || payoutData.description,
        sendToFinance: payoutData.sendToFinance,
      })
      toast({
        title: 'VAS Payout Submitted',
        description: `VAS${nextNum} — ${formatINR(payoutData.amount)} sent for approval.${financeSuffix}`,
        type: 'warning',
      })
    } else {
      if (payoutData.serviceId) {
        setServices(prev => prev.map(svc => {
          if (svc.serviceId === payoutData.serviceId) {
            return { ...svc, actual: (svc.actual || 0) + payoutData.amount }
          }
          return svc
        }))
      } else {
        setServices(prev => {
          if (prev.length === 0) return prev
          const lastIdx = prev.length - 1
          const updated = [...prev]
          updated[lastIdx] = { ...updated[lastIdx], actual: (updated[lastIdx].actual || 0) + payoutData.amount }
          return updated
        })
      }

      if (payoutData.needsApproval) {
        createApproval({
          studentId: student.id,
          studentName: student.studentName,
          type: 'e2e',
          serviceName: payoutData.serviceName || 'General Payout',
          amount: payoutData.amount,
          requestedBy: 'Admin Team',
          requestedDate,
          margin: payoutData.projectedMargin,
          escalated: payoutData.projectedMargin < 10,
          remarks: payoutData.remarks || payoutData.description,
          sendToFinance: payoutData.sendToFinance,
        })
        toast({
          title: 'E2E Payout Submitted for Approval',
          description: `${formatINR(payoutData.amount)} — margin ${payoutData.projectedMargin.toFixed(1)}%. Escalated to superadmin.${financeSuffix}`,
          type: 'warning',
        })
      } else {
        toast({
          title: payoutData.sendToFinance ? 'E2E Payout Added & Sent to Finance' : 'E2E Payout Added',
          description: `${formatINR(payoutData.amount)} added. Margin: ${payoutData.projectedMargin.toFixed(1)}%${financeSuffix}`,
          type: 'success',
        })
      }
    }

    setPayoutModalType(null)
  }

  return (
    <div>
      <PageHeader
        title={student.studentName}
        leftAction={(
          <button
            onClick={() => navigate('/e2e/admin/students')}
            className="flex items-center gap-1.5 text-[13px] font-medium text-grey-60 hover:text-grey-95 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
      >
        <MarginBadge margin={pnl?.marginPct} size="md" />
        <button
          onClick={() => exportStudentPnL(student)}
          className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold border border-grey-20 text-grey-60 rounded-lg hover:border-blue-40 hover:text-grey-70 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Export P&L
        </button>
      </PageHeader>

      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-blue-10 flex items-center justify-center">
          <span className="text-[16px] font-bold text-blue-90">
            {student.firstName?.[0]}{student.lastName?.[0]}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-[18px] font-semibold text-grey-95">{student.studentName}</h2>
            {student.isRefundCase && (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-light text-red">Refund Case</span>
            )}
          </div>
          <p className="text-[13px] text-grey-60 mt-0.5">
            {student.id} · {student.university} · {student.packageName}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-4 border-b border-grey-20">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.id
                  ? 'border-blue-90 text-blue-90'
                  : 'border-transparent text-grey-40 hover:text-grey-70'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'details' && (
        <div className="space-y-4">
          <BentoCard title="Student Information" icon={User}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Full Name" value={student.studentName} />
              <Field label="Email" value={student.email} />
              <Field label="Phone" value={student.phone} />
              <Field label="City" value={`${student.city}, ${student.state}`} />
              <Field label="University" value={student.university} />
              <Field label="Course" value={student.course} />
              <Field label="Intake" value={student.intake} />
              <Field label="Country" value={student.country} />
            </div>
          </BentoCard>

          <BentoCard title="Package & POC" icon={BookOpen}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Package" value={student.packageName} />
              <Field label="Sales POC" value={student.salesPOC} />
              <Field label="Service POC" value={student.servicePOC} />
              <Field label="Enrollment Date" value={student.date} />
              <Field label="Total Received" value={formatINR(student.totalAmountReceived)} />
              <StatusBadge
                label="Offer Letter"
                value={student.offerLetterStatus}
                color={student.offerLetterStatus === 'Received' ? 'green' : 'amber'}
              />
              <Field label="GST" value={student.gstApplicable ? `${student.gstRate}%` : 'N/A'} />
              <Field label="Loan" value={student.loanDetails?.amount ? formatINR(student.loanDetails.amount) : 'None'} />
            </div>
          </BentoCard>

          <PaymentsList payments={student.payments} onUploadProof={handleUploadProof} />

        </div>
      )}

      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-5">
            <PnLSummaryCard pnl={pnl} />
            <VASPnLCard vasItems={vasItems} />
          </div>
          <ServicesTable
            services={services}
            onUpdateService={handleUpdateService}
            editable
            editableExpected
            headerAction={(
              <button
                onClick={() => setPayoutModalType('e2e')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold bg-blue-90 text-white rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add E2E Payout
              </button>
            )}
          />
          <VASSection
            vasItems={vasItems}
            editable={false}
            headerAction={(
              <button
                onClick={() => setPayoutModalType('vas')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold border border-blue-90 text-blue-90 rounded-lg hover:bg-blue-10 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add VAS Payout
              </button>
            )}
          />
        </div>
      )}

      {activeTab === 'refund' && (
        <div>
          {student.isRefundCase ? (
            <RefundCalculator student={student} onInitiateRefund={handleInitiateRefund} />
          ) : (
            <div className="bg-white border border-grey-20 rounded-xl px-5 py-12 text-center">
              <p className="text-[14px] text-grey-40">This student is not a refund case.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-grey-10">
            <h3 className="text-[14px] font-semibold text-grey-95">Activity History</h3>
          </div>
          {student.history?.length > 0 ? (
            <div className="divide-y divide-grey-10">
              {student.history.map((entry, i) => (
                <div key={i} className="px-5 py-3 flex items-start gap-3">
                  <div className="mt-1">
                    <div className={`w-2 h-2 rounded-full ${
                      entry.type === 'payment' ? 'bg-green'
                        : entry.type === 'refund' ? 'bg-red'
                        : entry.type === 'created' ? 'bg-blue-90'
                        : 'bg-grey-40'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-medium text-grey-95">{entry.action}</p>
                      <span className="text-[11px] text-grey-40">{entry.date} {entry.time}</span>
                    </div>
                    <p className="text-[12px] text-grey-60 mt-0.5">{entry.detail}</p>
                    <p className="text-[11px] text-grey-40 mt-0.5">by {entry.actor}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-center text-[13px] text-grey-40">No history available</div>
          )}
        </div>
      )}

      <AddPayoutModal
        isOpen={!!payoutModalType}
        onClose={() => setPayoutModalType(null)}
        onSubmit={handleAddPayout}
        payoutType={payoutModalType}
        currentPnL={pnl}
        services={services}
        vasItems={vasItems}
      />
    </div>
  )
}
