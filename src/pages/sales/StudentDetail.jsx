import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, GraduationCap, BookOpen, CreditCard } from 'lucide-react'
import BentoCard, { Field, StatusBadge } from '../../components/shared/BentoCard'
import MarginBadge from '../../components/e2e/MarginBadge'
import PnLSummaryCard from '../../components/e2e/PnLSummaryCard'
import ServicesTable from '../../components/e2e/ServicesTable'
import { e2eStudents } from '../../data/e2eStudents'
import { calculateStudentPnL, formatINR } from '../../utils/pnlCalculator'

const TABS = [
  { id: 'details', label: 'Details', icon: GraduationCap },
  { id: 'pnl', label: 'P&L Overview', icon: BookOpen },
]

export default function StudentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('details')

  const student = useMemo(() => e2eStudents.find(s => s.id === id), [id])

  if (!student) {
    return (
      <div className="text-center py-20">
        <p className="text-[13px] text-grey-40">Student not found</p>
        <button onClick={() => navigate('/sales/students')} className="mt-3 text-[13px] text-blue-90 hover:underline">
          Back to Students
        </button>
      </div>
    )
  }

  const pnl = calculateStudentPnL(student)

  return (
    <div>
      <button
        onClick={() => navigate('/sales/students')}
        className="flex items-center gap-1.5 text-[13px] text-grey-40 hover:text-grey-70 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Students
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-semibold text-grey-95 tracking-tight leading-tight">{student.studentName}</h1>
          <p className="text-[13px] text-grey-40 mt-0.5">{student.university} · {student.course} · {student.intake}</p>
        </div>
        <MarginBadge margin={pnl.marginPct} size="lg" />
      </div>

      <div className="flex items-center gap-1 mb-6 border-b border-grey-20">
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
        </div>
      )}

      {activeTab === 'pnl' && (
        <div className="space-y-5">
          <PnLSummaryCard pnl={pnl} showSectionMargins={false} />
          <ServicesTable services={student.servicesOpted} editable={false} />
        </div>
      )}
    </div>
  )
}
