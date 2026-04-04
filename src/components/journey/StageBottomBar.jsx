import { Save, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react'

export default function StageBottomBar({
  stageLabel,
  onSaveDraft,
  onMarkComplete,
  onNextStep,
  isCompleted = false,
  isLastStep = false,
  canComplete = true,
  lastSaved = null,
  readOnly = false,
}) {
  if (readOnly) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-grey-20 px-8 py-3 flex items-center gap-3 z-30 shadow-lg">
      {/* Left: help + auto-save */}
      <div className="flex items-center gap-4 mr-auto">
        <button className="flex items-center gap-1.5 text-[12px] text-blue-90 font-medium hover:underline">
          <HelpCircle className="w-3.5 h-3.5" /> Need Help?
        </button>
        {lastSaved && (
          <span className="text-[11px] text-grey-30">Last saved: {lastSaved}</span>
        )}
        {stageLabel && (
          <span className="text-[11px] text-grey-40 font-medium">{stageLabel}</span>
        )}
      </div>

      {/* Right: actions */}
      <button
        onClick={onSaveDraft}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium border border-grey-20 text-grey-60 hover:bg-grey-5 transition-colors"
      >
        <Save className="w-4 h-4" /> Save Draft
      </button>

      <button
        onClick={onMarkComplete}
        disabled={!canComplete || isCompleted}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
          isCompleted
            ? 'bg-green-light text-green cursor-default'
            : canComplete
              ? 'border-2 border-green text-green hover:bg-green-light'
              : 'bg-grey-10 text-grey-30 cursor-not-allowed'
        }`}
      >
        <CheckCircle2 className="w-4 h-4" />
        {isCompleted ? 'Completed' : 'Mark as Complete'}
      </button>

      {!isLastStep && (
        <button
          onClick={onNextStep}
          disabled={!isCompleted}
          className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
            isCompleted
              ? 'bg-blue-90 text-white hover:bg-blue-50'
              : 'bg-grey-10 text-grey-30 cursor-not-allowed'
          }`}
        >
          Next Step <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
