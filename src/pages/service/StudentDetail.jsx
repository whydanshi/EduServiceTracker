import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, GraduationCap, BookOpen, CreditCard, History, Plus, Download } from 'lucide-react'
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

const TABS = [
  { id: 'details', label: 'Details', icon: GraduationCap },
  { id: 'services', label: 'Services & P&L', icon: BookOpen },
  { id: 'refund', label: 'Refund', icon: CreditCard },
  { id: 'history', label: 'History', icon: History },
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

  if (!baseStudent) {
    return (
      <div className="text-center py-20">
        <p className="text-[13px] text-grey-40">Student not found</p>
        <button onClick={() => navigate('/e2e/service/students')} className="mt-3 text-[13px] text-blue-90 hover:underline">
          Back to Students
        </button>
      </div>
    )
  }

  const student = { ...baseStudent, servicesOpted: services, vasItems }
  const pnl = calculateStudentPnL(student)
  const requestedDate = new Date().toLocaleDateString('en-GB')

  const handleUpdateService = (idx, updates) => {
    setServices(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], ...updates }
      return next
    })
    toast({ title: 'Service Updated', description: `Service at row ${idx + 1} updated`, type: 'success' })
  }

  const handleAddVAS = (vasItem) => {
    setVasItems(prev => [...prev, vasItem])
    toast({ title: 'VAS Added', description: `${vasItem.id} added successfully`, type: 'success' })
  }

  const handleInitiateRefund = (refundData) => {
    toast({ title: 'Refund Initiated', description: `Refund of ${formatINR(refundData.refundAmount)} initiated`, type: 'warning' })
  }

  const handleUploadProof = (paymentId) => {
    toast({ title: 'Upload', description: `Upload proof for payment ${paymentId}`, type: 'info' })
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
        requestedBy: student.servicePOC || 'Service Team',
        requestedDate,
        margin: payoutData.projectedMargin,
        escalated: false,
        remarks: payoutData.remarks || payoutData.description,
        sendToFinance: payoutData.sendToFinance,
      })
      toast({
        title: 'VAS Payout Submitted',
        description: `VAS${nextNum} — ${formatINR(payoutData.amount)} sent for admin approval.${financeSuffix}`,
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
          requestedBy: student.servicePOC || 'Service Team',
          requestedDate,
          margin: payoutData.projectedMargin,
          escalated: payoutData.projectedMargin < 10,
          remarks: payoutData.remarks || payoutData.description,
          sendToFinance: payoutData.sendToFinance,
        })
        toast({
          title: 'E2E Payout Submitted for Approval',
          description: `${formatINR(payoutData.amount)} — margin will be ${payoutData.projectedMargin.toFixed(1)}%. Sent to admin.${financeSuffix}`,
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
            onClick={() => navigate('/e2e/service/students')}
            className="flex items-center gap-1.5 text-[13px] font-medium text-grey-60 hover:text-grey-95 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
      >
        <MarginBadge margin={pnl.marginPct} size="md" />
        <button
          onClick={() => exportStudentPnL(student)}
          className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold border border-grey-20 text-grey-60 rounded-lg hover:border-blue-40 hover:text-grey-70 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Export P&L
        </button>
      </PageHeader>

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[13px] text-grey-40">{student.university} · {student.course} · {student.intake}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-4 border-b border-grey-20">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.id
                ? 'text-blue-90 border-blue-90'
                : 'text-grey-40 border-transparent hover:text-grey-70'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'details' && (
        <div className="space-y-5">
          <BentoCard title="Student Information" icon={GraduationCap}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              <Field label="Student ID" value={student.id} />
              <Field label="Email" value={student.email} />
              <Field label="Phone" value={student.phone} />
              <Field label="City" value={`${student.city}, ${student.state}`} />
              <Field label="Package" value={student.packageName} />
              <Field label="Sales POC" value={student.salesPOC} />
              <Field label="Service POC" value={student.servicePOC} />
              <StatusBadge label="Offer Letter" value={student.offerLetterStatus} color={student.offerLetterStatus === 'Received' ? 'green' : 'amber'} />
            </div>
          </BentoCard>

          <BentoCard title="Financial Overview" icon={CreditCard}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              <Field label="Total Received" value={formatINR(student.totalAmountReceived)} />
              <Field label="GST" value={student.gstApplicable ? `${student.gstRate}%` : 'N/A'} />
              <Field label="Loan Amount" value={formatINR(student.loanDetails?.amount)} />
              <Field label="Subvention" value={formatINR(student.loanDetails?.subvention)} />
            </div>
          </BentoCard>

          <PaymentsList payments={student.payments} onUploadProof={handleUploadProof} />

        </div>
      )}

      {activeTab === 'services' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <PnLSummaryCard pnl={pnl} />
            <VASPnLCard vasItems={vasItems} />
          </div>
          <ServicesTable
            services={services}
            onUpdateService={handleUpdateService}
            editable={false}
            showCosts={false}
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
            onAddVAS={handleAddVAS}
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
        <div className="max-w-xl">
          {student.isRefundCase ? (
            <RefundCalculator student={student} onInitiateRefund={handleInitiateRefund} />
          ) : (
            <div className="bg-white border border-grey-20 rounded-xl px-5 py-8 text-center">
              <p className="text-[13px] text-grey-40">This student is not a refund case.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-grey-10">
            <h3 className="text-[14px] font-semibold text-grey-95">Activity History</h3>
          </div>
          <div className="px-5 py-4">
            {(student.history || []).length === 0 ? (
              <p className="text-[13px] text-grey-40 text-center py-4">No history available</p>
            ) : (
              <div className="space-y-0">
                {student.history.map((h, i) => {
                  const typeColors = {
                    created: 'bg-blue-10 text-blue-90',
                    payment: 'bg-green-light text-green',
                    status: 'bg-amber-light text-amber',
                    refund: 'bg-red-light text-red',
                  }
                  return (
                    <div key={i} className="flex gap-4 py-3 border-b border-grey-10 last:border-b-0">
                      <div className="flex-shrink-0 w-20">
                        <p className="text-[11px] text-grey-40">{h.date}</p>
                        <p className="text-[11px] text-grey-40">{h.time}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${typeColors[h.type] || 'bg-grey-10 text-grey-60'}`}>
                            {h.type}
                          </span>
                          <span className="text-[11px] text-grey-40">{h.actor}</span>
                        </div>
                        <p className="text-[13px] font-medium text-grey-95">{h.action}</p>
                        {h.detail && <p className="text-[11px] text-grey-40 mt-0.5">{h.detail}</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
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
