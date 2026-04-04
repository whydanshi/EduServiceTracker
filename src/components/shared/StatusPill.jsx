import { CheckCircle2, XCircle, Clock, AlertCircle, MessageSquare, Send, FileCheck, UserCheck, Hourglass, CircleDot, Mail, MailCheck, TrendingUp } from 'lucide-react'

/**
 * Sales status: Outlined/stroke pills
 * - Filled dot = action required from sales
 * - Hollow/ring dot = no action needed (waiting/passive)
 */

// Whether the sales status requires action from the sales person
const salesActionRequired = {
  'Sales form required': true,
  'More info required': true,
  'Draft': true,
  // These don't require sales action:
  'Submitted evaluation': false,
  'Qualified': false,
  'Converted': false,
  'Following up': false,
  'Pending': false,
  'Lost': false,
}

const salesColorMap = {
  'Submitted evaluation': { border: 'border-[#3B8EA5]', text: 'text-[#3B8EA5]' },
  'Qualified':            { border: 'border-[#3B8EA5]', text: 'text-[#3B8EA5]' },
  'Sales form required':  { border: 'border-[#9333EA]', text: 'text-[#9333EA]' },
  'More info required':   { border: 'border-[#B45309]', text: 'text-[#B45309]' },
  'Draft':                { border: 'border-[#889BAC]', text: 'text-[#4E5A65]' },
  'Converted':            { border: 'border-[#16A34A]', text: 'text-[#16A34A]' },
  'Following up':         { border: 'border-[#B45309]', text: 'text-[#B45309]' },
  'Pending':              { border: 'border-[#889BAC]', text: 'text-[#4E5A65]' },
  'Lost':                 { border: 'border-[#DC2626]', text: 'text-[#DC2626]' },
}

/**
 * Service status: Filled/solid pills with icon
 *
 * Canonical statuses (in order of workflow):
 *   New               → Just received from sales, awaiting admin review/assign
 *   Assigned          → Assigned to a service member for eligibility check (Stage 1)
 *   Serviceable       → Eligibility passed, waiting for Sales Form 2
 *   Not Serviceable   → Rejected at eligibility
 *   Need More Info    → More info requested (Stage 1 or 2)
 *   QC Check          → Sales Form 2 received, needs QC review (Stage 2)
 *   QC Checked        → QC passed
 *   Acknowledgement Sent     → Ack email sent (Stage 3)
 *   Acknowledgement Received → Student acknowledged
 *   Converted         → Final conversion
 */
const serviceStyleMap = {
  // Canonical statuses
  'New':                      { bg: 'bg-[#7C3AED]', icon: Hourglass },
  'Assigned':                 { bg: 'bg-[#3B8EA5]', icon: UserCheck },
  'Serviceable':              { bg: 'bg-[#2D6A2E]', icon: CheckCircle2 },
  'Not Serviceable':          { bg: 'bg-[#991B1B]', icon: XCircle },
  'Need More Info':           { bg: 'bg-[#92600A]', icon: MessageSquare },
  'QC Check':                 { bg: 'bg-[#1D4ED8]', icon: CircleDot },
  'QC Checked':               { bg: 'bg-[#2D6A2E]', icon: FileCheck },
  'Acknowledgement Sent':     { bg: 'bg-[#6D28D9]', icon: Mail },
  'Acknowledgement Received': { bg: 'bg-[#5B21B6]', icon: MailCheck },
  'Converted':                { bg: 'bg-[#166534]', icon: TrendingUp },
  // Legacy / fallback
  'Draft':                    { bg: 'bg-[#6B7280]', icon: CircleDot },
  'New Lead':                 { bg: 'bg-[#3B8EA5]', icon: Hourglass },
  'Signature Received':       { bg: 'bg-[#2D6A2E]', icon: CheckCircle2 },
  'Pending Evaluation':       { bg: 'bg-[#3B8EA5]', icon: Hourglass },
  'In Review':                { bg: 'bg-[#3B8EA5]', icon: Clock },
  'Quality Check':            { bg: 'bg-[#3B8EA5]', icon: CircleDot },
  'Processing':               { bg: 'bg-[#3B8EA5]', icon: Clock },
  'Email Sent':               { bg: 'bg-[#6D28D9]', icon: Send },
  'More Info Required':       { bg: 'bg-[#92600A]', icon: MessageSquare },
  'On Hold':                  { bg: 'bg-[#92600A]', icon: AlertCircle },
  'Rejected':                 { bg: 'bg-[#991B1B]', icon: XCircle },
  'Failed':                   { bg: 'bg-[#991B1B]', icon: XCircle },
}

export function SalesStatusPill({ status, size = 'sm' }) {
  const colors = salesColorMap[status] || { border: 'border-[#889BAC]', text: 'text-[#4E5A65]' }
  const needsAction = salesActionRequired[status] ?? false

  const sizeClasses = size === 'sm'
    ? 'text-[11px] px-2.5 py-1'
    : 'text-[12px] px-3 py-1.5'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium border bg-white whitespace-nowrap ${colors.border} ${colors.text} ${sizeClasses}`}>
      {/* Filled dot for action, ring/hollow dot for passive */}
      {needsAction ? (
        <span className={`w-[6px] h-[6px] rounded-full`} style={{ backgroundColor: 'currentColor' }} />
      ) : (
        <span className={`w-[6px] h-[6px] rounded-full border-[1.5px]`} style={{ borderColor: 'currentColor' }} />
      )}
      {status}
    </span>
  )
}

export function ServiceStatusPill({ status, size = 'sm' }) {
  const style = serviceStyleMap[status] || { bg: 'bg-[#4E5A65]', icon: CircleDot }
  const IconComp = style.icon

  const sizeClasses = size === 'sm'
    ? 'text-[11px] px-2.5 py-1'
    : 'text-[12px] px-3 py-1.5'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md font-semibold text-white whitespace-nowrap ${style.bg} ${sizeClasses}`}>
      <IconComp className="w-3 h-3" strokeWidth={2.2} />
      {status}
    </span>
  )
}

// Default export for backward compat (uses service style)
export default function StatusPill({ status, type = 'service', size = 'sm' }) {
  if (type === 'sales') return <SalesStatusPill status={status} size={size} />
  return <ServiceStatusPill status={status} size={size} />
}
