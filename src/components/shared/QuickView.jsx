import { useEffect, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, User, Mail, Phone, MapPin, GraduationCap, FileText, Calendar, ArrowUpRight, CheckCircle2, Eye, Clock, AlertTriangle, Info } from 'lucide-react'
import { SalesStatusPill, ServiceStatusPill } from './StatusPill'
import { JOURNEY_STEPS } from './JourneyStepper'
import { useToast } from './Toast'
import Modal from './Modal'

const JOURNEY_STAGE_NAMES = {
  documentPrep: 'Document Preparation',
  aps: 'APS',
  virtualCounselling: 'Virtual Counselling',
  universityShortlisting: 'University Shortlisting',
  universityFinalization: 'Universities Finalization',
  universityApplications: 'University Applications',
  applicationReview: 'Application Review',
  offerLetter: 'Offer Letter Received',
}

const getCurrentStageInfo = (lead) => {
  if (!lead.journey?.steps) return null
  const currentStepIdx = lead.journey.currentStep ?? 0
  const currentStep = JOURNEY_STEPS[currentStepIdx]
  if (!currentStep) return null
  const stepData = lead.journey.steps[currentStep.id]
  return {
    stepId: currentStep.id,
    stepName: JOURNEY_STAGE_NAMES[currentStep.id] || currentStep.label,
    status: stepData?.status || 'pending',
    completedAt: stepData?.completedAt,
  }
}

