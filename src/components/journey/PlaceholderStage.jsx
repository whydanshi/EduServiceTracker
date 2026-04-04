import { Construction } from 'lucide-react'
import PocComments from './PocComments'
import StageBottomBar from './StageBottomBar'
import { useToast } from '../shared/Toast'

const STAGE_DESCRIPTIONS = {
  studentProfile: {
    title: 'Student Profile',
    description: 'Review and verify the complete student profile, academic records, and documents submitted during the onboarding process.',
  },
  documentPrep: {
    title: 'Document Preparation',
    description: 'Ensure all required documents are collected, verified, and formatted for university applications. This includes academic transcripts, language certificates, identity documents, and supporting materials.',
  },
  universityFinalization: {
    title: 'Universities Finalization',
    description: 'The student selects 4-5 universities from the shortlist. The POC marks finalized universities and adds comments. After discussion with the student, the final list is locked for applications.',
  },
  universityApplications: {
    title: 'University Applications',
    description: 'Manage active university applications with their deadlines. Track application windows (15-30 or 30-45 days, varies by university), additional requirements like notarised documents, assessment fees, and interviews.',
  },
  applicationReview: {
    title: 'Application Review & Decisions',
    description: 'Track the current status and decisions for submitted university applications. Monitor application types (Uni-Assist, VPD, Direct, Email, Courier), decision TAT (6-15 weeks), and reviewer comments.',
  },
  offerLetter: {
    title: 'Offer Letter Received',
    description: 'Confirm received offers from universities, upload offer letters, and select the final university for enrollment. Mark the final choice to complete the student journey.',
  },
}

export default function PlaceholderStage({ stageId, stageData, onUpdate, readOnly = false }) {
  const { toast } = useToast()
  const info = STAGE_DESCRIPTIONS[stageId] || { title: stageId, description: '' }
  const data = stageData || {}
  const isCompleted = data.status === 'completed'
  const comments = data.stageComments || []

  const handleSaveDraft = () => toast({ title: 'Draft saved', type: 'success' })
  const handleMarkComplete = () => {
    onUpdate?.({ ...data, status: 'completed', completedAt: new Date().toLocaleDateString('en-IN') })
    toast({ title: `${info.title} marked complete`, type: 'success' })
  }
  const handleNextStep = () => onUpdate?.({ status: 'completed' })

  return (
    <div className="space-y-5 pb-20">
      <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
        <div className="px-8 py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-10 border border-blue-40 flex items-center justify-center mx-auto mb-5">
            <Construction className="w-8 h-8 text-blue-90" />
          </div>
          <h2 className="text-[18px] font-semibold text-grey-95 mb-2">{info.title}</h2>
          <p className="text-[13px] text-grey-50 leading-relaxed max-w-lg mx-auto mb-6">{info.description}</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-light text-amber text-[12px] font-semibold">
            <Construction className="w-3.5 h-3.5" />
            Detailed implementation coming soon
          </div>
        </div>
      </div>

      <PocComments
        comments={comments}
        onAddComment={(c) => {
          const updated = [...comments, c]
          onUpdate?.({ ...data, stageComments: updated })
        }}
        readOnly={readOnly}
      />

      <StageBottomBar
        stageLabel={info.title}
        onSaveDraft={handleSaveDraft}
        onMarkComplete={handleMarkComplete}
        onNextStep={handleNextStep}
        isCompleted={isCompleted}
        canComplete={true}
        readOnly={readOnly}
        isLastStep={stageId === 'offerLetter'}
      />
    </div>
  )
}
