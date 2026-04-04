import { useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { leads } from '../../data/leads'
import { ServiceStatusPill, SalesStatusPill } from '../../components/shared/StatusPill'
import Modal from '../../components/shared/Modal'
import Breadcrumbs from '../../components/shared/Breadcrumbs'
import BentoCard, { Field, StatusBadge } from '../../components/shared/BentoCard'
import HistoryTab from '../../components/shared/HistoryTab'
import JourneyStepper, { JOURNEY_STEPS } from '../../components/shared/JourneyStepper'
import ProfileSheet from '../../components/shared/ProfileSheet'
import QCCombinedView, { QC_QUESTION_LABELS } from '../../components/shared/QCCombinedView'
import DocumentPreparationStage from '../../components/journey/DocumentPreparationStage'
import ApsStage from '../../components/journey/ApsStage'
import VirtualCounsellingStage from '../../components/journey/VirtualCounsellingStage'
import UniversityShortlistingStage from '../../components/journey/UniversityShortlistingStage'
import UniversityFinalizationStage from '../../components/journey/UniversityFinalizationStage'
import UniversityApplicationsStage from '../../components/journey/UniversityApplicationsStage'
import ApplicationReviewStage from '../../components/journey/ApplicationReviewStage'
import OfferLetterStage from '../../components/journey/OfferLetterStage'
import PlaceholderStage from '../../components/journey/PlaceholderStage'
import { useToast } from '../../components/shared/Toast'
import {
  ChevronDown, ChevronUp,
  CheckCircle2, XCircle, MessageSquare,
  Plus, User, CreditCard, Mail, MailCheck,
  TrendingUp, AlertCircle,
  GraduationCap, BookOpen, Languages, Paperclip,
  Eye, Download, ExternalLink,
} from 'lucide-react'

const documentSections = [
  { title: 'Personal Documents', docs: ['Recent Photo', 'Passport (Front)', 'Passport (Last Page)', 'Signature', 'Birth Certificate'] },
  { title: 'Academic Documents', docs: ['10th Mark Sheet', '12th Mark Sheet', '1st Semester Marksheet', '2nd Semester Marksheet', 'Graduation Certificate'] },
  { title: 'German Education Specific', docs: ['APS Certificate', 'TestAS Certificate'] },
  { title: 'Language Documents', docs: ['IELTS Certificate', 'Medium of Instruction (MOI) Certificate', 'German Language Certificate'] },
  { title: 'Application Documents', docs: ['Europass CV', 'Letters of Recommendation', 'Letter of Motivation'] },
  { title: 'Entrance Exam Scores', docs: ['JEE Mains Score Card', 'JEE Advanced Score Card'] },
]

const formatINR = (v) => v != null ? `₹${Number(v).toLocaleString('en-IN')}` : '—'
const formatDate = (d) => {
  if (!d) return 'N/A'
  const dt = new Date(d)
  if (isNaN(dt)) return d
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ---------------------------------------------------------------------------
// Stage bars (pre-conversion workflow)
// ---------------------------------------------------------------------------
function Stage1Bar({ onServiceable, onNotServiceable, onMoreInfo }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-grey-20 px-8 py-3 flex items-center gap-3 z-30 shadow-lg">
      <span className="text-[12px] text-grey-40 font-medium mr-auto">Stage 1 – Eligibility Check</span>
      <button onClick={onServiceable} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-green text-white hover:bg-green/90 transition-colors">
        <CheckCircle2 className="w-4 h-4" /> Mark as Serviceable
      </button>
      <button onClick={onNotServiceable} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-[#DC2626] text-white hover:bg-[#B91C1C] transition-colors">
        <XCircle className="w-4 h-4" /> Not Serviceable
      </button>
      <button onClick={onMoreInfo} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-amber text-white hover:bg-amber/90 transition-colors">
        <MessageSquare className="w-4 h-4" /> Need More Info
      </button>
    </div>
  )
}

function Stage2Bar({ checkedCount, totalCount, onQCComplete, onReject, onMoreInfo }) {
  const allChecked = checkedCount >= totalCount

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-grey-20 px-8 py-3 flex items-center gap-3 z-30 shadow-lg">
      <span className="text-[12px] text-grey-40 font-medium mr-auto">
        Stage 2 – QC Review
        <span className={`ml-2 font-semibold ${allChecked ? 'text-green' : 'text-amber'}`}>
          {checkedCount} / {totalCount} checked
        </span>
      </span>
      <button onClick={onMoreInfo} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-amber text-white hover:bg-amber/90 transition-colors">
        <MessageSquare className="w-4 h-4" /> More Info
      </button>
      <button onClick={onReject} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-[#DC2626] text-white hover:bg-[#B91C1C] transition-colors">
        <XCircle className="w-4 h-4" /> Reject
      </button>
      <button
        onClick={onQCComplete}
        disabled={!allChecked}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-colors ${allChecked ? 'bg-green text-white hover:bg-green/90' : 'bg-grey-20 text-grey-40 cursor-not-allowed'}`}
      >
        <CheckCircle2 className="w-4 h-4" /> Mark QC Complete
      </button>
    </div>
  )
}

function CombinedQCBar({ yesCount, noCount, total, onQCComplete, onReject, onMoreInfo }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-grey-20 px-8 py-3 flex items-center gap-3 z-30 shadow-lg">
      <span className="text-[12px] text-grey-40 font-medium mr-auto">
        QC Check
        <span className={`ml-2 font-semibold ${yesCount === total ? 'text-green' : 'text-grey-70'}`}>
          {yesCount} / {total} confirmed
        </span>
        {noCount > 0 && (
          <span className="ml-2 font-semibold text-[#DC2626]">
            {noCount} mismatch{noCount > 1 ? 'es' : ''}
          </span>
        )}
      </span>
      <button onClick={onMoreInfo} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-amber text-white hover:bg-amber/90 transition-colors">
        <MessageSquare className="w-4 h-4" /> More Info
      </button>
      <button onClick={onReject} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-[#DC2626] text-white hover:bg-[#B91C1C] transition-colors">
        <XCircle className="w-4 h-4" /> Reject
      </button>
      <button onClick={onQCComplete} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-green text-white hover:bg-green/90 transition-colors">
        <CheckCircle2 className="w-4 h-4" /> Mark QC Complete
      </button>
    </div>
  )
}

function Stage3Bar({ currentStatus, onSendAck, onMarkAckReceived, onMarkConverted }) {
  const ackSent = ['Acknowledgement Sent', 'Acknowledgement Received', 'Converted'].includes(currentStatus)
  const ackReceived = ['Acknowledgement Received', 'Converted'].includes(currentStatus)
  const converted = currentStatus === 'Converted'

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-grey-20 px-8 py-3 flex items-center gap-3 z-30 shadow-lg">
      <span className="text-[12px] text-grey-40 font-medium mr-auto">
        Stage 3 – Acknowledgement {converted && <span className="text-green font-semibold ml-1">Converted</span>}
      </span>
      <button onClick={onSendAck} disabled={ackSent} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-colors ${ackSent ? 'bg-grey-20 text-grey-40 cursor-not-allowed' : 'bg-blue-90 text-white hover:bg-blue-50'}`}>
        <Mail className="w-4 h-4" /> {ackSent ? 'Ack. Sent' : 'Send Ack. Email'}
      </button>
      <button onClick={onMarkAckReceived} disabled={!ackSent || ackReceived} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-colors ${ackSent && !ackReceived ? 'bg-[#6D28D9] text-white hover:bg-[#5B21B6]' : 'bg-grey-20 text-grey-40 cursor-not-allowed'}`}>
        <MailCheck className="w-4 h-4" /> {ackReceived ? 'Ack. Received' : 'Mark Ack. Received'}
      </button>
      <button onClick={onMarkConverted} disabled={!ackReceived || converted} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-colors ${ackReceived && !converted ? 'bg-green text-white hover:bg-green/90' : 'bg-grey-20 text-grey-40 cursor-not-allowed'}`}>
        <TrendingUp className="w-4 h-4" /> {converted ? 'Converted' : 'Mark Converted'}
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function ServiceLeadDetail({ standalone = false }) {
  const { id } = useParams()
  const { toast } = useToast()
  const lead = leads.find(l => l.id === id) || leads[0]

  const [activeTab, setActiveTab] = useState('details')
  const [serviceStatus, setServiceStatus] = useState(lead.serviceStatus)
  const [salesStatus] = useState(lead.salesStatus)
  const [qcCheckedCount, setQcCheckedCount] = useState(0)
  const [qcNoCount, setQcNoCount] = useState(0)
  const QC_TOTAL = 21

  // Journey state
  const hasJourney = !!lead.journey?.started
  const [journey, setJourney] = useState(lead.journey || null)
  const [activeJourneyStep, setActiveJourneyStep] = useState(
    hasJourney ? JOURNEY_STEPS[lead.journey.currentStep]?.id || 'documentPrep' : null
  )
  const [showProfileSheet, setShowProfileSheet] = useState(false)

  // Modals
  const [showServiceableModal, setShowServiceableModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showMoreInfoModal, setShowMoreInfoModal] = useState(false)
  const [showQCCompleteModal, setShowQCCompleteModal] = useState(false)
  const [showAckReceivedModal, setShowAckReceivedModal] = useState(false)
  const [showConvertedModal, setShowConvertedModal] = useState(false)
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false)
  const [showAckEmailModal, setShowAckEmailModal] = useState(false)
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)

  const [serviceableRemark, setServiceableRemark] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [moreInfoNote, setMoreInfoNote] = useState('')
  const [qcCallNotes, setQcCallNotes] = useState('')
  const [noNotes, setNoNotes] = useState({})
  const [ackReceivedRemark, setAckReceivedRemark] = useState('')
  const [convertedRemark, setConvertedRemark] = useState('')
  const [ackEmailText, setAckEmailText] = useState(
    `Dear ${lead.firstName},\n\nThank you for choosing Leverage Edu. Your application has been reviewed and cleared our QC process.\n\nPlease acknowledge receipt of this email.\n\nBest regards,\nLeverage Edu Service Team`
  )

  const [payments, setPayments] = useState(lead.payments || [])
  const [newPayment, setNewPayment] = useState({ amount: '', mode: 'Bank Transfer', date: new Date().toISOString().split('T')[0] })
  const totalPaid = payments.reduce((s, p) => s + Number(p.amount || 0), 0)

  // Stage (pre-conversion)
  const stage =
    serviceStatus === 'Assigned' ? 1
    : serviceStatus === 'QC Check' ? 2
    : ['QC Checked', 'Acknowledgement Sent', 'Acknowledgement Received'].includes(serviceStatus) ? 3
    : null

  const preConversionMode = !hasJourney && serviceStatus !== 'Converted'
  const contentPaddingBottom = 'pb-24'

  // Handlers (pre-conversion)
  const handleMarkServiceable = useCallback(() => { setServiceStatus('Serviceable'); setShowServiceableModal(false); toast({ title: 'Marked as Serviceable', description: serviceableRemark || 'Eligibility check passed', type: 'success' }); setServiceableRemark('') }, [serviceableRemark, toast])
  const handleMarkNotServiceable = useCallback(() => { if (!rejectReason.trim()) { toast({ title: 'Remark required', type: 'error' }); return }; setServiceStatus('Not Serviceable'); setShowRejectModal(false); toast({ title: 'Not Serviceable', description: rejectReason, type: 'error' }); setRejectReason('') }, [rejectReason, toast])
  const handleMoreInfo = useCallback(() => { if (!moreInfoNote.trim()) { toast({ title: 'Remark required', type: 'error' }); return }; setServiceStatus('Need More Info'); setShowMoreInfoModal(false); toast({ title: 'Info Requested', type: 'warning' }); setMoreInfoNote('') }, [moreInfoNote, toast])
  const handleQCComplete = useCallback(() => { setServiceStatus('QC Checked'); setShowQCCompleteModal(false); toast({ title: 'QC Complete', type: 'success' }); setQcCallNotes(''); setNoNotes({}) }, [toast])
  const handleQCReject = useCallback(() => { if (!rejectReason.trim()) { toast({ title: 'Remark required', type: 'error' }); return }; setServiceStatus('Not Serviceable'); setShowRejectModal(false); toast({ title: 'QC Rejected', description: rejectReason, type: 'error' }); setRejectReason('') }, [rejectReason, toast])
  const handleSendAckEmail = useCallback(() => { setServiceStatus('Acknowledgement Sent'); setShowAckEmailModal(false); toast({ title: 'Email Sent', description: `Sent to ${lead.email}`, type: 'success' }) }, [lead.email, toast])
  const handleMarkAckReceived = useCallback(() => { setServiceStatus('Acknowledgement Received'); setShowAckReceivedModal(false); toast({ title: 'Ack. Received', type: 'success' }); setAckReceivedRemark('') }, [toast])
  const handleMarkConverted = useCallback(() => { setServiceStatus('Converted'); setShowConvertedModal(false); toast({ title: 'Converted', description: `${lead.studentName} is now Converted`, type: 'success' }); setConvertedRemark('') }, [lead.studentName, toast])
  const handleAddPayment = useCallback(() => {
    if (!newPayment.amount) { toast({ title: 'Amount required', type: 'error' }); return }
    const entry = { id: `P-${Date.now()}`, date: newPayment.date, amount: Number(newPayment.amount), mode: newPayment.mode, status: 'Successful', txnId: `#TXN-${Math.floor(Math.random() * 90000) + 10000}` }
    setPayments(prev => [...prev, entry]); setNewPayment({ amount: '', mode: 'Bank Transfer', date: new Date().toISOString().split('T')[0] }); setShowAddPaymentModal(false)
    toast({ title: 'Payment recorded', description: `${formatINR(entry.amount)} added`, type: 'success' })
  }, [newPayment, toast])

  // Journey stage update handler
  const handleJourneyStageUpdate = useCallback((stepId, newData) => {
    setJourney(prev => {
      if (!prev) return prev
      const updated = { ...prev, steps: { ...prev.steps, [stepId]: { ...prev.steps[stepId], ...newData } } }
      if (newData.status === 'completed') {
        const currentIdx = JOURNEY_STEPS.findIndex(s => s.id === stepId)
        if (currentIdx >= 0 && currentIdx < JOURNEY_STEPS.length - 1) {
          const nextStep = JOURNEY_STEPS[currentIdx + 1]
          if (updated.steps[nextStep.id]?.status === 'pending') {
            updated.steps[nextStep.id] = { ...updated.steps[nextStep.id], status: 'active' }
            updated.currentStep = currentIdx + 1
            setActiveJourneyStep(nextStep.id)
          }
        }
      }
      return updated
    })
  }, [])

  const initials = lead.studentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const eligColor = lead.eligibilityStatus === 'Eligible' ? 'green' : lead.eligibilityStatus === 'Not Eligible' ? 'red' : 'info'
  const apsColor = lead.apsStatus === 'Completed' ? 'green' : lead.apsStatus === 'In Progress' ? 'info' : 'grey'
  const payColor = lead.paymentStatus === 'Full Payment Done' ? 'green' : lead.paymentStatus === 'Partial' ? 'amber' : 'grey'

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'payments', label: 'Payments' },
    { id: 'history', label: 'History' },
  ]

  // Render the appropriate journey stage content
  const renderJourneyStage = () => {
    if (!journey?.steps || !activeJourneyStep) return null
    const stepData = journey.steps[activeJourneyStep]

    switch (activeJourneyStep) {
      case 'documentPrep':
        return <DocumentPreparationStage stageData={stepData} lead={lead} onUpdate={(d) => handleJourneyStageUpdate('documentPrep', d)} />
      case 'aps':
        return <ApsStage stageData={stepData} lead={lead} onUpdate={(d) => handleJourneyStageUpdate('aps', d)} />
      case 'virtualCounselling':
        return <VirtualCounsellingStage stageData={stepData} lead={lead} onUpdate={(d) => handleJourneyStageUpdate('virtualCounselling', d)} />
      case 'universityShortlisting':
        return <UniversityShortlistingStage stageData={stepData} lead={lead} onUpdate={(d) => handleJourneyStageUpdate('universityShortlisting', d)} />
      case 'universityFinalization':
        return <UniversityFinalizationStage stageData={stepData} lead={lead} onUpdate={(d) => handleJourneyStageUpdate('universityFinalization', d)} />
      case 'universityApplications':
        return <UniversityApplicationsStage stageData={stepData} lead={lead} onUpdate={(d) => handleJourneyStageUpdate('universityApplications', d)} />
      case 'applicationReview':
        return <ApplicationReviewStage stageData={stepData} lead={lead} onUpdate={(d) => handleJourneyStageUpdate('applicationReview', d)} />
      case 'offerLetter':
        return <OfferLetterStage stageData={stepData} lead={lead} onUpdate={(d) => handleJourneyStageUpdate('offerLetter', d)} />
      default:
        return <PlaceholderStage stageId={activeJourneyStep} stageData={stepData} onUpdate={(d) => handleJourneyStageUpdate(activeJourneyStep, d)} />
    }
  }

  // The existing details bento grid (reused for both journey and non-journey views)
  const renderDetailsContent = () => (
    <div className="grid grid-cols-2 gap-4">
      <BentoCard title="Personal Information" icon={User}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <Field label="Full Name" value={lead.studentName} />
          <Field label="Email" value={lead.email} />
          <Field label="Phone" value={lead.phone} />
          <Field label="Date of Birth" value={formatDate(lead.dateOfBirth)} />
          <Field label="Gender" value={lead.gender} />
          <Field label="Source" value={lead.source} />
          <Field label="Location" value={[lead.city, lead.state].filter(Boolean).join(', ') || 'N/A'} />
          <Field label="Date Added" value={lead.date} />
        </div>
      </BentoCard>

      <BentoCard title="Study Preferences" icon={BookOpen}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <Field label="Preferred Course Type" value={lead.preferredCourseType} />
          <Field label="Preferred Course" value={lead.preferredCourse} />
          <Field label="Intake Season" value={lead.preferredIntakeSeason} />
          <Field label="Intake Year" value={lead.intakeYear} />
        </div>
      </BentoCard>

      <BentoCard title="Education Information" icon={GraduationCap}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <Field label="Course Type" value={lead.courseType} />
          <Field label="Specialisation" value={lead.specialisation} />
          <Field label="CGPA" value={lead.cgpa != null ? `${lead.cgpa} / ${lead.cgpaOutOf}` : null} />
          <Field label="Percentage" value={lead.percentage != null ? `${lead.percentage}%` : 'N/A'} />
          <Field label="Backlogs" value={lead.backlog ? `Yes (${lead.backlogCount})` : 'No'} />
        </div>
      </BentoCard>

      <BentoCard title="Language & Test Scores" icon={Languages}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <Field label="ELT Status" value={lead.eltStatus} />
          <Field label="ELT Type" value={lead.eltType || 'N/A'} />
          <Field label="ELT Score" value={lead.eltStatus !== 'Not Given' ? lead.eltScore : 'N/A'} />
          <Field label="ELT Date" value={lead.eltStatus !== 'Not Given' ? formatDate(lead.eltDate) : 'N/A'} />
          <Field label="German Level" value={lead.germanProficiency} />
        </div>
      </BentoCard>

      <BentoCard title="Additional Information" icon={MessageSquare}>
        <div className="space-y-4">
          <div>
            <p className="text-[11px] text-grey-40 uppercase tracking-wider mb-1">Remarks from Sales</p>
            <p className="text-[13px] text-grey-70 leading-relaxed">{lead.remarks || 'No remarks added'}</p>
          </div>
          {lead.salesNotes && (
            <div>
              <p className="text-[11px] text-grey-40 uppercase tracking-wider mb-1">Sales Notes</p>
              <p className="text-[13px] text-grey-70 leading-relaxed">{lead.salesNotes}</p>
            </div>
          )}
        </div>
      </BentoCard>

      <BentoCard title="Package &amp; Services (Sales Form)" icon={CreditCard}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Field label="Package" value={lead.packageName || '—'} />
            <Field label="Total value" value={formatINR(lead.totalSaleValue)} />
            <Field label="Payment status" value={lead.paymentStatus || '—'} />
            <Field label="Down payment" value={formatINR(lead.downPayment)} />
            <Field label="Pending amount" value={formatINR(lead.pendingAmount)} />
          </div>
          {((lead.servicesIncluded && lead.servicesIncluded.length) || (lead.servicesExcluded && lead.servicesExcluded.length)) ? (
            <>
              {lead.servicesIncluded && lead.servicesIncluded.length > 0 && (
                <div>
                  <p className="text-[11px] text-grey-40 uppercase tracking-wider mb-2">Services included</p>
                  <ul className="space-y-1">
                    {lead.servicesIncluded.map((s, i) => (
                      <li key={i} className="flex items-center gap-2 text-[13px] text-grey-70">
                        <span className="w-1.5 h-1.5 rounded-full bg-green flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {lead.servicesExcluded && lead.servicesExcluded.length > 0 && (
                <div>
                  <p className="text-[11px] text-grey-40 uppercase tracking-wider mb-2">Services not included</p>
                  <ul className="space-y-1">
                    {lead.servicesExcluded.map((s, i) => (
                      <li key={i} className="flex items-center gap-2 text-[13px] text-grey-60">
                        <span className="w-1.5 h-1.5 rounded-full bg-grey-30 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-[13px] text-grey-40">Package and services to be filled in sales form.</p>
          )}
        </div>
      </BentoCard>

      <BentoCard title="Uploaded Documents" icon={Paperclip} className="col-span-2">
        {(() => {
          const allDocs = documentSections.flatMap(s => s.docs)
          const uploadedCount = allDocs.filter(doc => lead.documents?.[doc]).length
          return (
            <div className="mb-4 pb-3 border-b border-grey-10">
              <p className="text-[12px] text-grey-60">
                <span className="font-semibold text-grey-95">{uploadedCount}</span> of <span className="font-semibold text-grey-95">{allDocs.length}</span> documents uploaded
                {uploadedCount > 0 && (
                  <span className="ml-2 text-green">• Click any uploaded document to view</span>
                )}
              </p>
            </div>
          )
        })()}
        <div className="grid grid-cols-2 gap-6">
          {documentSections.map(section => (
            <div key={section.title}>
              <p className="text-[11px] font-semibold text-grey-60 uppercase tracking-wider mb-2">{section.title}</p>
              <div className="space-y-1.5">
                {section.docs.map(doc => {
                  const uploaded = lead.documents?.[doc]
                  const docData = typeof uploaded === 'string' ? { name: uploaded, url: uploaded } : uploaded
                  return (
                    <button
                      key={doc}
                      onClick={() => {
                        if (uploaded) {
                          setSelectedDocument({ name: doc, ...docData })
                          setShowDocumentModal(true)
                        }
                      }}
                      disabled={!uploaded}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors ${
                        uploaded ? 'hover:bg-blue-5 cursor-pointer' : 'cursor-default opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0 text-left">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${uploaded ? 'bg-green' : 'bg-grey-20'}`} />
                        <span className={`text-[12px] truncate ${uploaded ? 'text-grey-70 font-medium' : 'text-grey-30'}`}>{doc}</span>
                        {uploaded && docData?.uploadedAt && (
                          <span className="text-[10px] text-grey-40 ml-1">({docData.uploadedAt})</span>
                        )}
                      </div>
                      {uploaded && (
                        <div className="ml-2 flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-blue-90 bg-blue-10">
                          <Eye className="w-3 h-3" /><span>View</span>
                        </div>
                      )}
                      {!uploaded && <span className="text-[10px] text-grey-30 ml-2">Not uploaded</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </BentoCard>
    </div>
  )

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------
  return (
    <div className={hasJourney ? '' : contentPaddingBottom}>
      {!standalone && (
        <Breadcrumbs items={hasJourney
          ? [
              { label: 'Active Students', href: '/service/active-students' },
              { label: lead.studentName },
            ]
          : [
              { label: 'Dashboard', href: '/service/dashboard' },
              { label: 'Leads', href: '/service/new-leads' },
              { label: lead.studentName },
            ]
        } />
      )}

      {/* Header */}
      {hasJourney ? (
        /* ── Big unified card (active students style / QC combined mode) ── */
        <div className="bg-white border border-grey-20 rounded-2xl px-6 py-5 mb-5 flex items-center gap-6 shadow-sm">
          {/* Avatar */}
          {lead.documents?.['Recent Photo']?.url ? (
            <img
              src={lead.documents['Recent Photo'].url}
              alt={lead.studentName}
              className="w-16 h-16 rounded-full object-cover border-2 border-grey-20 flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-10 border-2 border-blue-40 flex items-center justify-center text-[18px] font-bold text-blue-90 flex-shrink-0">
              {initials}
            </div>
          )}

          {/* Name + contact */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-[20px] font-bold text-grey-95">{lead.studentName}</h1>
              <ServiceStatusPill status={serviceStatus} size="md" />
            </div>
            <div className="flex items-center gap-3 text-[13px] text-grey-50 flex-wrap">
              <span>{lead.email}</span>
              {lead.phone && (
                <>
                  <span className="text-grey-25">·</span>
                  <span>+91 {lead.phone}</span>
                </>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-10 bg-grey-15 flex-shrink-0" />

          {/* Team + meta */}
          <div className="hidden md:flex flex-col gap-1.5 flex-shrink-0">
            <div className="flex items-center gap-2 text-[12px]">
              <span className="text-grey-40 w-[54px]">Sales</span>
              <span className="font-medium text-grey-80">{lead.assignedToSales || 'Unassigned'}</span>
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <span className="text-grey-40 w-[54px]">Service</span>
              <span className="font-medium text-grey-80">{lead.assignedToService || 'Unassigned'}</span>
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <span className="text-grey-40 w-[54px]">Added</span>
              <span className="font-medium text-grey-80">{lead.date}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-10 bg-grey-15 flex-shrink-0" />

          {/* View full profile */}
          <a
            href={`/profile/lead/${lead.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-blue-90 border-2 border-blue-20 hover:bg-blue-10 hover:border-blue-40 transition-colors"
          >
            <User className="w-4 h-4" />
            View full profile
          </a>
        </div>
      ) : (
        /* ── Pre-conversion lead: compact header ── */
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-full bg-blue-10 border border-blue-40 flex items-center justify-center text-[15px] font-bold text-blue-90 flex-shrink-0">{initials}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-[20px] font-semibold text-grey-95 truncate">{lead.studentName}</h1>
              <ServiceStatusPill status={serviceStatus} size="md" />
              <SalesStatusPill status={salesStatus} size="sm" />
            </div>
            <div className="flex items-center gap-2 flex-wrap text-[12px] text-grey-50">
              <span>{lead.id}</span>
              <span className="text-grey-30">·</span>
              <span>{lead.email}</span>
              <span className="text-grey-30">·</span>
              <span>Added {lead.date}</span>
              {(lead.assignedToSales || lead.assignedToService) && (
                <>
                  <span className="text-grey-30">·</span>
                  <span>Sales: {lead.assignedToSales || 'Unassigned'}</span>
                  <span className="text-grey-30">·</span>
                  <span>Service: {lead.assignedToService || 'Unassigned'}</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* JOURNEY MODE: Split layout with stepper sidebar               */}
      {/* ============================================================= */}
      {hasJourney ? (
        <div className="flex gap-0 -mx-8 -mb-6" style={{ minHeight: 'calc(100vh - 200px)' }}>
          {/* Journey Stepper Sidebar */}
          <JourneyStepper
            journey={journey}
            activeStepId={activeJourneyStep}
            onStepClick={(stepId) => {
              setActiveJourneyStep(stepId)
              setActiveTab('details')
            }}
          />

          {/* Main content area */}
          <div className="flex-1 min-w-0 px-6 py-4 overflow-y-auto pb-24">
            {renderJourneyStage()}
          </div>
        </div>
      ) : (
        /* ============================================================= */
        /* PRE-CONVERSION MODE: Existing layout                          */
        /* ============================================================= */
        <>
          {/* Stage 2: QC Check — combined view only */}
          {stage === 2 ? (
            <QCCombinedView
              lead={lead}
              onCheckedChange={(yesCount, noCount) => { setQcCheckedCount(yesCount); setQcNoCount(noCount) }}
              callNotes={qcCallNotes}
              onCallNotesChange={setQcCallNotes}
              noNotes={noNotes}
              onNoNotesChange={(id, value) => setNoNotes(prev => { const next = { ...prev }; if (value) next[id] = value; else delete next[id]; return next })}
            />
          ) : (
            /* Normal tab layout for stages 1 & 3 */
            <>
              <div className="flex items-center border-b border-grey-20 mb-5">
                {tabs.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-5 py-3 text-[13px] font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'text-blue-90 border-blue-90' : 'text-grey-40 border-transparent hover:text-grey-70'}`}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === 'details' && renderDetailsContent()}
              {activeTab === 'payments' && renderPaymentsContent()}
              {activeTab === 'history' && (
                <div className="bg-white border border-grey-20 rounded-xl p-6">
                  <HistoryTab lead={lead} />
                </div>
              )}
            </>
          )}

          {/* Pre-conversion stage bars */}
          {stage === 1 && <Stage1Bar onServiceable={() => setShowServiceableModal(true)} onNotServiceable={() => setShowRejectModal(true)} onMoreInfo={() => setShowMoreInfoModal(true)} />}
          {stage === 2 && (
            <CombinedQCBar
              yesCount={qcCheckedCount}
              noCount={qcNoCount}
              total={QC_TOTAL}
              onQCComplete={() => setShowQCCompleteModal(true)}
              onReject={() => setShowRejectModal(true)}
              onMoreInfo={() => setShowMoreInfoModal(true)}
            />
          )}
          {stage === 3 && <Stage3Bar currentStatus={serviceStatus} onSendAck={() => setShowAckEmailModal(true)} onMarkAckReceived={() => setShowAckReceivedModal(true)} onMarkConverted={() => setShowConvertedModal(true)} />}
          {stage === null && !hasJourney && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-grey-20 px-8 py-3 flex items-center gap-3 z-30 shadow-lg">
              <AlertCircle className="w-4 h-4 text-grey-40" />
              <span className="text-[13px] text-grey-40">Status: <strong>{serviceStatus}</strong> — no actions available.</span>
            </div>
          )}
        </>
      )}

      {/* ============ MODALS (shared across modes) ============ */}
      <Modal isOpen={showServiceableModal} onClose={() => setShowServiceableModal(false)} title="Mark as Serviceable">
        <div className="space-y-4">
          <p className="text-[13px] text-grey-60">Marking <strong>{lead.studentName}</strong> as eligible/serviceable.</p>
          <div>
            <label className="text-[12px] text-grey-40 font-medium block mb-1.5">Remarks <span className="text-grey-30">(optional)</span></label>
            <textarea value={serviceableRemark} onChange={e => setServiceableRemark(e.target.value)} rows={3} placeholder="Add notes..." className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 placeholder:text-grey-40 outline-none focus:border-blue-90 resize-none" />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowServiceableModal(false)} className="px-4 py-2 rounded-lg text-[13px] font-medium text-grey-60 hover:bg-grey-10">Cancel</button>
            <button onClick={handleMarkServiceable} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold bg-green text-white hover:bg-green/90"><CheckCircle2 className="w-4 h-4" /> Confirm</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title={stage === 2 ? 'Reject at QC' : 'Mark as Not Serviceable'}>
        <div className="space-y-4">
          <div>
            <label className="text-[12px] text-grey-40 font-medium block mb-1.5">Remarks *</label>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} placeholder="Reason for rejection..." className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 placeholder:text-grey-40 outline-none focus:border-blue-90 resize-none" />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 rounded-lg text-[13px] font-medium text-grey-60 hover:bg-grey-10">Cancel</button>
            <button onClick={stage === 2 ? handleQCReject : handleMarkNotServiceable} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#DC2626] text-white hover:bg-[#B91C1C]"><XCircle className="w-4 h-4" /> Confirm</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showMoreInfoModal} onClose={() => setShowMoreInfoModal(false)} title="Need More Info from Sales">
        <div className="space-y-4">
          <div>
            <label className="text-[12px] text-grey-40 font-medium block mb-1.5">What info is needed? *</label>
            <textarea value={moreInfoNote} onChange={e => setMoreInfoNote(e.target.value)} rows={3} placeholder="Describe..." className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 placeholder:text-grey-40 outline-none focus:border-blue-90 resize-none" />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowMoreInfoModal(false)} className="px-4 py-2 rounded-lg text-[13px] font-medium text-grey-60 hover:bg-grey-10">Cancel</button>
            <button onClick={handleMoreInfo} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold bg-amber text-white hover:bg-amber/90"><MessageSquare className="w-4 h-4" /> Send</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showQCCompleteModal} onClose={() => setShowQCCompleteModal(false)} title="Mark QC Complete">
        <div className="space-y-4">
          <p className="text-[13px] text-grey-60">All QC criteria verified for <strong>{lead.studentName}</strong>. Mark as eligible.</p>
          {Object.keys(noNotes).length > 0 && (
            <div className="rounded-lg border border-grey-20 bg-grey-5/50 p-3">
              <p className="text-[11px] font-semibold text-grey-50 uppercase tracking-wider mb-2">Mismatches (No) — per-question notes</p>
              <ul className="space-y-2 max-h-32 overflow-y-auto">
                {Object.entries(noNotes).map(([id, note]) => (
                  <li key={id} className="text-[12px]">
                    <span className="font-medium text-grey-70">{QC_QUESTION_LABELS[id] ?? id}:</span>
                    <span className="text-grey-60 ml-1">{note || '—'}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <label className="text-[11px] font-semibold text-grey-40 uppercase tracking-wider block mb-1.5">QC Call Notes</label>
            <textarea value={qcCallNotes} onChange={e => setQcCallNotes(e.target.value)} rows={3} placeholder="Overall notes from the QC call..." className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 placeholder:text-grey-40 outline-none focus:border-blue-90 resize-none" />
          </div>
          <div className="border-t border-grey-20 pt-4">
            <p className="text-[12px] font-medium text-grey-70 mb-2">Send acknowledgement email to student?</p>
            <p className="text-[11px] text-grey-50 mb-3">After marking QC complete, you can send an acknowledgement email to <strong>{lead.studentName}</strong> at {lead.email}.</p>
          </div>
          <div className="flex flex-wrap items-end justify-end gap-4 pt-2">
            <button onClick={() => setShowQCCompleteModal(false)} className="px-4 py-2.5 rounded-lg text-[13px] font-medium text-grey-60 hover:bg-grey-10">Cancel</button>
            <div className="flex flex-col items-center gap-1.5">
              <button onClick={handleQCComplete} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold bg-blue-90 text-white hover:bg-blue-50">
                <CheckCircle2 className="w-4 h-4" /> QC complete
              </button>
              <span className="text-[11px] text-grey-40 font-normal">no email</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => { setServiceStatus('QC Checked'); setShowQCCompleteModal(false); setShowAckEmailModal(true); setQcCallNotes(''); setNoNotes({}); toast({ title: 'QC Complete', description: 'Opening acknowledgement email', type: 'success' }) }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold bg-green text-white hover:bg-green/90"
              >
                <Mail className="w-4 h-4" /> Send email
              </button>
              <span className="text-[11px] text-grey-40 font-normal">acknowledgement email</span>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showAckReceivedModal} onClose={() => setShowAckReceivedModal(false)} title="Mark Ack. Received">
        <div className="space-y-4">
          <p className="text-[13px] text-grey-60"><strong>{lead.studentName}</strong> has acknowledged.</p>
          <div>
            <label className="text-[12px] text-grey-40 font-medium block mb-1.5">Remarks <span className="text-grey-30">(optional)</span></label>
            <textarea value={ackReceivedRemark} onChange={e => setAckReceivedRemark(e.target.value)} rows={3} placeholder="Notes..." className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 placeholder:text-grey-40 outline-none focus:border-blue-90 resize-none" />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowAckReceivedModal(false)} className="px-4 py-2 rounded-lg text-[13px] font-medium text-grey-60 hover:bg-grey-10">Cancel</button>
            <button onClick={handleMarkAckReceived} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#6D28D9] text-white hover:bg-[#5B21B6]"><MailCheck className="w-4 h-4" /> Confirm</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showConvertedModal} onClose={() => setShowConvertedModal(false)} title="Mark as Converted">
        <div className="space-y-4">
          <p className="text-[13px] text-grey-60">Final step — marking <strong>{lead.studentName}</strong> as Converted.</p>
          <div>
            <label className="text-[12px] text-grey-40 font-medium block mb-1.5">Remarks <span className="text-grey-30">(optional)</span></label>
            <textarea value={convertedRemark} onChange={e => setConvertedRemark(e.target.value)} rows={3} placeholder="Notes..." className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 placeholder:text-grey-40 outline-none focus:border-blue-90 resize-none" />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowConvertedModal(false)} className="px-4 py-2 rounded-lg text-[13px] font-medium text-grey-60 hover:bg-grey-10">Cancel</button>
            <button onClick={handleMarkConverted} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold bg-green text-white hover:bg-green/90"><TrendingUp className="w-4 h-4" /> Confirm</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showAckEmailModal} onClose={() => setShowAckEmailModal(false)} title="Send Acknowledgement Email">
        <div className="space-y-4">
          <div className="bg-grey-5 rounded-lg px-4 py-3">
            <p className="text-[11px] text-grey-40 font-semibold uppercase tracking-wider mb-0.5">To</p>
            <p className="text-[13px] text-grey-70">{lead.studentName} &lt;{lead.email}&gt;</p>
          </div>
          <div>
            <label className="text-[12px] text-grey-40 font-medium block mb-1.5">Email Body</label>
            <textarea value={ackEmailText} onChange={e => setAckEmailText(e.target.value)} rows={8} className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 outline-none focus:border-blue-90 resize-none font-mono" />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowAckEmailModal(false)} className="px-4 py-2 rounded-lg text-[13px] font-medium text-grey-60 hover:bg-grey-10">Cancel</button>
            <button onClick={handleSendAckEmail} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold bg-blue-90 text-white hover:bg-blue-50"><Mail className="w-4 h-4" /> Send Email</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showAddPaymentModal} onClose={() => setShowAddPaymentModal(false)} title="Add Payment">
        <div className="space-y-4">
          <div>
            <label className="text-[12px] text-grey-40 font-medium block mb-1.5">Amount (₹) *</label>
            <input type="number" value={newPayment.amount} onChange={e => setNewPayment(p => ({ ...p, amount: e.target.value }))} placeholder="e.g. 50000" className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 outline-none focus:border-blue-90" />
          </div>
          <div>
            <label className="text-[12px] text-grey-40 font-medium block mb-1.5">Payment Mode</label>
            <select value={newPayment.mode} onChange={e => setNewPayment(p => ({ ...p, mode: e.target.value }))} className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 outline-none focus:border-blue-90 bg-white">
              {['Bank Transfer', 'UPI', 'Cash', 'Credit Card', 'Razorpay'].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[12px] text-grey-40 font-medium block mb-1.5">Date</label>
            <input type="date" value={newPayment.date} onChange={e => setNewPayment(p => ({ ...p, date: e.target.value }))} className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 outline-none focus:border-blue-90" />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowAddPaymentModal(false)} className="px-4 py-2 rounded-lg text-[13px] font-medium text-grey-60 hover:bg-grey-10">Cancel</button>
            <button onClick={handleAddPayment} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold bg-blue-90 text-white hover:bg-blue-50"><Plus className="w-4 h-4" /> Add Payment</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDocumentModal} onClose={() => { setShowDocumentModal(false); setSelectedDocument(null) }} title="View Document">
        <div className="space-y-4">
          <div className="bg-grey-5 rounded-lg px-4 py-3">
            <p className="text-[11px] text-grey-40 font-semibold uppercase tracking-wider mb-1">Document Name</p>
            <p className="text-[15px] text-grey-95 font-semibold">{selectedDocument?.name}</p>
            {selectedDocument?.uploadedAt && (
              <p className="text-[11px] text-grey-40 mt-1">Uploaded on {selectedDocument.uploadedAt}</p>
            )}
          </div>
          {selectedDocument?.url && (
            <div className="border-2 border-dashed border-grey-20 rounded-lg p-12 bg-grey-5 text-center">
              <Paperclip className="w-16 h-16 text-blue-90 mx-auto mb-4" />
              <p className="text-[14px] font-medium text-grey-70 mb-1">Document ready to view</p>
              <p className="text-[12px] text-grey-40 mb-6">Click the buttons below to open or download</p>
              <div className="flex items-center justify-center gap-3">
                <a href={selectedDocument.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-blue-90 text-white hover:bg-blue-50 transition-colors shadow-sm">
                  <ExternalLink className="w-4 h-4" /> Open in New Tab
                </a>
                <button
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = selectedDocument.url
                    link.download = selectedDocument.name || 'document'
                    link.click()
                    toast({ title: 'Download started', description: `Downloading ${selectedDocument.name}`, type: 'success' })
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-white border-2 border-grey-20 text-grey-70 hover:bg-grey-5 transition-colors"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
              </div>
            </div>
          )}
          {!selectedDocument?.url && (
            <div className="border border-grey-20 rounded-lg p-8 bg-grey-5 text-center">
              <AlertCircle className="w-12 h-12 text-grey-30 mx-auto mb-3" />
              <p className="text-[13px] text-grey-60">Document URL not available</p>
            </div>
          )}
          <div className="flex justify-end pt-2">
            <button onClick={() => { setShowDocumentModal(false); setSelectedDocument(null) }} className="px-4 py-2 rounded-lg text-[13px] font-medium text-grey-60 hover:bg-grey-10">Close</button>
          </div>
        </div>
      </Modal>

      <ProfileSheet
        isOpen={showProfileSheet}
        onClose={() => setShowProfileSheet(false)}
        title="Student Profile"
        subtitle={`${lead.studentName} · ${lead.id}`}
      >
        {renderDetailsContent()}
      </ProfileSheet>
    </div>
  )

  // Payments content (extracted to avoid duplication)
  function renderPaymentsContent() {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border border-grey-20 rounded-xl px-5 py-4">
            <p className="text-[11px] text-grey-40 uppercase tracking-wider mb-1">Total Sale Value</p>
            <p className="text-[20px] font-bold text-grey-95">{formatINR(lead.totalSaleValue)}</p>
          </div>
          <div className="bg-white border border-grey-20 rounded-xl px-5 py-4">
            <p className="text-[11px] text-grey-40 uppercase tracking-wider mb-1">Amount Paid</p>
            <p className="text-[20px] font-bold text-green">{formatINR(totalPaid)}</p>
          </div>
          <div className="bg-white border border-grey-20 rounded-xl px-5 py-4">
            <p className="text-[11px] text-grey-40 uppercase tracking-wider mb-1">Pending Amount</p>
            <p className="text-[20px] font-bold text-amber">{formatINR((lead.totalSaleValue || 0) - totalPaid)}</p>
          </div>
          <div className="bg-white border border-grey-20 rounded-xl px-5 py-4">
            <p className="text-[11px] text-grey-40 uppercase tracking-wider mb-1">Payment Status</p>
            <StatusBadge label="" value={lead.paymentStatus || 'Pending'} color={payColor} />
          </div>
        </div>

        <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-grey-10">
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-4 h-4 text-grey-40" />
              <h3 className="text-[14px] font-semibold text-grey-95">Payment Log</h3>
              <span className="text-[11px] text-grey-40 bg-grey-10 px-2 py-0.5 rounded-full">{payments.length} transactions</span>
            </div>
            <button onClick={() => setShowAddPaymentModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-blue-90 text-white hover:bg-blue-50 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Payment
            </button>
          </div>
          {payments.length === 0 ? (
            <div className="py-14 text-center">
              <CreditCard className="w-8 h-8 text-grey-20 mx-auto mb-3" />
              <p className="text-[13px] text-grey-40">No payments recorded yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-grey-5 border-b border-grey-20">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Txn ID</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Amount</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Mode</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} className="border-b border-grey-10 last:border-b-0 hover:bg-grey-5 transition-colors">
                    <td className="px-5 py-3 text-[13px] text-grey-60">{p.date}</td>
                    <td className="px-5 py-3 text-[12px] text-grey-40 font-mono">{p.txnId}</td>
                    <td className="px-5 py-3 text-[13px] font-semibold text-grey-95">{formatINR(p.amount)}</td>
                    <td className="px-5 py-3 text-[13px] text-grey-60">{p.mode}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${p.status === 'Successful' ? 'bg-green-light text-green' : p.status === 'Processing' ? 'bg-info-light text-info' : 'bg-red-light text-red'}`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    )
  }
}
