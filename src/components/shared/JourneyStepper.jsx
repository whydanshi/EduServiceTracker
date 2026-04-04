import { Check, FileText, Shield, Video, Search, ListChecks, Send, ClipboardCheck, Award } from 'lucide-react'

const JOURNEY_STEPS = [
  { id: 'documentPrep',            label: 'Document Preparation',            icon: FileText },
  { id: 'aps',                     label: 'APS',                             icon: Shield },
  { id: 'virtualCounselling',      label: 'Virtual Counselling Session',     icon: Video },
  { id: 'universityShortlisting',  label: 'University Shortlisting',         icon: Search },
  { id: 'universityFinalization',  label: 'Universities Finalization',       icon: ListChecks },
  { id: 'universityApplications',  label: 'University Applications',         icon: Send },
  { id: 'applicationReview',       label: 'Application Review & Decisions',  icon: ClipboardCheck },
  { id: 'offerLetter',             label: 'Offer Letter Received',           icon: Award },
]

export { JOURNEY_STEPS }

export default function JourneyStepper({ journey, activeStepId, onStepClick, readOnly = false }) {
  if (!journey?.steps) return null

  const currentStepIndex = journey.currentStep ?? 0

  return (
    <div className="w-[240px] flex-shrink-0 bg-white border-r border-grey-20 overflow-y-auto">
      <div className="px-4 pt-5 pb-3">
        <p className="text-[10px] font-bold text-grey-40 uppercase tracking-widest">Student Journey</p>
        <p className="text-[11px] text-grey-30 mt-0.5">Step {currentStepIndex + 1} of {JOURNEY_STEPS.length}</p>
      </div>

      <nav className="px-3 pb-6">
        {JOURNEY_STEPS.map((step, idx) => {
          const stepData = journey.steps[step.id]
          const status = stepData?.status || 'pending'
          const isActive = activeStepId === step.id
          const isCompleted = status === 'completed'
          const isCurrent = status === 'active'
          const isPending = status === 'pending'
          const isLast = idx === JOURNEY_STEPS.length - 1
          const StepIcon = step.icon

          const canClick = !readOnly || isCompleted || isCurrent

          return (
            <div key={step.id} className="relative">
              {/* Connector line */}
              {!isLast && (
                <div
                  className={`absolute left-[19px] top-[40px] w-[2px] h-[calc(100%-16px)] ${
                    isCompleted ? 'bg-green' : 'bg-grey-20'
                  }`}
                />
              )}

              <button
                onClick={() => canClick && onStepClick(step.id)}
                disabled={!canClick}
                className={`relative w-full flex items-start gap-3 px-2 py-3 rounded-lg text-left transition-all ${
                  isActive
                    ? 'bg-blue-10 ring-1 ring-blue-40'
                    : canClick
                      ? 'hover:bg-grey-5'
                      : ''
                }`}
              >
                {/* Step indicator */}
                <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center flex-shrink-0 text-[12px] font-bold border-2 transition-colors ${
                  isCompleted
                    ? 'bg-green border-green text-white'
                    : isCurrent
                      ? 'bg-blue-90 border-blue-90 text-white'
                      : isActive
                        ? 'bg-white border-blue-90 text-blue-90'
                        : 'bg-white border-grey-20 text-grey-30'
                }`}>
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : <StepIcon className="w-3.5 h-3.5" />}
                </div>

                {/* Label + status */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className={`text-[12px] font-medium leading-tight ${
                    isActive || isCurrent ? 'text-grey-95' : isCompleted ? 'text-grey-70' : 'text-grey-40'
                  }`}>
                    {step.label}
                  </p>
                  {isCompleted && stepData?.completedAt && (
                    <p className="text-[10px] text-green mt-0.5">Completed {stepData.completedAt}</p>
                  )}
                  {isCurrent && (
                    <p className="text-[10px] text-blue-90 font-semibold mt-0.5">ACTIVE STEP</p>
                  )}
                </div>
              </button>
            </div>
          )
        })}
      </nav>
    </div>
  )
}
