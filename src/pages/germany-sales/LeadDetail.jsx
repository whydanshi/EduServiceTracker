import { useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { leads } from '../../data/leads'
import { ServiceStatusPill, SalesStatusPill } from '../../components/shared/StatusPill'
import Modal from '../../components/shared/Modal'
import Breadcrumbs from '../../components/shared/Breadcrumbs'
import { useToast } from '../../components/shared/Toast'
import JourneyStepper, { JOURNEY_STEPS } from '../../components/shared/JourneyStepper'
import PlaceholderStage from '../../components/journey/PlaceholderStage'
import {
  ChevronDown, ChevronUp, Save, ChevronRight,
  Plus, Clock, User, CreditCard, MessageSquare, CheckCircle2, Upload,
  AlertTriangle, Info
} from 'lucide-react'
import { packages } from '../../data/packages'

const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana', 'West Bengal', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Punjab', 'Haryana', 'Kerala']

const documentSections = [
  { title: 'Personal Documents', docs: ['Recent Photo', 'Passport (Front)', 'Passport (Last Page)', 'Signature', 'Birth Certificate'] },
  { title: 'Academic Documents', docs: ['10th Mark Sheet', '12th Mark Sheet', '1st Semester Marksheet', '2nd Semester Marksheet', 'Graduation Certificate'] },
  { title: 'German Education Specific', docs: ['APS Certificate', 'TestAS Certificate'] },
  { title: 'Language Documents', docs: ['IELTS Certificate', 'Medium of Instruction (MOI) Certificate', 'German Language Certificate'] },
  { title: 'Application Documents', docs: ['Europass CV', 'Letters of Recommendation', 'Letter of Motivation'] },
  { title: 'Entrance Exam Scores', docs: ['JEE Mains Score Card', 'JEE Advanced Score Card'] },
]

const formatINR = (v) => v != null ? `₹${Number(v).toLocaleString('en-IN')}` : 'Not set'

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

