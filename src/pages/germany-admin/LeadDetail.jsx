import { useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { leads } from '../../data/leads'
import { ServiceStatusPill, SalesStatusPill } from '../../components/shared/StatusPill'
import Modal from '../../components/shared/Modal'
import Breadcrumbs from '../../components/shared/Breadcrumbs'
import { useToast } from '../../components/shared/Toast'
import JourneyStepper, { JOURNEY_STEPS } from '../../components/shared/JourneyStepper'
import DocumentPreparationStage from '../../components/journey/DocumentPreparationStage'
import ApsStage from '../../components/journey/ApsStage'
import VirtualCounsellingStage from '../../components/journey/VirtualCounsellingStage'
import UniversityShortlistingStage from '../../components/journey/UniversityShortlistingStage'
import UniversityFinalizationStage from '../../components/journey/UniversityFinalizationStage'
import UniversityApplicationsStage from '../../components/journey/UniversityApplicationsStage'
import ApplicationReviewStage from '../../components/journey/ApplicationReviewStage'
import OfferLetterStage from '../../components/journey/OfferLetterStage'
import PlaceholderStage from '../../components/journey/PlaceholderStage'
import ProfileSheet from '../../components/shared/ProfileSheet'
import { serviceTeam as serviceTeamData } from '../../data/team'
import {
  ChevronDown, ChevronUp, CheckCircle2, XCircle, MessageSquare,
  Plus, Clock, User, CreditCard, UserCheck, ChevronDown as SelectArrow, Eye
} from 'lucide-react'

const SERVICE_MEMBERS = serviceTeamData.map(m => m.name)

const documentSections = [
  { title: 'Personal Documents', docs: ['Recent Photo', 'Passport (Front)', 'Passport (Last Page)', 'Signature', 'Birth Certificate'] },
  { title: 'Academic Documents', docs: ['10th Mark Sheet', '12th Mark Sheet', '1st Semester Marksheet', '2nd Semester Marksheet', 'Graduation Certificate'] },
  { title: 'German Education Specific', docs: ['APS Certificate', 'TestAS Certificate'] },
  { title: 'Language Documents', docs: ['IELTS Certificate', 'Medium of Instruction (MOI) Certificate', 'German Language Certificate'] },
  { title: 'Application Documents', docs: ['Europass CV', 'Letters of Recommendation', 'Letter of Motivation'] },
  { title: 'Entrance Exam Scores', docs: ['JEE Mains Score Card', 'JEE Advanced Score Card'] },
]

const formatINR = (v) => v != null ? `₹${Number(v).toLocaleString('en-IN')}` : 'Not set'
const formatDate = (d) => {
  if (!d) return 'N/A'
  const dt = new Date(d)
  if (isNaN(dt)) return d
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function AccordionSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-grey-5 transition-colors"
      >
        <h3 className="text-[15px] font-semibold text-grey-95">{title}</h3>
        {open ? <ChevronUp className="w-4 h-4 text-grey-40" /> : <ChevronDown className="w-4 h-4 text-grey-40" />}
      </button>
      {open && <div className="px-6 pb-5 border-t border-grey-10">{children}</div>}
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[12px] text-grey-40 mb-0.5">{label}:</p>
      <p className="text-[13px] font-medium text-grey-95">{value ?? 'N/A'}</p>
    </div>
  )
}

function DocField({ label, value }) {
  return (
    <div>
      <p className="text-[12px] text-grey-60 mb-0.5">{label}:</p>
      <p className="text-[13px] text-grey-40">{value || 'Not uploaded'}</p>
    </div>
  )
}

