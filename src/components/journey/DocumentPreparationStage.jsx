import { useState } from 'react'
import { FileText, CheckCircle2, Eye, Square, CheckSquare } from 'lucide-react'
import BentoCard from '../shared/BentoCard'
import PocComments from './PocComments'
import StageBottomBar from './StageBottomBar'
import { useToast } from '../shared/Toast'

const DOCUMENT_SECTIONS = [
  { title: 'Personal Documents', docs: ['Recent Photo', 'Passport (Front)', 'Passport (Last Page)', 'Signature', 'Birth Certificate'] },
  { title: 'Academic Documents', docs: ['10th Mark Sheet', '12th Mark Sheet', '1st Semester Marksheet', '2nd Semester Marksheet', 'Graduation Certificate'] },
  { title: 'German Education Specific', docs: ['APS Certificate', 'TestAS Certificate'] },
  { title: 'Language Documents', docs: ['IELTS Certificate', 'Medium of Instruction (MOI) Certificate', 'German Language Certificate'] },
  { title: 'Application Documents', docs: ['Europass CV', 'Letters of Recommendation', 'Letter of Motivation'] },
  { title: 'Entrance Exam Scores', docs: ['JEE Mains Score Card', 'JEE Advanced Score Card'] },
]

export default function DocumentPreparationStage({ stageData, lead, onUpdate, readOnly = false }) {
  const { toast } = useToast()
  const data = stageData || {}
  const [verifiedDocs, setVerifiedDocs] = useState(data.verifiedDocs || {})
  const [comments, setComments] = useState(data.stageComments || [])

  const isCompleted = data.status === 'completed'
  const allDocs = DOCUMENT_SECTIONS.flatMap(s => s.docs)
  const uploadedCount = allDocs.filter(doc => lead?.documents?.[doc]).length
  const verifiedCount = allDocs.filter(doc => verifiedDocs[doc]).length
  const canComplete = uploadedCount >= 1 && (verifiedCount >= Math.min(uploadedCount, 5) || uploadedCount === allDocs.length)

  const toggleVerified = (doc) => {
    if (readOnly) return
    setVerifiedDocs(prev => ({ ...prev, [doc]: !prev[doc] }))
  }

  const handleSaveDraft = () => {
    onUpdate?.({ ...data, verifiedDocs, stageComments: comments })
    toast({ title: 'Draft saved', type: 'success' })
  }

  const handleMarkComplete = () => {
    if (!canComplete) {
      toast({ title: 'Verify at least some key documents before completing', type: 'error' })
      return
    }
    onUpdate?.({ ...data, status: 'completed', completedAt: new Date().toLocaleDateString('en-IN'), verifiedDocs, stageComments: comments })
    toast({ title: 'Document Preparation marked complete', type: 'success' })
  }

  const handleNextStep = () => {
    onUpdate?.({ status: 'completed' })
  }

  return (
    <div className="space-y-5 pb-20">
      <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-grey-10">
          <FileText className="w-4 h-4 text-grey-40" />
          <h3 className="text-[14px] font-semibold text-grey-95">Document Preparation</h3>
          <span className="text-[12px] text-grey-40 ml-1">
            {uploadedCount} of {allDocs.length} uploaded · {verifiedCount} verified
          </span>
        </div>

        <div className="px-5 py-5">
          <p className="text-[13px] text-grey-60 mb-5">
            Ensure all required documents are collected, verified, and formatted for university applications. Check each document once reviewed.
          </p>
          <div className="grid grid-cols-2 gap-6">
            {DOCUMENT_SECTIONS.map(section => (
              <div key={section.title}>
                <p className="text-[11px] font-semibold text-grey-60 uppercase tracking-wider mb-2">{section.title}</p>
                <div className="space-y-1.5">
                  {section.docs.map(doc => {
                    const uploaded = lead?.documents?.[doc]
                    const verified = verifiedDocs[doc]
                    const docData = typeof uploaded === 'string' ? { name: doc, url: uploaded } : uploaded
                    return (
                      <div
                        key={doc}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
                          verified ? 'border-green bg-green-light/30' : uploaded ? 'border-grey-20 bg-grey-5' : 'border-grey-15 bg-grey-5 opacity-70'
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {!readOnly && uploaded ? (
                            <button
                              type="button"
                              onClick={() => toggleVerified(doc)}
                              className="flex-shrink-0 p-0.5 rounded hover:bg-grey-10 transition-colors"
                            >
                              {verified ? <CheckSquare className="w-4 h-4 text-green" /> : <Square className="w-4 h-4 text-grey-40" />}
                            </button>
                          ) : verified ? (
                            <CheckCircle2 className="w-4 h-4 text-green flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-grey-20 flex-shrink-0" />
                          )}
                          <span className={`text-[12px] truncate ${uploaded ? 'font-medium text-grey-80' : 'text-grey-40'}`}>{doc}</span>
                          {uploaded && docData?.uploadedAt && (
                            <span className="text-[10px] text-grey-40 ml-1 flex-shrink-0">({docData.uploadedAt})</span>
                          )}
                        </div>
                        {uploaded && (
                          <span className="flex items-center gap-1 text-[10px] font-medium text-blue-90 bg-blue-10 px-2 py-0.5 rounded flex-shrink-0">
                            <Eye className="w-3 h-3" /> View
                          </span>
                        )}
                        {!uploaded && <span className="text-[10px] text-grey-30 flex-shrink-0">Not uploaded</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PocComments
        comments={comments}
        onAddComment={(c) => {
          const updated = [...comments, c]
          setComments(updated)
          onUpdate?.({ ...data, stageComments: updated })
        }}
        readOnly={readOnly}
      />

      <StageBottomBar
        stageLabel="Document Preparation"
        onSaveDraft={handleSaveDraft}
        onMarkComplete={handleMarkComplete}
        onNextStep={handleNextStep}
        isCompleted={isCompleted}
        canComplete={canComplete}
        readOnly={readOnly}
        isLastStep={false}
      />
    </div>
  )
}
