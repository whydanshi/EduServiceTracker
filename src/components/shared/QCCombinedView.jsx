import { useState, useEffect, useCallback } from 'react'
import {
  Phone, AlertTriangle, Info, CheckCircle2,
  User, GraduationCap, CreditCard, Languages,
  Paperclip, Shield, Clock, BookOpen
} from 'lucide-react'

const formatINR = (v) => v != null ? `₹${Number(v).toLocaleString('en-IN')}` : '—'
const formatDate = (d) => {
  if (!d) return 'N/A'
  const dt = new Date(d)
  if (isNaN(dt)) return d
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/* ── Sub-components ── */

function ProfileCard({ title, icon: Icon, children, qcIds, answers }) {
  const hasQc = Array.isArray(qcIds) && qcIds.length > 0
  const completed = hasQc ? qcIds.filter(id => answers[id] === 'yes' || answers[id] === 'no').length : 0
  const total = hasQc ? qcIds.length : 0
  const isComplete = hasQc && completed === total
  return (
    <div className={`bg-white border rounded-xl overflow-hidden transition-opacity ${isComplete ? 'border-green/20 opacity-90' : 'border-grey-10'}`}>
      <div className="flex items-center justify-between gap-2.5 px-5 py-3 border-b border-grey-10 bg-white">
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && <Icon className="w-4 h-4 text-grey-40 flex-shrink-0" />}
          <h3 className="text-[13px] font-semibold text-grey-80 truncate">{title}</h3>
        </div>
        {hasQc && (
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium flex-shrink-0 px-2 py-0.5 rounded-full ${isComplete ? 'bg-green/10 text-green' : 'bg-grey-10 text-grey-60'}`}>
            {isComplete && <CheckCircle2 className="w-3 h-3" />}
            {completed}/{total}
          </span>
        )}
      </div>
      <div className="px-5 py-4 bg-white">{children}</div>
    </div>
  )
}

function YesNoPills({ id, value, onChange }) {
  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <button
        type="button"
        onClick={() => onChange(id, 'yes')}
        className={`px-3 py-0.5 rounded-full text-[11px] font-semibold border transition-colors ${
          value === 'yes'
            ? 'bg-green text-white border-green'
            : 'bg-white text-grey-40 border-grey-20 hover:border-green hover:text-green'
        }`}
      >Yes</button>
      <button
        type="button"
        onClick={() => onChange(id, 'no')}
        className={`px-3 py-0.5 rounded-full text-[11px] font-semibold border transition-colors ${
          value === 'no'
            ? 'bg-[#DC2626] text-white border-[#DC2626]'
            : 'bg-white text-grey-40 border-grey-20 hover:border-[#DC2626] hover:text-[#DC2626]'
        }`}
      >No</button>
    </div>
  )
}

function NoEmphasisHint() {
  return (
    <p className="text-[11px] text-amber-700 mt-1 flex items-center gap-1">
      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
      Add details in QC Call Notes
    </p>
  )
}

function NoNoteInput({ id, value, onChange, placeholder = 'Describe mismatch or add note...' }) {
  return (
    <div className="mt-2 w-full">
      <textarea
        value={value ?? ''}
        onChange={e => onChange(id, e.target.value)}
        rows={2}
        placeholder={placeholder}
        className="w-full border border-grey-20 rounded-lg px-3 py-1.5 text-[11px] text-grey-70 placeholder:text-grey-40 outline-none focus:border-blue-90 resize-none bg-white"
      />
    </div>
  )
}

function QCField({ id, label, value, answer, onChange, noNote, onNoNoteChange }) {
  const borderClass = answer === 'yes' ? 'border-green/30' : answer === 'no' ? 'border-red-200' : 'border-grey-10'
  return (
    <div className={`flex flex-col gap-3 rounded-lg border bg-white px-4 py-2.5 transition-colors ${borderClass}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 min-w-0">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-grey-40 uppercase tracking-wider mb-0.5">{label}</p>
          <p className="text-[13px] font-medium text-grey-90 break-words">{value ?? 'N/A'}</p>
        </div>
        <div className="flex justify-end sm:justify-start flex-shrink-0">
          <YesNoPills id={id} value={answer} onChange={onChange} />
        </div>
      </div>
      {answer === 'no' && (
        <div className="flex flex-col gap-2 w-full pt-1 border-t border-grey-10">
          <NoEmphasisHint />
          {onNoNoteChange && <NoNoteInput id={id} value={noNote} onChange={onNoNoteChange} />}
        </div>
      )}
    </div>
  )
}

function PlainField({ label, value }) {
  return (
    <div className="px-4 py-2.5">
      <p className="text-[10px] text-grey-40 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-[13px] font-medium text-grey-90">{value ?? 'N/A'}</p>
    </div>
  )
}

function QCOnlyRow({ id, question, answer, onChange, noNote, onNoNoteChange, children }) {
  const borderClass = answer === 'yes' ? 'border-green/30' : answer === 'no' ? 'border-red-200' : 'border-grey-10'
  return (
    <div className={`flex flex-col gap-3 rounded-lg border bg-white px-4 py-2.5 transition-colors ${borderClass}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 min-w-0">
        <p className="text-[13px] text-grey-70 flex-1 leading-snug min-w-0 break-words">{question}</p>
        <div className="flex justify-end sm:justify-start flex-shrink-0">
          <YesNoPills id={id} value={answer} onChange={onChange} />
        </div>
      </div>
      {answer === 'no' && (
        <div className="flex flex-col gap-2 w-full pt-1 border-t border-grey-10">
          <NoEmphasisHint />
          {onNoNoteChange && <NoNoteInput id={id} value={noNote} onChange={onNoNoteChange} />}
        </div>
      )}
      {children}
    </div>
  )
}

/** Map of QC question id to display label for use in modals/summaries */
export const QC_QUESTION_LABELS = {
  'full-name': 'Full Name',
  'email-verified': 'Leverage Email',
  'intake': 'Intake',
  'academics': 'CGPA / %',
  'course': 'Preferred Course',
  'package-correct': 'Package',
  'package-value': 'Total Value',
  'payment-status': 'Payment Status',
  'payment-mode': 'Last Payment Mode',
  'services-included': 'Services included are correct and remembered',
  'services-excluded': 'Services NOT included are known to student',
  'aps-status': 'APS Status',
  'elt-status': 'ELT Status',
  'service-email': 'Correct service email received by student',
  'docs-uploaded': 'All correct documents are uploaded',
  'next-steps': 'Next 3 steps are understood by the student',
  'poc-name': 'POC / Coach name is known to student',
  'deadline': 'Deadline is known to the student (if any)',
  'no-verbal-promises': 'No verbal promises made outside tracker',
  'no-pressure': 'No pressure to pay immediately',
  'clear-on-package': 'Student is clear on package sold before payment',
}

const documentSections = [
  { title: 'Personal Documents', docs: ['Recent Photo', 'Passport (Front)', 'Passport (Last Page)', 'Signature', 'Birth Certificate'] },
  { title: 'Academic Documents', docs: ['10th Mark Sheet', '12th Mark Sheet', '1st Semester Marksheet', '2nd Semester Marksheet', 'Graduation Certificate'] },
  { title: 'German Education Specific', docs: ['APS Certificate', 'TestAS Certificate'] },
  { title: 'Language Documents', docs: ['IELTS Certificate', 'Medium of Instruction (MOI) Certificate', 'German Language Certificate'] },
  { title: 'Application Documents', docs: ['Europass CV', 'Letters of Recommendation', 'Letter of Motivation'] },
  { title: 'Entrance Exam Scores', docs: ['JEE Mains Score Card', 'JEE Advanced Score Card'] },
]

/* ── Main component ── */

export default function QCCombinedView({ lead, onCheckedChange, callNotes: callNotesProp, onCallNotesChange, noNotes: noNotesProp, onNoNotesChange }) {
  const [answers, setAnswers] = useState({})
  const [callNotesLocal, setCallNotesLocal] = useState('')
  const [noNotesLocal, setNoNotesLocal] = useState({})
  const callNotes = callNotesProp !== undefined ? callNotesProp : callNotesLocal
  const setCallNotes = onCallNotesChange ?? setCallNotesLocal
  const noNotes = noNotesProp !== undefined ? noNotesProp : noNotesLocal
  const setNoNote = useCallback((id, value) => {
    if (onNoNotesChange) onNoNotesChange(id, value)
    else setNoNotesLocal(prev => ({ ...prev, [id]: value || undefined }))
  }, [onNoNotesChange])
  const TOTAL = 21

  const setAnswer = useCallback((id, val) => {
    setAnswers(prev => {
      if (prev[id] === val) {
        const next = { ...prev }
        delete next[id]
        return next
      }
      return { ...prev, [id]: val }
    })
  }, [])

  const yesCount = Object.values(answers).filter(v => v === 'yes').length
  const noCount = Object.values(answers).filter(v => v === 'no').length

  useEffect(() => {
    onCheckedChange?.(yesCount, noCount, TOTAL)
  }, [yesCount, noCount, onCheckedChange])

  const cgpaVal = lead.cgpa != null
    ? `${lead.cgpa} / ${lead.cgpaOutOf ?? 10}`
    : lead.percentage != null ? `${lead.percentage}%` : 'N/A'

  const allDocs = documentSections.flatMap(s => s.docs)
  const uploadedCount = allDocs.filter(doc => lead.documents?.[doc]).length

  const lastPaymentMode = lead.payments?.length
    ? lead.payments[lead.payments.length - 1].mode
    : 'N/A'

  return (
    <div className="max-w-5xl mx-auto pb-8">
      {/* Call-prompt banner */}
      <div className="bg-blue-10 border border-blue-20 rounded-xl px-5 py-4 mb-5 flex items-start gap-3">
        <Phone className="w-4 h-4 text-blue-90 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[11px] font-semibold text-blue-90 uppercase tracking-wider mb-1">QC Check</p>
          <p className="text-[13px] font-semibold text-blue-90 mb-1">Call the student and confirm each section</p>
          <p className="text-[12px] text-blue-90/70 mb-2">Mark Yes if the student confirms, or No if there's a mismatch.</p>
          <div className="flex items-center gap-3 flex-wrap">
            {lead.email && <span className="text-[11px] bg-white border border-blue-20 text-blue-90 px-2.5 py-1 rounded-full font-medium">{lead.email}</span>}
            {lead.phone && <span className="text-[11px] bg-white border border-blue-20 text-blue-90 px-2.5 py-1 rounded-full font-medium">+91 {lead.phone}</span>}
          </div>
        </div>
      </div>

      <div className="space-y-4">

        {/* ── Personal Information ── */}
        <ProfileCard title="Personal Information" icon={User} qcIds={['full-name', 'email-verified', 'intake', 'academics', 'course']} answers={answers}>
          <div className="grid grid-cols-2 gap-3">
            <QCField id="full-name" label="Full Name" value={lead.studentName} answer={answers['full-name']} onChange={setAnswer} noNote={noNotes['full-name']} onNoNoteChange={setNoNote} />
            <QCField id="email-verified" label="Leverage Email" value={lead.email} answer={answers['email-verified']} onChange={setAnswer} noNote={noNotes['email-verified']} onNoNoteChange={setNoNote} />
            <QCField id="intake" label="Intake" value={lead.preferredIntakeSeason && lead.intakeYear ? `${lead.preferredIntakeSeason} ${lead.intakeYear}` : lead.yearOfIntake || 'N/A'} answer={answers['intake']} onChange={setAnswer} noNote={noNotes['intake']} onNoNoteChange={setNoNote} />
            <QCField id="academics" label="CGPA / %" value={cgpaVal} answer={answers['academics']} onChange={setAnswer} noNote={noNotes['academics']} onNoNoteChange={setNoNote} />
            <QCField id="course" label="Preferred Course" value={lead.preferredCourse || 'N/A'} answer={answers['course']} onChange={setAnswer} noNote={noNotes['course']} onNoNoteChange={setNoNote} />
            <PlainField label="Gender" value={lead.gender} />
            <PlainField label="Phone" value={lead.phone} />
            <PlainField label="Date of Birth" value={formatDate(lead.dateOfBirth)} />
            <PlainField label="Source" value={lead.source} />
            <PlainField label="Location" value={[lead.city, lead.state].filter(Boolean).join(', ') || 'N/A'} />
          </div>
        </ProfileCard>

        {/* ── Education Information ── */}
        <ProfileCard title="Education Information" icon={GraduationCap}>
          <div className="grid grid-cols-2 gap-3">
            <PlainField label="Course Type" value={lead.courseType} />
            <PlainField label="Specialisation" value={lead.specialisation} />
            <PlainField label="CGPA" value={cgpaVal} />
            <PlainField label="Percentage" value={lead.percentage != null ? `${lead.percentage}%` : 'N/A'} />
            <PlainField label="Backlogs" value={lead.backlog ? `Yes (${lead.backlogCount})` : 'No'} />
          </div>
        </ProfileCard>

        {/* ── Study Preferences ── */}
        <ProfileCard title="Study Preferences" icon={BookOpen}>
          <div className="grid grid-cols-2 gap-3">
            <PlainField label="Preferred Course Type" value={lead.preferredCourseType} />
            <PlainField label="Preferred Course" value={lead.preferredCourse} />
            <PlainField label="Intake Season" value={lead.preferredIntakeSeason} />
            <PlainField label="Intake Year" value={lead.intakeYear} />
          </div>
        </ProfileCard>

        {/* ── Language & Test Scores ── */}
        <ProfileCard title="Language & Test Scores" icon={Languages}>
          <div className="grid grid-cols-2 gap-3">
            <PlainField label="ELT Status" value={lead.eltStatus} />
            <PlainField label="ELT Type" value={lead.eltType || 'N/A'} />
            <PlainField label="ELT Score" value={lead.eltScore || 'N/A'} />
            <PlainField label="German Level" value={lead.germanProficiency} />
            <PlainField label="APS Status" value={lead.apsStatus} />
          </div>
        </ProfileCard>

        {/* ── Package & Fees Sold ── */}
        <ProfileCard title="Package & Fees Sold" icon={CreditCard} qcIds={['package-correct', 'package-value', 'payment-status', 'payment-mode', 'services-included', 'services-excluded', 'aps-status', 'elt-status']} answers={answers}>
          <div className="grid grid-cols-2 gap-3">
            <QCField id="package-correct" label="Package" value={lead.packageName || '—'} answer={answers['package-correct']} onChange={setAnswer} noNote={noNotes['package-correct']} onNoNoteChange={setNoNote} />
            <QCField id="package-value" label="Total Value" value={formatINR(lead.totalSaleValue)} answer={answers['package-value']} onChange={setAnswer} noNote={noNotes['package-value']} onNoNoteChange={setNoNote} />
            <QCField id="payment-status" label="Payment Status" value={lead.paymentStatus || '—'} answer={answers['payment-status']} onChange={setAnswer} noNote={noNotes['payment-status']} onNoNoteChange={setNoNote} />
            <QCField id="payment-mode" label="Last Payment Mode" value={lastPaymentMode} answer={answers['payment-mode']} onChange={setAnswer} noNote={noNotes['payment-mode']} onNoNoteChange={setNoNote} />
            <PlainField label="Down Payment" value={formatINR(lead.downPayment)} />
            <PlainField label="Pending Amount" value={formatINR(lead.pendingAmount)} />
          </div>

          {lead.servicesIncluded && lead.servicesIncluded.length > 0 && (
            <div className="mt-4 pt-3 border-t border-grey-10">
              <p className="text-[10px] text-grey-40 uppercase tracking-wider mb-2">Services Included</p>
              <div className="flex flex-wrap gap-1.5">
                {lead.servicesIncluded.map((s, i) => (
                  <span key={i} className="text-[11px] bg-green-light/40 text-green px-2.5 py-0.5 rounded-full font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}
          {lead.servicesExcluded && lead.servicesExcluded.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] text-grey-40 uppercase tracking-wider mb-2">Services Not Included</p>
              <div className="flex flex-wrap gap-1.5">
                {lead.servicesExcluded.map((s, i) => (
                  <span key={i} className="text-[11px] bg-grey-10 text-grey-60 px-2.5 py-0.5 rounded-full font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <QCOnlyRow id="services-included" question="Services included are correct and remembered" answer={answers['services-included']} onChange={setAnswer} noNote={noNotes['services-included']} onNoNoteChange={setNoNote} />
            <QCOnlyRow id="services-excluded" question="Services NOT included are known to student" answer={answers['services-excluded']} onChange={setAnswer} noNote={noNotes['services-excluded']} onNoNoteChange={setNoNote} />
            <QCField id="aps-status" label="APS Status" value={lead.apsStatus || 'N/A'} answer={answers['aps-status']} onChange={setAnswer} noNote={noNotes['aps-status']} onNoNoteChange={setNoNote} />
            <QCField id="elt-status" label="ELT Status" value={lead.eltStatus || 'N/A'} answer={answers['elt-status']} onChange={setAnswer} noNote={noNotes['elt-status']} onNoNoteChange={setNoNote} />
          </div>
        </ProfileCard>

        {/* ── Uploaded Documents ── */}
        <ProfileCard title="Uploaded Documents" icon={Paperclip} qcIds={['service-email', 'docs-uploaded']} answers={answers}>
          <p className="text-[12px] text-grey-60 mb-3">
            <span className="font-semibold text-grey-90">{uploadedCount}</span> of {allDocs.length} documents uploaded
          </p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {documentSections.map(section => (
              <div key={section.title}>
                <p className="text-[10px] font-semibold text-grey-50 uppercase tracking-wider mb-1.5">{section.title}</p>
                <div className="space-y-1">
                  {section.docs.map(doc => {
                    const uploaded = lead.documents?.[doc]
                    return (
                      <div key={doc} className="flex items-center gap-1.5 text-[12px]">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${uploaded ? 'bg-green' : 'bg-grey-20'}`} />
                        <span className={uploaded ? 'text-grey-70' : 'text-grey-30'}>{doc}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <QCOnlyRow id="service-email" question="Correct service email received by student" answer={answers['service-email']} onChange={setAnswer} noNote={noNotes['service-email']} onNoNoteChange={setNoNote} />
            <QCOnlyRow id="docs-uploaded" question="All correct documents are uploaded" answer={answers['docs-uploaded']} onChange={setAnswer} noNote={noNotes['docs-uploaded']} onNoNoteChange={setNoNote} />
          </div>
        </ProfileCard>

        {/* ── Progress & Timeline ── */}
        <ProfileCard title="Progress & Timeline" icon={Clock} qcIds={['next-steps', 'poc-name', 'deadline']} answers={answers}>
          <div className="grid grid-cols-2 gap-3">
            <QCOnlyRow id="next-steps" question="Next 3 steps are understood by the student" answer={answers['next-steps']} onChange={setAnswer} noNote={noNotes['next-steps']} onNoNoteChange={setNoNote} />
            <QCOnlyRow id="poc-name" question="POC / Coach name is known to student" answer={answers['poc-name']} onChange={setAnswer} noNote={noNotes['poc-name']} onNoNoteChange={setNoNote} />
            <QCOnlyRow id="deadline" question="Deadline is known to the student (if any)" answer={answers['deadline']} onChange={setAnswer} noNote={noNotes['deadline']} onNoNoteChange={setNoNote} />
          </div>
        </ProfileCard>

        {/* ── Red Flags & Satisfaction ── */}
        <ProfileCard title="Red Flags & Satisfaction" icon={Shield} qcIds={['no-verbal-promises', 'no-pressure', 'clear-on-package']} answers={answers}>
          <div className="grid grid-cols-2 gap-3">
            <QCOnlyRow id="no-verbal-promises" question="No verbal promises made outside tracker" answer={answers['no-verbal-promises']} onChange={setAnswer} noNote={noNotes['no-verbal-promises']} onNoNoteChange={setNoNote} />
            <QCOnlyRow id="no-pressure" question="No pressure to pay immediately" answer={answers['no-pressure']} onChange={setAnswer} noNote={noNotes['no-pressure']} onNoNoteChange={setNoNote} />
            <QCOnlyRow id="clear-on-package" question="Student is clear on package sold before payment" answer={answers['clear-on-package']} onChange={setAnswer} noNote={noNotes['clear-on-package']} onNoNoteChange={setNoNote} />
          </div>
        </ProfileCard>

        {/* ── After Call guidance ── */}
        <div className="border border-amber-200 rounded-xl overflow-hidden mt-2">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border-b border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">After this call</span>
          </div>
          <div className="px-4 py-3 bg-amber-50/40 space-y-2">
            <div className="flex items-start gap-2">
              <Info className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-amber-800">If <strong>2+ mismatches</strong> found → Flag to RM/Span (note Coach Name, Span Name columns in tracker)</p>
            </div>
            <div className="flex items-start gap-2">
              <Info className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-amber-800">If <strong>verbal guarantees</strong> were made → Flag to compliance immediately</p>
            </div>
            <div className="flex items-start gap-2">
              <Info className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-amber-800">Update the <strong>Remarks column</strong> in tracker with all QC call findings</p>
            </div>
          </div>
        </div>

        {/* QC Call Notes */}
        <div>
          <label className="text-[11px] font-semibold text-grey-40 uppercase tracking-wider block mb-2">
            QC Call Notes
          </label>
          <textarea
            value={callNotes}
            onChange={e => setCallNotes(e.target.value)}
            rows={3}
            placeholder="Overall notes from the QC call..."
            className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 placeholder:text-grey-30 outline-none focus:border-blue-90 resize-none bg-white"
          />
        </div>
      </div>
    </div>
  )
}