function HistoryTab({ lead }) {
  const history = lead.history || []
  const iconMap = {
    created: { icon: User, bg: 'bg-blue-10', color: 'text-blue-90' },
    status:  { icon: CheckCircle2, bg: 'bg-green-light', color: 'text-green' },
    payment: { icon: CreditCard, bg: 'bg-purple-light', color: 'text-purple' },
    note:    { icon: MessageSquare, bg: 'bg-amber-light', color: 'text-amber' },
  }
  if (!history.length) {
    return (
      <div className="py-16 text-center">
        <Clock className="w-8 h-8 text-grey-20 mx-auto mb-3" />
        <p className="text-[13px] text-grey-40">No history recorded yet.</p>
      </div>
    )
  }
  return (
    <div className="space-y-0 relative">
      <div className="absolute left-[23px] top-0 bottom-0 w-px bg-grey-20" />
      {history.map((item, i) => {
        const { icon: Icon, bg, color } = iconMap[item.type] || iconMap.note
        return (
          <div key={i} className="flex gap-4 pb-6 relative">
            <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center flex-shrink-0 z-10 border-2 border-white`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="flex-1 pt-2.5">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-[13px] font-semibold text-grey-95">{item.action}</p>
                <p className="text-[11px] text-grey-40">{item.date} · {item.time}</p>
              </div>
              <p className="text-[12px] text-grey-60">{item.detail}</p>
              <p className="text-[11px] text-grey-40 mt-0.5">by {item.actor}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AdminDetailsContent({ lead, formatDate, formatINR }) {
  return (
    <div className="space-y-4">
      <AccordionSection title="Personal Information">
        <div className="grid grid-cols-3 gap-x-8 gap-y-4 pt-4">
          <Field label="Full Name" value={lead.studentName} />
          <Field label="Phone" value={lead.phone} />
          <Field label="Date of Birth" value={formatDate(lead.dateOfBirth)} />
          <Field label="Gender" value={lead.gender} />
          <Field label="Current State" value={lead.state} />
          <Field label="Current City" value={lead.city} />
          <Field label="Source" value={lead.source} />
        </div>
      </AccordionSection>
      <AccordionSection title="Education Information">
        <div className="grid grid-cols-3 gap-x-8 gap-y-4 pt-4">
          <Field label="Course Type" value={lead.courseType} />
          <Field label="Specialisation" value={lead.specialisation} />
          <Field label="CGPA" value={lead.cgpa != null ? `${lead.cgpa} / ${lead.cgpaOutOf}` : null} />
          <Field label="Percentage" value={lead.percentage != null ? `${lead.percentage}%` : 'N/A'} />
          <Field label="Has Backlogs" value={lead.backlog ? `Yes (${lead.backlogCount})` : 'No'} />
        </div>
      </AccordionSection>
      <AccordionSection title="Study Preferences">
        <div className="grid grid-cols-3 gap-x-8 gap-y-4 pt-4">
          <Field label="Preferred Course Type" value={lead.preferredCourseType} />
          <Field label="Preferred Course" value={lead.preferredCourse} />
          <Field label="Intake Season" value={lead.preferredIntakeSeason} />
          <Field label="Intake Year" value={lead.intakeYear} />
        </div>
      </AccordionSection>
    </div>
  )
}

export default function AdminLeadDetail({ standalone = false }) {
  const { id } = useParams()
  const { toast } = useToast()
  const lead = leads.find(l => l.id === id) || leads[0]
  const hasJourney = !!lead.journey?.started
  const [journey] = useState(lead.journey || null)
  const [activeJourneyStep, setActiveJourneyStep] = useState(
    hasJourney ? JOURNEY_STEPS[lead.journey.currentStep]?.id || 'studentProfile' : null
  )
  const [activeTab, setActiveTab] = useState('details')
  const [showProfileSheet, setShowProfileSheet] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showMoreInfoModal, setShowMoreInfoModal] = useState(false)
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false)
  const [showAssignConfirmModal, setShowAssignConfirmModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [moreInfoNote, setMoreInfoNote] = useState('')
  const [assignee, setAssignee] = useState(lead.assignedToService || '')
  const [serviceStatus, setServiceStatus] = useState(lead.serviceStatus)
  const [reviewMode, setReviewMode] = useState(false)
  const [selectedAssignee, setSelectedAssignee] = useState('')
  const [payments, setPayments] = useState(lead.payments || [])
  const [newPayment, setNewPayment] = useState({ amount: '', mode: 'Bank Transfer', date: new Date().toISOString().split('T')[0] })

  const totalPaid = payments.reduce((s, p) => s + Number(p.amount || 0), 0)

  const handleAddPayment = useCallback(() => {
    if (!newPayment.amount) {
      toast({ title: 'Amount required', description: 'Please enter a payment amount', type: 'error' })
      return
    }
    const entry = {
      id: `P-${Date.now()}`,
      date: newPayment.date,
      amount: Number(newPayment.amount),
      mode: newPayment.mode,
      status: 'Successful',
      txnId: `#TXN-${Math.floor(Math.random() * 90000) + 10000}`,
    }
    setPayments(prev => [...prev, entry])
    setNewPayment({ amount: '', mode: 'Bank Transfer', date: new Date().toISOString().split('T')[0] })
    setShowAddPaymentModal(false)
    toast({ title: 'Payment recorded', description: `${formatINR(entry.amount)} added successfully`, type: 'success' })
  }, [newPayment, toast])

  const initials = lead.studentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="pb-24">
      {!standalone && (
        <Breadcrumbs items={hasJourney
          ? [
              { label: 'Active Students', href: '/admin/all-students' },
              { label: lead.studentName },
            ]
          : [
              { label: 'Dashboard', href: '/admin/dashboard' },
              { label: 'Leads', href: '/admin/new-leads' },
              { label: lead.studentName },
            ]
        } />
      )}

      {/* Page Header */}
      {hasJourney ? (
        /* ── Active student: big unified card ── */
        <div className="bg-white border border-grey-20 rounded-2xl px-6 py-5 mb-5 flex items-center gap-6 shadow-sm">
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
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-[20px] font-bold text-grey-95">{lead.studentName}</h1>
              <ServiceStatusPill status={lead.serviceStatus} size="md" />
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
          <div className="hidden md:block w-px h-10 bg-grey-15 flex-shrink-0" />
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
          <div className="hidden md:block w-px h-10 bg-grey-15 flex-shrink-0" />
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
          <div className="w-12 h-12 rounded-full bg-blue-10 border border-blue-40 flex items-center justify-center text-[15px] font-bold text-blue-90 flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-[20px] font-semibold text-grey-95">{lead.studentName}</h1>
              <ServiceStatusPill status={serviceStatus} size="md" />
              <SalesStatusPill status={lead.salesStatus} size="sm" />
            </div>
            <p className="text-[12px] text-grey-40">{lead.id} · {lead.email} · Added {lead.date}</p>
          </div>
        </div>
      )}

      {/* Journey Mode for converted students */}
      {hasJourney ? (
        <div className="flex gap-0 -mx-8 -mb-6" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <JourneyStepper
            journey={journey}
            activeStepId={activeJourneyStep}
            onStepClick={(stepId) => { setActiveJourneyStep(stepId); setActiveTab('details') }}
            readOnly
          />
          <div className="flex-1 min-w-0 px-6 py-4 overflow-y-auto pb-24">
            {activeJourneyStep === 'studentProfile' ? (
              <>
                <div className="flex items-center gap-0 border-b border-grey-20 mb-5">
                  {['details', 'history'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`px-5 py-3 text-[13px] font-medium border-b-2 transition-colors capitalize ${activeTab === tab ? 'text-blue-90 border-blue-90' : 'text-grey-40 border-transparent hover:text-grey-70'}`}>
                      {tab === 'details' ? 'Details' : 'History'}
                    </button>
                  ))}
                </div>
                {activeTab === 'history' ? (
                  <div className="bg-white border border-grey-20 rounded-xl p-6"><HistoryTab lead={lead} /></div>
                ) : (
                  <AdminDetailsContent lead={lead} formatDate={formatDate} formatINR={formatINR} />
                )}
              </>
            ) : activeJourneyStep === 'documentPrep' ? (
              <DocumentPreparationStage stageData={journey.steps.documentPrep} lead={lead} readOnly />
            ) : activeJourneyStep === 'aps' ? (
              <ApsStage stageData={journey.steps.aps} lead={lead} readOnly />
            ) : activeJourneyStep === 'virtualCounselling' ? (
              <VirtualCounsellingStage stageData={journey.steps.virtualCounselling} lead={lead} readOnly />
            ) : activeJourneyStep === 'universityShortlisting' ? (
              <UniversityShortlistingStage stageData={journey.steps.universityShortlisting} lead={lead} readOnly />
            ) : activeJourneyStep === 'universityFinalization' ? (
              <UniversityFinalizationStage stageData={journey.steps.universityFinalization} lead={lead} readOnly />
            ) : activeJourneyStep === 'universityApplications' ? (
              <UniversityApplicationsStage stageData={journey.steps.universityApplications} lead={lead} readOnly />
            ) : activeJourneyStep === 'applicationReview' ? (
              <ApplicationReviewStage stageData={journey.steps.applicationReview} lead={lead} readOnly />
            ) : activeJourneyStep === 'offerLetter' ? (
              <OfferLetterStage stageData={journey.steps.offerLetter} lead={lead} readOnly />
            ) : (
              <PlaceholderStage stageId={activeJourneyStep} stageData={journey.steps[activeJourneyStep]} readOnly />
            )}
          </div>
        </div>
      ) : (
      <>
      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-grey-20 mb-5">
        {['details', 'history'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-[13px] font-medium border-b-2 transition-colors capitalize ${
              activeTab === tab ? 'text-blue-90 border-blue-90' : 'text-grey-40 border-transparent hover:text-grey-70'
            }`}
          >
            {tab === 'details' ? 'Details' : 'History'}
          </button>
        ))}
      </div>

      {activeTab === 'history' ? (
        <div className="bg-white border border-grey-20 rounded-xl p-6">
          <HistoryTab lead={lead} />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Personal Information */}
          <AccordionSection title="Personal Information">
            <div className="grid grid-cols-3 gap-x-8 gap-y-4 pt-4">
              <Field label="Full Name" value={lead.studentName} />
              <Field label="Phone" value={lead.phone} />
              <Field label="Date of Birth" value={formatDate(lead.dateOfBirth)} />
              <Field label="Gender" value={lead.gender} />
              <Field label="Current State" value={lead.state} />
              <Field label="Current City" value={lead.city} />
              <Field label="Source" value={lead.source} />
            </div>
          </AccordionSection>

          {/* Education Information */}
          <AccordionSection title="Education Information">
            <div className="grid grid-cols-3 gap-x-8 gap-y-4 pt-4">
              <Field label="Course Type" value={lead.courseType} />
              <Field label="Specialisation" value={lead.specialisation} />
              <Field label="CGPA" value={lead.cgpa != null ? `${lead.cgpa} / ${lead.cgpaOutOf}` : null} />
              <Field label="Percentage" value={lead.percentage != null ? `${lead.percentage}%` : 'N/A'} />
              <Field label="Has Backlogs" value={lead.backlog ? `Yes (${lead.backlogCount})` : 'No'} />
            </div>
          </AccordionSection>

          {/* Study Preferences */}
          <AccordionSection title="Study Preferences">
            <div className="grid grid-cols-3 gap-x-8 gap-y-4 pt-4">
              <Field label="Preferred Course Type" value={lead.preferredCourseType} />
              <Field label="Preferred Course" value={lead.preferredCourse} />
              <Field label="Preferred Intake Season" value={lead.preferredIntakeSeason} />
              <Field label="Intake Year" value={lead.intakeYear} />
            </div>
          </AccordionSection>

          {/* Language Tests */}
          <AccordionSection title="Language Tests">
            <div className="grid grid-cols-3 gap-x-8 gap-y-4 pt-4">
              <Field label="ELT Status" value={lead.eltStatus} />
              <Field label="ELT Type" value={lead.eltType} />
              <Field label="ELT Score" value={lead.eltStatus !== 'Not Given' ? lead.eltScore : 'N/A'} />
              <Field label="German Language Level" value={lead.germanProficiency} />
            </div>
          </AccordionSection>

          {/* Application Status */}
          <AccordionSection title="Application Status">
            <div className="grid grid-cols-3 gap-x-8 gap-y-4 pt-4">
              <div>
                <p className="text-[12px] text-grey-40 mb-1">Current Status:</p>
                <ServiceStatusPill status={serviceStatus} />
              </div>
              <div>
                <p className="text-[12px] text-grey-40 mb-1">Eligibility Status:</p>
                <span className={`inline-block px-3 py-1 rounded-full text-[12px] font-semibold text-white ${
                  lead.eligibilityStatus === 'Eligible' ? 'bg-green' :
                  lead.eligibilityStatus === 'Not Eligible' ? 'bg-red' : 'bg-info'
                }`}>{lead.eligibilityStatus || 'Pending'}</span>
              </div>
              <Field label="Has Eligibility Check" value={lead.hasEligibilityCheck ? 'Yes' : 'No'} />
              <div>
                <p className="text-[12px] text-grey-40 mb-1">APS Status:</p>
                <span className={`inline-block px-3 py-1 rounded-full text-[12px] font-semibold text-white ${
                  lead.apsStatus === 'Completed' ? 'bg-green' :
                  lead.apsStatus === 'In Progress' ? 'bg-info' : 'bg-grey-40'
                }`}>{lead.apsStatus || 'Not Started'}</span>
              </div>
              <Field label="Sales Owner" value={lead.assignedToSales || 'Unassigned'} />
              <Field label="Service Owner" value={assignee || 'Unassigned'} />
            </div>
          </AccordionSection>

          {/* Payment Information */}
          <AccordionSection title="Payment Information" defaultOpen={false}>
            <div className="grid grid-cols-3 gap-x-8 gap-y-4 pt-4">
              <Field label="Total Sale Value" value={formatINR(lead.totalSaleValue)} />
              <Field label="Down Payment Amount" value={formatINR(lead.downPayment)} />
              <Field label="Pending Amount" value={lead.pendingAmount != null ? formatINR(lead.pendingAmount) : 'None'} />
              <div>
                <p className="text-[12px] text-grey-40 mb-1">Payment Status:</p>
                <span className={`inline-block px-3 py-1 rounded-full text-[12px] font-semibold text-white ${
                  lead.paymentStatus === 'Full Payment Done' ? 'bg-green' :
                  lead.paymentStatus === 'Partial' ? 'bg-amber' : 'bg-grey-40'
                }`}>{lead.paymentStatus || 'Payment Pending'}</span>
              </div>
            </div>
            {lead.salesNotes && (
              <div className="mt-4 pt-3 border-t border-grey-10">
                <p className="text-[12px] text-grey-40 mb-1">Sales Notes:</p>
                <p className="text-[13px] text-grey-70">{lead.salesNotes}</p>
              </div>
            )}
          </AccordionSection>

          {/* Payment Log */}
          <AccordionSection title="Payment Log" defaultOpen={false}>
            <div className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[13px] font-semibold text-grey-95">Payment History</h4>
                <button
                  onClick={() => setShowAddPaymentModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-blue-90 text-white hover:bg-blue-50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Payment
                </button>
              </div>
              <div className="border border-grey-20 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-8">
                  <div>
                    <p className="text-[12px] text-grey-40">Total Payments:</p>
                    <p className="text-[18px] font-bold text-grey-95">{payments.length}</p>
                  </div>
                  <div className="w-px h-8 bg-grey-20" />
                  <div>
                    <p className="text-[12px] text-grey-40">Total Amount Paid:</p>
                    <p className="text-[18px] font-bold text-grey-95">{formatINR(totalPaid)}</p>
                  </div>
                </div>
              </div>
              {payments.length === 0 ? (
                <div className="border border-dashed border-grey-20 rounded-xl py-10 text-center">
                  <CreditCard className="w-6 h-6 text-grey-20 mx-auto mb-2" />
                  <p className="text-[13px] text-grey-40">No payments recorded yet</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-grey-20">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-grey-5 border-b border-grey-20">
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Txn ID</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Mode</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr key={p.id} className="border-b border-grey-10 last:border-b-0 hover:bg-grey-5 transition-colors">
                          <td className="px-4 py-3 text-[13px] text-grey-60">{p.date}</td>
                          <td className="px-4 py-3 text-[12px] text-grey-40 font-mono">{p.txnId}</td>
                          <td className="px-4 py-3 text-[13px] font-semibold text-grey-95">{formatINR(p.amount)}</td>
                          <td className="px-4 py-3 text-[13px] text-grey-60">{p.mode}</td>
                          <td className="px-4 py-3">
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                              p.status === 'Successful' ? 'bg-green-light text-green' :
                              p.status === 'Processing' ? 'bg-info-light text-info' : 'bg-red-light text-red'
                            }`}>{p.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </AccordionSection>

          {/* Additional Information */}
          <AccordionSection title="Additional Information" defaultOpen={false}>
            <div className="grid grid-cols-3 gap-x-8 gap-y-4 pt-4">
              <Field label="Date Added" value={lead.date} />
              <Field label="Last Updated" value={lead.date} />
            </div>
            <div className="mt-4">
              <p className="text-[12px] text-grey-40 mb-1">Sales Notes:</p>
              <p className="text-[13px] text-grey-70">{lead.salesNotes || 'No notes'}</p>
            </div>
            <div className="mt-3">
              <p className="text-[12px] text-grey-40 mb-1">Remarks:</p>
              <p className="text-[13px] text-grey-70">{lead.remarks || 'No remarks'}</p>
            </div>
          </AccordionSection>

          {/* Uploaded Documents */}
          <AccordionSection title="Uploaded Documents" defaultOpen={false}>
            <div className="pt-4 space-y-6">
              {documentSections.map(section => (
                <div key={section.title}>
                  <h4 className="text-[12px] font-semibold text-grey-60 uppercase tracking-wider mb-3">{section.title}</h4>
                  <div className="grid grid-cols-3 gap-x-8 gap-y-3">
                    {section.docs.map(doc => (
                      <DocField key={doc} label={doc} value={lead.documents?.[doc]} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AccordionSection>
        </div>
      )}

      {/* Fixed Bottom Action Bar (pre-conversion only) */}
      {!hasJourney && serviceStatus === 'New' && !reviewMode && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-grey-20 px-8 py-3 flex items-center gap-3 z-30 shadow-lg">
          <span className="text-[12px] text-grey-40 font-medium mr-auto">New Lead — Assign or review</span>
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-grey-40" />
            <span className="text-[12px] font-medium text-grey-60">Assign to:</span>
            <div className="relative">
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="appearance-none border border-grey-20 rounded-lg pl-3 pr-8 py-2 text-[13px] text-grey-70 outline-none focus:border-blue-90 bg-white cursor-pointer"
              >
                <option value="">Select member...</option>
                {SERVICE_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <SelectArrow className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-grey-40 pointer-events-none" />
            </div>
            <button
              onClick={() => {
                if (!selectedAssignee) { toast({ title: 'Select a member', description: 'Pick a service team member first', type: 'error' }); return }
                setShowAssignConfirmModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold bg-blue-90 text-white hover:bg-blue-50 transition-colors"
            >
              <UserCheck className="w-4 h-4" /> Assign
            </button>
          </div>
          <div className="w-px h-6 bg-grey-20" />
          <button
            onClick={() => { setReviewMode(true); setServiceStatus('In Review'); toast({ title: 'Reviewing lead', description: 'You are now reviewing this lead', type: 'info' }) }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9] transition-colors"
          >
            <Eye className="w-4 h-4" /> Review Myself
          </button>
        </div>
      )}

      {!hasJourney && (serviceStatus === 'In Review' || reviewMode) && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-grey-20 px-8 py-3 flex items-center gap-3 z-30 shadow-lg">
          <span className="text-[12px] text-grey-40 font-medium mr-auto">Eligibility Review</span>
          <button
            onClick={() => { setServiceStatus('Serviceable'); toast({ title: 'Marked as Serviceable', description: `${lead.studentName} approved`, type: 'success' }) }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-green text-white hover:bg-green/90 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" /> Mark as Serviceable
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-[#DC2626] text-white hover:bg-[#B91C1C] transition-colors"
          >
            <XCircle className="w-4 h-4" /> Mark as Not Serviceable
          </button>
          <button
            onClick={() => setShowMoreInfoModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-amber text-white hover:bg-amber/90 transition-colors"
          >
            <MessageSquare className="w-4 h-4" /> More Info Needed
          </button>
        </div>
      )}

      {!hasJourney && serviceStatus === 'Assigned' && !reviewMode && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-grey-20 px-8 py-3 flex items-center gap-3 z-30 shadow-lg">
          <span className="text-[12px] text-grey-40 font-medium mr-auto">
            Assigned to <span className="text-grey-70 font-semibold">{assignee || lead.assignedToService}</span>
            <span className="text-grey-40 ml-1">— change assignee if they haven’t started reviewing yet</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-grey-60">Reassign:</span>
            <div className="relative">
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedAssignee(e.target.value)
                    setShowAssignConfirmModal(true)
                  }
                }}
                className="appearance-none border border-grey-20 rounded-lg pl-3 pr-8 py-2 text-[13px] text-grey-70 outline-none focus:border-blue-90 bg-white cursor-pointer"
              >
                <option value="">Select...</option>
                {SERVICE_MEMBERS.filter(m => m !== (assignee || lead.assignedToService)).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <SelectArrow className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-grey-40 pointer-events-none" />
            </div>
          </div>
        </div>
      )}

      {!hasJourney && serviceStatus === 'QC Check' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-grey-20 px-8 py-3 flex items-center gap-3 z-30 shadow-lg">
          <span className="text-[12px] text-grey-40 font-medium mr-auto">QC Check — Assign Service POC</span>
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-grey-40" />
            <span className="text-[12px] font-medium text-grey-60">Assign POC:</span>
            <div className="relative">
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="appearance-none border border-grey-20 rounded-lg pl-3 pr-8 py-2 text-[13px] text-grey-70 outline-none focus:border-blue-90 bg-white cursor-pointer"
              >
                <option value="">Select member...</option>
                {SERVICE_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <SelectArrow className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-grey-40 pointer-events-none" />
            </div>
            <button
              onClick={() => {
                if (!selectedAssignee) { toast({ title: 'Select a member', description: 'Pick a service POC first', type: 'error' }); return }
                setShowAssignConfirmModal(true)
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-blue-90 text-white hover:bg-blue-50 transition-colors"
            >
              <UserCheck className="w-4 h-4" /> Assign for QC
            </button>
          </div>
        </div>
      )}
      </>
      )}

      {/* Reject Modal */}
      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Mark as Not Serviceable">
        <div className="space-y-4">
          <div>
            <label className="text-[12px] text-grey-40 font-medium block mb-1.5">Reason</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Enter reason..."
              className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 outline-none focus:border-blue-90 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 rounded-lg text-[13px] font-medium text-grey-60 hover:bg-grey-10">Cancel</button>
            <button
              onClick={() => {
                setShowRejectModal(false)
                toast({ title: 'Marked as Not Serviceable', type: 'error' })
                setRejectReason('')
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#DC2626] text-white hover:bg-[#B91C1C]"
            >
              <XCircle className="w-4 h-4" /> Confirm
            </button>
          </div>
        </div>
      </Modal>

      {/* More Info Modal */}
      <Modal isOpen={showMoreInfoModal} onClose={() => setShowMoreInfoModal(false)} title="Request More Information">
        <div className="space-y-4">
          <div>
            <label className="text-[12px] text-grey-40 font-medium block mb-1.5">What information is needed?</label>
            <textarea
              value={moreInfoNote}
              onChange={(e) => setMoreInfoNote(e.target.value)}
              rows={3}
              placeholder="Describe required info..."
              className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 outline-none focus:border-blue-90 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowMoreInfoModal(false)} className="px-4 py-2 rounded-lg text-[13px] font-medium text-grey-60 hover:bg-grey-10">Cancel</button>
            <button
              onClick={() => {
                setShowMoreInfoModal(false)
                toast({ title: 'Info Requested', type: 'warning' })
                setMoreInfoNote('')
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold bg-amber text-white hover:bg-amber/90"
            >
              <MessageSquare className="w-4 h-4" /> Request Info
            </button>
          </div>
        </div>
      </Modal>

      {/* Assign Confirmation Modal */}
      <Modal isOpen={showAssignConfirmModal} onClose={() => { setShowAssignConfirmModal(false); setSelectedAssignee('') }} title="Confirm assignment">
        <div className="space-y-4">
          <p className="text-[13px] text-grey-70">
            Do you want to assign this to <span className="font-semibold text-grey-95">{selectedAssignee}</span>?
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => { setShowAssignConfirmModal(false); setSelectedAssignee('') }} className="px-4 py-2 rounded-lg text-[13px] font-medium text-grey-60 hover:bg-grey-10">Cancel</button>
            <button
              onClick={() => {
                setAssignee(selectedAssignee)
                if (serviceStatus === 'New') setServiceStatus('Assigned')
                setShowAssignConfirmModal(false)
                const isQC = serviceStatus === 'QC Check'
                toast({
                  title: isQC ? 'POC Assigned for QC' : 'Lead assigned',
                  description: isQC ? `${selectedAssignee} will handle QC for ${lead.studentName}` : `${lead.studentName} assigned to ${selectedAssignee}`,
                  type: 'success',
                })
                setSelectedAssignee('')
              }}
              className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-blue-90 text-white hover:bg-blue-50"
            >
              OK
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Payment Modal */}
      <Modal isOpen={showAddPaymentModal} onClose={() => setShowAddPaymentModal(false)} title="Add Payment">
        <div className="space-y-4">
          <div>
            <label className="text-[12px] text-grey-40 font-medium block mb-1.5">Amount (₹) *</label>
            <input
              type="number"
              value={newPayment.amount}
              onChange={(e) => setNewPayment(p => ({ ...p, amount: e.target.value }))}
              placeholder="e.g. 50000"
              className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 outline-none focus:border-blue-90"
            />
          </div>
          <div>
            <label className="text-[12px] text-grey-40 font-medium block mb-1.5">Payment Mode</label>
            <select
              value={newPayment.mode}
              onChange={(e) => setNewPayment(p => ({ ...p, mode: e.target.value }))}
              className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 outline-none focus:border-blue-90 bg-white"
            >
              {['Bank Transfer', 'UPI', 'Cash', 'Credit Card', 'Razorpay'].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[12px] text-grey-40 font-medium block mb-1.5">Date</label>
            <input
              type="date"
              value={newPayment.date}
              onChange={(e) => setNewPayment(p => ({ ...p, date: e.target.value }))}
              className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 outline-none focus:border-blue-90"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowAddPaymentModal(false)} className="px-4 py-2 rounded-lg text-[13px] font-medium text-grey-60 hover:bg-grey-10">Cancel</button>
            <button
              onClick={handleAddPayment}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold bg-blue-90 text-white hover:bg-blue-50"
            >
              <Plus className="w-4 h-4" /> Add Payment
            </button>
          </div>
        </div>
      </Modal>

      <ProfileSheet
        isOpen={showProfileSheet}
        onClose={() => setShowProfileSheet(false)}
        title="Student Profile"
        subtitle={lead.studentName}
      >
        <div className="p-4 text-[13px] text-grey-60">Full student profile details.</div>
      </ProfileSheet>
    </div>
  )
}
