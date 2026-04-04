import { useState, useEffect, useCallback } from 'react'
import {
  Phone, Square, CheckSquare,
  AlertTriangle, Info, CheckCircle2, XCircle, MessageSquare
} from 'lucide-react'

const formatINR = (v) => v != null ? `₹${Number(v).toLocaleString('en-IN')}` : null

function SectionHeading({ children }) {
  return (
    <p className="text-[10px] font-semibold text-grey-40 uppercase tracking-widest mb-3 mt-6 first:mt-0">
      {children}
    </p>
  )
}

function DataBadge({ value }) {
  if (!value) return null
  return (
    <span className="ml-auto flex-shrink-0 text-[11px] bg-grey-10 px-2 py-0.5 rounded-full text-grey-60 font-medium whitespace-nowrap max-w-[160px] truncate">
      {value}
    </span>
  )
}

function CheckRow({ id, label, badge, checked, onChange, children }) {
  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={() => onChange(id)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${
          checked ? 'bg-green-light/30 hover:bg-green-light/50' : 'hover:bg-grey-5'
        }`}
      >
        {checked
          ? <CheckSquare className="w-4 h-4 text-green flex-shrink-0" />
          : <Square className="w-4 h-4 text-grey-30 flex-shrink-0" />}
        <span className="text-[13px] flex-1 text-grey-80">{label}</span>
        {badge && <DataBadge value={badge} />}
      </button>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────
export default function QCChecklist({ lead, onCheckedChange, onQCComplete, onReject, onMoreInfo }) {
  const [checked, setChecked] = useState(new Set())
  const [exclusionRemarks, setExclusionRemarks] = useState('')
  const [callNotes, setCallNotes] = useState('')

  const TOTAL = 21

  const toggle = useCallback((id) => {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  useEffect(() => {
    onCheckedChange?.(checked.size, TOTAL)
  }, [checked, onCheckedChange])

  // Derive badge values from lead
  const cgpaBadge = lead.cgpa != null
    ? `${lead.cgpa} / ${lead.cgpaOutOf ?? 10} CGPA`
    : lead.percentage != null
    ? `${lead.percentage}%`
    : null

  const eltBadge = lead.eltStatus === 'Given' && lead.eltType
    ? `${lead.eltType}${lead.eltScore ? ' ' + lead.eltScore : ''}`
    : lead.eltStatus || null

  const lastPaymentMode = lead.payments?.length
    ? lead.payments[lead.payments.length - 1].mode
    : null

  const docCount = (() => {
    const docs = lead.documents || {}
    const uploaded = Object.keys(docs).length
    return uploaded > 0 ? `${uploaded} uploaded` : 'None uploaded'
  })()

  return (
    <div className="px-8 py-6">
      <h2 className="text-[15px] font-semibold text-grey-90 mb-4">QC Checklist</h2>

      {/* Call-prompt banner */}
      <div className="bg-blue-10 border border-blue-20 rounded-xl px-5 py-4 mb-5 flex items-start gap-3 flex-shrink-0">
        <Phone className="w-4 h-4 text-blue-90 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[13px] font-semibold text-blue-90 mb-1">
            Call the student and confirm each item below
          </p>
          <p className="text-[12px] text-blue-90/70">
            Tick an item only after the student verbally confirms it matches.
          </p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {lead.email && (
              <span className="text-[11px] bg-white border border-blue-20 text-blue-90 px-2.5 py-1 rounded-full font-medium">
                {lead.email}
              </span>
            )}
            {lead.phone && (
              <span className="text-[11px] bg-white border border-blue-20 text-blue-90 px-2.5 py-1 rounded-full font-medium">
                +91 {lead.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 1: Student Details ── */}
      <SectionHeading>Student Details</SectionHeading>

      <CheckRow id="full-name" label="Student full name is confirmed by the student" badge={lead.studentName} checked={checked.has('full-name')} onChange={toggle} />
      <CheckRow id="email-verified" label="Leverage email ID is correct" badge={lead.email} checked={checked.has('email-verified')} onChange={toggle} />
      <CheckRow id="intake" label="Intake is confirmed by the student" badge={lead.yearOfIntake || (lead.preferredIntakeSeason && lead.intakeYear ? `${lead.preferredIntakeSeason} ${lead.intakeYear}` : null)} checked={checked.has('intake')} onChange={toggle} />
      <CheckRow id="academics" label="Previous studies & %/GPA is confirmed by the student" badge={cgpaBadge} checked={checked.has('academics')} onChange={toggle} />
      <CheckRow id="course" label="Preferred course is entered in the student's words" badge={lead.preferredCourse} checked={checked.has('course')} onChange={toggle} />

      {/* ── Section 2: Package & Fees Sold ── */}
      <SectionHeading>Package &amp; Fees Sold</SectionHeading>

      <CheckRow id="package-correct" label="Package bought is correct and understood by the student" checked={checked.has('package-correct')} onChange={toggle} />
      <CheckRow id="package-value" label="Total package value is correct and remembered by the student" badge={formatINR(lead.totalSaleValue)} checked={checked.has('package-value')} onChange={toggle} />
      <CheckRow id="payment-status" label="Payment status is confirmed by the student" badge={lead.paymentStatus} checked={checked.has('payment-status')} onChange={toggle} />
      <CheckRow id="payment-mode" label="Last payment mode used is confirmed by the student" badge={lastPaymentMode} checked={checked.has('payment-mode')} onChange={toggle} />

      {/* ── Section 3: Services Promised vs Sold ── */}
      <SectionHeading>Services Promised vs Sold</SectionHeading>

      <CheckRow id="services-included" label="Services included are correct and remembered by the student" checked={checked.has('services-included')} onChange={toggle} />

      {/* Services NOT included — with inline remarks textarea */}
      <CheckRow id="services-excluded" label="Services NOT included are known to the student" checked={checked.has('services-excluded')} onChange={toggle}>
        <div className="ml-[26px] mt-1.5 mb-1">
          <textarea
            value={exclusionRemarks}
            onChange={e => setExclusionRemarks(e.target.value)}
            rows={2}
            placeholder="Note which services are excluded..."
            className="w-full border border-grey-20 rounded-lg px-3 py-2 text-[12px] text-grey-70 placeholder:text-grey-30 outline-none focus:border-blue-90 resize-none bg-grey-5"
          />
        </div>
      </CheckRow>

      <CheckRow id="aps-status" label="APS certificate status is known to the student" badge={lead.apsStatus} checked={checked.has('aps-status')} onChange={toggle} />
      <CheckRow id="elt-status" label="ELT result status is known to the student" badge={eltBadge} checked={checked.has('elt-status')} onChange={toggle} />

      {/* ── Section 4: Progress & Timeline ── */}
      <SectionHeading>Progress &amp; Timeline</SectionHeading>

      <CheckRow id="next-steps" label="Next 3 steps are understood by the student" checked={checked.has('next-steps')} onChange={toggle} />
      <CheckRow id="poc-name" label="POC / Coach name is known to the student" badge={lead.servicePOC || lead.salesPOC} checked={checked.has('poc-name')} onChange={toggle} />
      <CheckRow id="deadline" label="Deadline is known to the student (if any)" checked={checked.has('deadline')} onChange={toggle} />

      {/* ── Section 5: Email & Documentation ── */}
      <SectionHeading>Email &amp; Documentation</SectionHeading>

      <CheckRow id="service-email" label="Correct service email has been received by the student" badge={lead.email} checked={checked.has('service-email')} onChange={toggle} />
      <CheckRow id="docs-uploaded" label="All correct documents are uploaded" badge={docCount} checked={checked.has('docs-uploaded')} onChange={toggle} />

      {/* ── Section 6: Red Flags & Satisfaction ── */}
      <SectionHeading>Red Flags &amp; Satisfaction</SectionHeading>

      <CheckRow id="no-verbal-promises" label="No verbal promises have been made that are not in the tracker" checked={checked.has('no-verbal-promises')} onChange={toggle} />
      <CheckRow id="no-pressure" label="There is no pressure to pay immediately" checked={checked.has('no-pressure')} onChange={toggle} />
      <CheckRow id="clear-on-package" label="Student is clear on the package sold before payment" checked={checked.has('clear-on-package')} onChange={toggle} />

      {/* ── After Call guidance (always open) ── */}
      <div className="mt-6 border border-amber-200 rounded-xl overflow-hidden">
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

      {/* ── QC Call Notes ── */}
      <div className="mt-5">
        <label className="text-[11px] font-semibold text-grey-40 uppercase tracking-wider block mb-2">
          QC Call Notes
        </label>
        <textarea
          value={callNotes}
          onChange={e => setCallNotes(e.target.value)}
          rows={4}
          placeholder="Overall notes from the QC call..."
          className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 placeholder:text-grey-30 outline-none focus:border-blue-90 resize-none"
        />
      </div>

      {/* ── Progress indicator ── */}
      <p className="text-[12px] text-grey-40 mt-3 mb-4">
        <span className={`font-semibold ${checked.size === TOTAL ? 'text-green' : 'text-grey-70'}`}>{checked.size}</span>
        <span className="text-grey-30"> / {TOTAL} </span>
        items confirmed
      </p>

      {/* ── Action buttons (below checklist only) ── */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-grey-20 mb-2">
        <button
          onClick={onMoreInfo}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold bg-amber text-white hover:bg-amber/90 transition-colors"
        >
          <MessageSquare className="w-4 h-4" /> More Info
        </button>
        <button
          onClick={onReject}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold bg-[#DC2626] text-white hover:bg-[#B91C1C] transition-colors"
        >
          <XCircle className="w-4 h-4" /> Reject
        </button>
        <button
          onClick={onQCComplete}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold bg-green text-white hover:bg-green/90 transition-colors"
        >
          <CheckCircle2 className="w-4 h-4" /> Mark QC Complete
        </button>
      </div>

    </div>
  )
}