function FormField({ label, value, onChange, type = 'text', options, placeholder = '', disabled = false, required = false, step, flagged }) {
  const borderNormal = 'border-grey-20'
  const borderFlag = 'border-amber-400 ring-2 ring-amber-100'
  const bc = flagged ? borderFlag : borderNormal
  return (
    <div className={flagged ? 'relative' : ''}>
      <label className={`text-[12px] font-medium block mb-1 ${flagged ? 'text-amber-700' : 'text-grey-40'}`}>
        {flagged && <AlertTriangle className="w-3 h-3 inline mr-1 -mt-0.5" />}
        {label}{required && <span className="text-red ml-0.5">*</span>}
      </label>
      {options ? (
        <div className="relative">
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={`w-full appearance-none border rounded-lg px-3 py-2.5 pr-9 text-[13px] text-grey-70 outline-none focus:border-blue-90 focus:ring-2 focus:ring-blue-20 bg-white disabled:bg-grey-10 disabled:text-grey-40 cursor-pointer ${bc}`}
          >
            <option value="">{placeholder || 'Select...'}</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-grey-40 pointer-events-none" />
        </div>
      ) : type === 'textarea' ? (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full border rounded-lg px-3 py-2.5 text-[13px] text-grey-70 placeholder:text-grey-40 outline-none focus:border-blue-90 focus:ring-2 focus:ring-blue-20 resize-none disabled:bg-grey-10 ${bc}`}
        />
      ) : (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          step={step}
          className={`w-full border rounded-lg px-3 py-2.5 text-[13px] text-grey-70 placeholder:text-grey-40 outline-none focus:border-blue-90 focus:ring-2 focus:ring-blue-20 disabled:bg-grey-10 disabled:text-grey-40 ${bc}`}
        />
      )}
    </div>
  )
}

function DocUploadField({ label, value, onUpload }) {
  return (
    <div>
      <p className="text-[12px] text-grey-60 mb-1">{label}:</p>
      {value ? (
        <p className="text-[12px] text-green font-medium">{typeof value === 'string' ? value : value.name}</p>
      ) : (
        <label className="cursor-pointer">
          <input type="file" className="hidden" onChange={(e) => onUpload?.(e.target.files?.[0])} />
          <span className="text-[12px] text-grey-40 hover:text-blue-90 flex items-center gap-1">
            <Upload className="w-3 h-3" /> Upload
          </span>
        </label>
      )}
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

export default function SalesLeadDetail({ standalone = false }) {
  const { id } = useParams()
  const { toast } = useToast()
  const lead = leads.find(l => l.id === id) || leads[0]
  const hasJourney = !!lead.journey?.started
  const [journey] = useState(lead.journey || null)
  const [activeJourneyStep, setActiveJourneyStep] = useState(
    hasJourney ? JOURNEY_STEPS[lead.journey.currentStep]?.id || 'studentProfile' : null
  )
  const [activeTab, setActiveTab] = useState('details')
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false)
  const [payments, setPayments] = useState(lead.payments || [])
  const [newPayment, setNewPayment] = useState({ amount: '', mode: 'Bank Transfer', date: new Date().toISOString().split('T')[0] })
  const [documents, setDocuments] = useState(lead.documents || {})

  const [form, setForm] = useState({
    firstName: lead.firstName || '',
    lastName: lead.lastName || '',
    email: lead.email || '',
    phone: lead.phone || '',
    dateOfBirth: lead.dateOfBirth || '',
    gender: lead.gender || '',
    state: lead.state || '',
    city: lead.city || '',
    source: lead.source || '',
    courseType: lead.courseType || '',
    specialisation: lead.specialisation || '',
    cgpa: lead.cgpa || '',
    cgpaOutOf: lead.cgpaOutOf || 10,
    percentage: lead.percentage || '',
    backlog: lead.backlog ? 'Yes' : 'No',
    backlogCount: lead.backlogCount || '',
    preferredCourseType: lead.preferredCourseType || '',
    preferredCourse: lead.preferredCourse || '',
    preferredIntakeSeason: lead.preferredIntakeSeason || '',
    intakeYear: lead.intakeYear || '',
    eltStatus: lead.eltStatus || 'Not Given',
    eltType: lead.eltType || '',
    eltScore: lead.eltScore || '',
    germanProficiency: lead.germanProficiency || '',
    apsStatus: lead.apsStatus || '',
    totalSaleValue: lead.totalSaleValue || '',
    downPayment: lead.downPayment || '',
    paymentMode: '',
    loanVendor: '',
    salesNotes: lead.salesNotes || '',
    remarks: lead.remarks || '',
  })

  const set = useCallback((field, value) => setForm(prev => ({ ...prev, [field]: value })), [])

  const flaggedSet = new Set(
    (lead.qcFeedback?.flaggedFields || []).map(f => f.field)
  )
  const isFlagged = (field) => flaggedSet.has(field)

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

  const handleSave = () => {
    toast({ title: 'Profile saved', description: 'Changes have been saved as draft', type: 'success' })
  }

  const handleSubmit = () => {
    if (!form.firstName || !form.phone || !form.courseType) {
      toast({ title: 'Required fields missing', description: 'Please fill all required fields', type: 'error' })
      return
    }
    toast({ title: 'Lead submitted', description: `${form.firstName} ${form.lastName} submitted for review`, type: 'success' })
  }

  const initials = lead.studentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="pb-24">
      {!standalone && (
        <Breadcrumbs items={[
          { label: 'Dashboard', href: '/sales/dashboard' },
          { label: 'My Leads', href: '/sales/my-leads' },
          { label: lead.studentName },
        ]} />
      )}

      {/* Page Header */}
      <div className="flex items-center gap-4 mb-5">
        <div className="w-12 h-12 rounded-full bg-blue-10 border border-blue-40 flex items-center justify-center text-[15px] font-bold text-blue-90 flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[20px] font-semibold text-grey-95">Lead Details – {lead.studentName}</h1>
            <ServiceStatusPill status={lead.serviceStatus} size="md" />
            <SalesStatusPill status={lead.salesStatus} size="sm" />
          </div>
          <p className="text-[12px] text-grey-40 mt-0.5">ID: {lead.id} · Added on {lead.date}</p>
        </div>
      </div>

      {/* QC Feedback Banner — when lead returned from QC with flagged fields */}
      {lead.qcFeedback && (lead.serviceStatus === 'Need More Info' || lead.serviceStatus === 'More Info Required' || lead.salesStatus === 'More info required') && (
        <div className="mb-5 border border-amber-200 bg-amber-50 rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-amber-200 bg-amber-100/50">
            <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-[13px] font-semibold text-amber-900">QC Feedback — {lead.qcFeedback.flaggedFields.length} field{lead.qcFeedback.flaggedFields.length !== 1 ? 's' : ''} flagged</h3>
              <p className="text-[11px] text-amber-700 mt-0.5">Returned by {lead.qcFeedback.returnedBy} on {lead.qcFeedback.returnedAt}</p>
            </div>
          </div>
          <div className="px-5 py-4 space-y-3">
            {lead.qcFeedback.callNotes && (
              <div className="text-[12px] text-amber-800 bg-amber-100/40 rounded-lg px-3 py-2 leading-relaxed">
                <span className="font-semibold">QC Call Notes:</span> {lead.qcFeedback.callNotes}
              </div>
            )}
            <div className="space-y-2">
              {lead.qcFeedback.flaggedFields.map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-white rounded-lg border border-amber-200 px-4 py-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-grey-90">{item.label}</p>
                    <p className="text-[12px] text-grey-60 mt-0.5">{item.note}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-amber-700 flex items-center gap-1">
              <Info className="w-3 h-3" /> Fix the flagged fields below and re-submit to send back for QC.
            </p>
          </div>
        </div>
      )}

      {/* Under QC Banner — when lead is currently being QC'd */}
      {lead.serviceStatus === 'QC Check' && (
        <div className="mb-5 flex items-center gap-3 px-5 py-3 border border-blue-30 bg-blue-10 rounded-xl">
          <Info className="w-4 h-4 text-blue-90 flex-shrink-0" />
          <p className="text-[13px] text-blue-90">This lead is under QC review by the service team. You may be asked for more info if discrepancies are found.</p>
        </div>
      )}

      {/* Journey Mode for converted students (Sales sees read-only progress) */}
      {hasJourney ? (
        <div className="flex gap-0 -mx-8 -mb-6" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <JourneyStepper
            journey={journey}
            activeStepId={activeJourneyStep}
            onStepClick={(stepId) => setActiveJourneyStep(stepId)}
            readOnly
          />
          <div className="flex-1 min-w-0 px-6 py-4 overflow-y-auto pb-24">
            <PlaceholderStage stageId={activeJourneyStep} stageData={journey.steps[activeJourneyStep]} readOnly />
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
            <div className="grid grid-cols-3 gap-x-5 gap-y-4 pt-4">
              <FormField label="First Name" value={form.firstName} onChange={v => set('firstName', v)} placeholder="First name" required flagged={isFlagged('firstName') || isFlagged('full-name')} />
              <FormField label="Last Name" value={form.lastName} onChange={v => set('lastName', v)} placeholder="Last name" required flagged={isFlagged('lastName') || isFlagged('full-name')} />
              <FormField label="Email" type="email" value={form.email} onChange={v => set('email', v)} placeholder="Email address" flagged={isFlagged('email') || isFlagged('email-verified')} />
              <FormField label="Phone" type="tel" value={form.phone} onChange={v => set('phone', v)} placeholder="Phone number" required flagged={isFlagged('phone')} />
              <FormField label="Date of Birth" type="date" value={form.dateOfBirth} onChange={v => set('dateOfBirth', v)} />
              <FormField label="Gender" value={form.gender} onChange={v => set('gender', v)} options={['Male', 'Female', 'Other', 'Prefer not to say']} placeholder="Select Gender" />
              <FormField label="Current State" value={form.state} onChange={v => { set('state', v); set('city', '') }} options={states} placeholder="Select State" />
              <FormField label="Current City" value={form.city} onChange={v => set('city', v)} placeholder="City" disabled={!form.state} />
              <FormField label="Source" value={form.source} onChange={v => set('source', v)} options={['Online', 'Offline', 'Referral', 'Social Media', 'Other']} placeholder="Select Source" />
            </div>
          </AccordionSection>

          {/* Education Information */}
          <AccordionSection title="Education Information">
            <div className="grid grid-cols-3 gap-x-5 gap-y-4 pt-4">
              <FormField label="Course Type" value={form.courseType} onChange={v => set('courseType', v)} options={['UG - Studienkolleg', 'UG - Bachelors', 'PG']} placeholder="Select Course Type" required />
              <FormField label="Specialisation" value={form.specialisation} onChange={v => set('specialisation', v)} placeholder="e.g. Computer Science" />
              <div>
                <label className="text-[12px] font-medium text-grey-40 block mb-1">CGPA</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={form.cgpa}
                    onChange={e => set('cgpa', e.target.value)}
                    placeholder="8.5"
                    step="0.1"
                    className="flex-1 border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 outline-none focus:border-blue-90"
                  />
                  <span className="text-grey-40 text-[13px]">/</span>
                  <select
                    value={form.cgpaOutOf}
                    onChange={e => set('cgpaOutOf', e.target.value)}
                    className="w-20 appearance-none border border-grey-20 rounded-lg px-2 py-2.5 text-[13px] text-grey-70 outline-none focus:border-blue-90 bg-white cursor-pointer"
                  >
                    {['10', '9.5', '9', '8', '7', '5', '4.2', '4'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <FormField label="Percentage (%)" type="number" value={form.percentage} onChange={v => set('percentage', v)} placeholder="e.g. 85" step="0.1" />
              <FormField label="Has Backlogs?" value={form.backlog} onChange={v => set('backlog', v)} options={['No', 'Yes - 1', 'Yes - 2', 'Yes - 3+']} placeholder="Select" />
            </div>
          </AccordionSection>

          {/* Study Preferences */}
          <AccordionSection title="Study Preferences">
            <div className="grid grid-cols-3 gap-x-5 gap-y-4 pt-4">
              <FormField label="Preferred Course Type" value={form.preferredCourseType} onChange={v => set('preferredCourseType', v)} options={['UG - Studienkolleg', 'UG - Bachelors', 'PG', 'Masters', 'PhD']} placeholder="Select" />
              <FormField label="Preferred Course" value={form.preferredCourse} onChange={v => set('preferredCourse', v)} placeholder="e.g. MS in Computer Science" required flagged={isFlagged('course') || isFlagged('preferredCourse')} />
              <FormField label="Preferred Intake Season" value={form.preferredIntakeSeason} onChange={v => set('preferredIntakeSeason', v)} options={['Summer', 'Winter']} placeholder="Select Season" flagged={isFlagged('intake')} />
              <FormField label="Intake Year" type="number" value={form.intakeYear} onChange={v => set('intakeYear', v)} placeholder="e.g. 2026" flagged={isFlagged('intake')} />
            </div>
          </AccordionSection>

          {/* Language Tests */}
          <AccordionSection title="Language Tests">
            <div className="grid grid-cols-3 gap-x-5 gap-y-4 pt-4">
              <FormField label="ELT Status" value={form.eltStatus} onChange={v => set('eltStatus', v)} options={['Not Given', 'Given', 'Pending']} />
              <FormField label="ELT Type" value={form.eltType} onChange={v => set('eltType', v)} options={['IELTS', 'TOEFL']} placeholder="Select Type" disabled={form.eltStatus === 'Not Given'} />
              <FormField label="ELT Score" type="number" step="0.5" value={form.eltScore} onChange={v => set('eltScore', v)} placeholder="Score" disabled={form.eltStatus === 'Not Given'} />
              <FormField label="German Language Level" value={form.germanProficiency} onChange={v => set('germanProficiency', v)} options={['A1', 'A2', 'B1', 'B2', 'C1', 'C2']} placeholder="Select Level" />
              <FormField label="APS Status" value={form.apsStatus} onChange={v => set('apsStatus', v)} options={['Not Started', 'In Progress', 'Completed']} placeholder="Select Status" />
            </div>
          </AccordionSection>

          {/* Package & Payment */}
          <AccordionSection title="Package & Payment">
            <div className="grid grid-cols-3 gap-x-5 gap-y-4 pt-4">
              <FormField label="Select Package" value="" onChange={() => {}} options={packages.map(p => p.name)} placeholder="Select Package" flagged={isFlagged('package-correct') || isFlagged('packageName')} />
              <FormField label="Total Sale Value (₹)" type="number" value={form.totalSaleValue} onChange={v => set('totalSaleValue', v)} placeholder="e.g. 250000" flagged={isFlagged('totalSaleValue')} />
              <FormField label="Down Payment (₹)" type="number" value={form.downPayment} onChange={v => set('downPayment', v)} placeholder="e.g. 50000" flagged={isFlagged('downPayment') || isFlagged('payment-status')} />
              <FormField label="Payment Mode" value={form.paymentMode} onChange={v => set('paymentMode', v)} options={['Bank Transfer', 'UPI', 'Cash', 'Credit Card', 'Razorpay']} placeholder="Select Mode" flagged={isFlagged('paymentMode')} />
              <FormField label="Loan Vendor" value={form.loanVendor} onChange={v => set('loanVendor', v)} options={['None', 'Fibe', 'HDFC', 'ICICI', 'SBI', 'Other']} placeholder="Select Vendor" />
            </div>
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
            <div className="grid grid-cols-1 gap-y-4 pt-4">
              <FormField label="Sales Notes" type="textarea" value={form.salesNotes} onChange={v => set('salesNotes', v)} placeholder="Add notes..." />
              <FormField label="Remarks" type="textarea" value={form.remarks} onChange={v => set('remarks', v)} placeholder="Additional remarks..." />
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
                      <DocUploadField
                        key={doc}
                        label={doc}
                        value={documents[doc]}
                        onUpload={(file) => setDocuments(prev => ({ ...prev, [doc]: file }))}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AccordionSection>
        </div>
      )}

      {/* Fixed Bottom Action Bar (pre-conversion only) */}
      {!hasJourney && lead.serviceStatus !== 'QC Check' && (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-grey-20 px-8 py-3 flex items-center justify-between z-30 shadow-lg">
        <div className="flex items-center gap-3 text-[12px] text-grey-40">
          <span>Last saved: {lead.date}</span>
          <SalesStatusPill status={lead.salesStatus} />
          {lead.qcFeedback && (
            <span className="text-amber-700 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {lead.qcFeedback.flaggedFields.length} QC issue{lead.qcFeedback.flaggedFields.length !== 1 ? 's' : ''} to fix
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold text-grey-70 border border-grey-20 hover:bg-grey-10 transition-colors"
          >
            <Save className="w-4 h-4" /> Save
          </button>
          <button
            onClick={handleSubmit}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white transition-colors ${lead.qcFeedback ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-90 hover:bg-blue-50'}`}
          >
            {lead.qcFeedback ? 'Re-submit for QC' : 'Submit'} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      )}
      </>
      )}

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
    </div>
  )
}