export default function QuickView({ isOpen, onClose, lead, onOpenFull, detailPath, onMarkStageComplete, readOnly = false }) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [remark, setRemark] = useState('')

  const handleEsc = useCallback((e) => {
    if (e.key === 'Escape') onClose?.()
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, handleEsc])

  if (!isOpen || !lead) return null

  const hasJourney = !!lead.journey?.started
  const stageInfo = getCurrentStageInfo(lead)
  const isStageCompleted = stageInfo?.status === 'completed'

  const handleMarkComplete = () => {
    if (!remark.trim() && !readOnly) {
      toast({ title: 'Add a remark', description: 'Please add a remark before completing', type: 'error' })
      return
    }
    onMarkStageComplete?.(lead, remark)
    setShowCompleteModal(false)
    setRemark('')
    toast({ title: 'Stage marked complete', description: `${stageInfo?.stepName} completed`, type: 'success' })
  }

  const handleViewDetail = () => {
    if (detailPath) {
      navigate(detailPath)
      onClose()
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Panel - slides in from right */}
      <div className="fixed right-0 top-0 bottom-0 w-[420px] bg-white shadow-xl z-50 flex flex-col border-l border-grey-20 animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-grey-20 flex-shrink-0">
          <div>
            <h3 className="text-[15px] font-semibold text-grey-95">{lead.studentName}</h3>
            <p className="text-[11px] text-grey-40 mt-0.5">ID: {lead.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleViewDetail()
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-blue-90 bg-blue-10 hover:bg-blue-20 transition-colors"
            >
              <Eye className="w-3 h-3" /> View Detail
            </button>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-grey-10 transition-colors">
              <X className="w-4 h-4 text-grey-40" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Status Row */}
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <p className="text-[10px] text-grey-40 uppercase font-medium mb-1">Sales Status</p>
              <SalesStatusPill status={lead.salesStatus} />
            </div>
            <div>
              <p className="text-[10px] text-grey-40 uppercase font-medium mb-1">Service Status</p>
              <ServiceStatusPill status={lead.serviceStatus} />
            </div>
          </div>

          {/* QC Feedback Card — when lead returned from QC with issues */}
          {lead.qcFeedback && (lead.serviceStatus === 'Need More Info' || lead.serviceStatus === 'More Info Required' || lead.salesStatus === 'More info required') && (
            <div className="border border-amber-200 bg-amber-50 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-amber-200 bg-amber-100/50">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                <p className="text-[12px] font-semibold text-amber-900">QC Feedback — {lead.qcFeedback.flaggedFields.length} issue{lead.qcFeedback.flaggedFields.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="px-4 py-3 space-y-2">
                {lead.qcFeedback.flaggedFields.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-amber-100 text-amber-700 text-[9px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-grey-90">{item.label}</p>
                      <p className="text-[11px] text-grey-60">{item.note}</p>
                    </div>
                  </div>
                ))}
                {lead.qcFeedback.callNotes && (
                  <div className="text-[11px] text-amber-800 bg-amber-100/40 rounded-lg px-2.5 py-1.5 mt-2 leading-relaxed">
                    <span className="font-semibold">Notes:</span> {lead.qcFeedback.callNotes}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Under QC Banner */}
          {lead.serviceStatus === 'QC Check' && (
            <div className="flex items-center gap-2 px-4 py-2.5 border border-blue-30 bg-blue-10 rounded-xl">
              <Info className="w-3.5 h-3.5 text-blue-90 flex-shrink-0" />
              <p className="text-[11px] text-blue-90">Under QC review — no action needed.</p>
            </div>
          )}

          {/* Journey Stage Info (if converted) */}
          {hasJourney && stageInfo && (
            <div className="border border-grey-20 rounded-xl p-4 bg-blue-5">
              <p className="text-[11px] font-semibold text-grey-40 uppercase tracking-wider mb-3">Current Journey Stage</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-grey-60">Stage</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isStageCompleted ? 'bg-green' : 'bg-blue-90'}`} />
                    <span className={`text-[13px] font-semibold ${isStageCompleted ? 'text-green' : 'text-blue-90'}`}>
                      {stageInfo.stepName}
                    </span>
                  </div>
                </div>
                {isStageCompleted && stageInfo.completedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-grey-60">Completed</span>
                    <span className="text-[12px] font-medium text-grey-70">{stageInfo.completedAt}</span>
                  </div>
                )}
                {!isStageCompleted && (
                  <div className="pt-2 border-t border-grey-10">
                    {!readOnly && (
                      <button
                        onClick={() => setShowCompleteModal(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold bg-green text-white hover:bg-green/90 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Stage Complete
                      </button>
                    )}
                    {readOnly && (
                      <div className="flex items-center gap-2 text-[12px] text-grey-40">
                        <Clock className="w-3.5 h-3.5" /> In Progress
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Student Info */}
          <div className="border border-grey-20 rounded-xl p-4">
            <p className="text-[11px] font-semibold text-grey-40 uppercase tracking-wider mb-3">Student Details</p>
            <div className="space-y-3">
              <InfoRow icon={User} label="Name" value={lead.studentName} />
              <InfoRow icon={Mail} label="Email" value={lead.email} />
              <InfoRow icon={Phone} label="Phone" value={lead.phone} />
              <InfoRow icon={MapPin} label="Location" value={`${lead.city}, ${lead.state}`} />
              <InfoRow icon={GraduationCap} label="Course" value={`${lead.courseType} - ${lead.preferredCourse}`} />
              <InfoRow icon={FileText} label="CGPA" value={lead.cgpa != null ? `${lead.cgpa} / ${lead.cgpaOutOf}` : 'N/A'} />
              <InfoRow icon={Calendar} label="Intake" value={lead.yearOfIntake} />
            </div>
          </div>

          {/* Assignment */}
          <div className="border border-grey-20 rounded-xl p-4">
            <p className="text-[11px] font-semibold text-grey-40 uppercase tracking-wider mb-3">Assignment</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-grey-40">Sales POC</span>
                <span className="text-[13px] font-medium text-grey-70">{lead.assignedToSales || lead.salesPOC || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-grey-40">Service POC</span>
                <span className="text-[13px] font-medium text-grey-70">{lead.assignedToService || 'Unassigned'}</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="border border-grey-20 rounded-xl p-4">
            <p className="text-[11px] font-semibold text-grey-40 uppercase tracking-wider mb-3">Payment</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-grey-40">Status</span>
                <span className={`text-[12px] font-semibold px-2 py-0.5 rounded-full ${
                  lead.paymentStatus === 'Full Payment Done' ? 'bg-green-light text-green' :
                  lead.paymentStatus === 'Partial' ? 'bg-amber-light text-amber' :
                  'bg-grey-10 text-grey-60'
                }`}>
                  {lead.paymentStatus === 'Full Payment Done' ? 'Full' : lead.paymentStatus === 'Partial' ? 'Partial' : 'Pending'}
                </span>
              </div>
              {lead.totalSaleValue && (
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-grey-40">Total Value</span>
                  <span className="text-[13px] font-medium text-grey-70">₹{Number(lead.totalSaleValue).toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Comments */}
          {lead.comments && (
            <div className="border border-grey-20 rounded-xl p-4">
              <p className="text-[11px] font-semibold text-grey-40 uppercase tracking-wider mb-2">Last Comment</p>
              <p className="text-[13px] text-grey-60 leading-relaxed">{lead.comments}</p>
            </div>
          )}
        </div>
      </div>

      {/* Mark Complete Modal */}
      <Modal isOpen={showCompleteModal} onClose={() => { setShowCompleteModal(false); setRemark('') }} title="Mark Stage Complete">
        <div className="space-y-4">
          <p className="text-[13px] text-grey-60">
            Marking <strong>{stageInfo?.stepName}</strong> as complete for <strong>{lead.studentName}</strong>.
          </p>
          <div>
            <label className="text-[12px] text-grey-40 font-medium block mb-1.5">Remarks <span className="text-grey-30">(optional)</span></label>
            <textarea
              value={remark}
              onChange={e => setRemark(e.target.value)}
              rows={3}
              placeholder="Add notes about completion..."
              className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 placeholder:text-grey-40 outline-none focus:border-blue-90 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => { setShowCompleteModal(false); setRemark('') }} className="px-4 py-2 rounded-lg text-[13px] font-medium text-grey-60 hover:bg-grey-10">
              Cancel
            </button>
            <button onClick={handleMarkComplete} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold bg-green text-white hover:bg-green/90">
              <CheckCircle2 className="w-4 h-4" /> Mark Complete
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-3.5 h-3.5 text-grey-40 flex-shrink-0" strokeWidth={1.5} />
      <div className="flex items-center justify-between flex-1 min-w-0">
        <span className="text-[12px] text-grey-40">{label}</span>
        <span className="text-[13px] font-medium text-grey-70 truncate ml-2 text-right">{value || 'N/A'}</span>
      </div>
    </div>
  )
}
