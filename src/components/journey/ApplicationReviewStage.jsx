import { useState, useMemo } from 'react'
import { ClipboardCheck } from 'lucide-react'
import BentoCard from '../shared/BentoCard'
import PocComments from './PocComments'
import StageBottomBar from './StageBottomBar'
import { useToast } from '../shared/Toast'

const APPLICATION_TYPES = ['Uni-Assist', 'VPD', 'Direct', 'Email', 'Courier']
const DECISION_STATUSES = ['Pending', 'Under Review', 'Accepted', 'Rejected', 'Waitlisted']

export default function ApplicationReviewStage({ stageData, lead, onUpdate, readOnly = false }) {
  const { toast } = useToast()
  const data = stageData || {}
  const applicationsFromPrev = useMemo(
    () => lead?.journey?.steps?.universityApplications?.applications || [],
    [lead?.journey?.steps?.universityApplications?.applications]
  )
  const [reviews, setReviews] = useState(data.reviews || applicationsFromPrev.map(app => ({
    applicationId: app.id,
    universityName: app.universityName,
    course: app.course,
    applicationType: app.applicationType || 'Direct',
    status: app.decisionStatus || 'Pending',
    reviewerComment: app.reviewerComment || '',
    decisionDate: app.decisionDate || '',
  })))
  const [comments, setComments] = useState(data.stageComments || [])

  const isCompleted = data.status === 'completed'
  const allReviewed = reviews.length > 0 && reviews.every(r => r.status !== 'Pending' || r.reviewerComment)
  const canComplete = reviews.length >= 1

  const updateReview = (applicationId, field, value) => {
    setReviews(prev => prev.map(r => r.applicationId === applicationId ? { ...r, [field]: value } : r))
  }

  const handleSaveDraft = () => {
    onUpdate?.({ ...data, reviews, stageComments: comments })
    toast({ title: 'Draft saved', type: 'success' })
  }

  const handleMarkComplete = () => {
    if (!canComplete) {
      toast({ title: 'Add at least one review (from applications) before completing', type: 'error' })
      return
    }
    onUpdate?.({ ...data, status: 'completed', completedAt: new Date().toLocaleDateString('en-IN'), reviews, stageComments: comments })
    toast({ title: 'Application Review stage complete', type: 'success' })
  }

  const handleNextStep = () => {
    onUpdate?.({ status: 'completed' })
  }

  return (
    <div className="space-y-5 pb-20">
      <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-grey-10">
          <ClipboardCheck className="w-4 h-4 text-grey-40" />
          <h3 className="text-[14px] font-semibold text-grey-95">Application Review & Decisions</h3>
          <span className="text-[12px] text-grey-40 ml-1">
            Track status and decisions (TAT 6–15 weeks). Add reviewer comments.
          </span>
        </div>
        <div className="px-5 py-5">
          <p className="text-[13px] text-grey-60 mb-5">
            {reviews.length === 0
              ? 'Complete University Applications first to see applications to review here.'
              : 'Update decision status and reviewer comments for each application.'}
          </p>

          <BentoCard title={`Reviews (${reviews.length})`} icon={ClipboardCheck}>
            {reviews.length === 0 ? (
              <div className="py-10 text-center">
                <ClipboardCheck className="w-10 h-10 text-grey-20 mx-auto mb-3" />
                <p className="text-[13px] text-grey-40 mb-1">No applications to review yet</p>
                <p className="text-[11px] text-grey-30">Applications from the previous step will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div
                    key={review.applicationId}
                    className="px-4 py-4 rounded-xl border border-grey-20 bg-grey-5 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-semibold text-grey-95">{review.universityName}</p>
                        <p className="text-[12px] text-grey-50">{review.course}</p>
                      </div>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                        review.status === 'Accepted' ? 'bg-green-light text-green' :
                        review.status === 'Rejected' ? 'bg-red-light text-red' :
                        review.status === 'Waitlisted' ? 'bg-amber-light text-amber' :
                        'bg-grey-10 text-grey-60'
                      }`}>
                        {review.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-grey-40 uppercase tracking-wider block mb-1">Type</label>
                        {readOnly ? (
                          <p className="text-[12px] text-grey-70">{review.applicationType}</p>
                        ) : (
                          <select
                            value={review.applicationType}
                            onChange={e => updateReview(review.applicationId, 'applicationType', e.target.value)}
                            className="w-full border border-grey-20 rounded-lg px-2.5 py-1.5 text-[12px] text-grey-70 outline-none focus:border-blue-90 bg-white"
                          >
                            {APPLICATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        )}
                      </div>
                      <div>
                        <label className="text-[10px] text-grey-40 uppercase tracking-wider block mb-1">Decision</label>
                        {readOnly ? (
                          <p className="text-[12px] text-grey-70">{review.status}</p>
                        ) : (
                          <select
                            value={review.status}
                            onChange={e => updateReview(review.applicationId, 'status', e.target.value)}
                            className="w-full border border-grey-20 rounded-lg px-2.5 py-1.5 text-[12px] text-grey-70 outline-none focus:border-blue-90 bg-white"
                          >
                            {DECISION_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        )}
                      </div>
                    </div>
                    {!readOnly && (
                      <>
                        <div>
                          <label className="text-[10px] text-grey-40 uppercase tracking-wider block mb-1">Reviewer comment</label>
                          <textarea
                            value={review.reviewerComment}
                            onChange={e => updateReview(review.applicationId, 'reviewerComment', e.target.value)}
                            rows={2}
                            placeholder="Optional notes (TAT, feedback)..."
                            className="w-full border border-grey-20 rounded-lg px-3 py-2 text-[12px] text-grey-70 outline-none focus:border-blue-90 resize-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-grey-40 uppercase tracking-wider block mb-1">Decision date</label>
                          <input
                            type="date"
                            value={review.decisionDate}
                            onChange={e => updateReview(review.applicationId, 'decisionDate', e.target.value)}
                            className="w-full border border-grey-20 rounded-lg px-3 py-1.5 text-[12px] text-grey-70 outline-none focus:border-blue-90"
                          />
                        </div>
                      </>
                    )}
                    {readOnly && (review.reviewerComment || review.decisionDate) && (
                      <div className="text-[11px] text-grey-50 pt-1 border-t border-grey-10">
                        {review.reviewerComment && <p>{review.reviewerComment}</p>}
                        {review.decisionDate && <p className="mt-1">Decision date: {review.decisionDate}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </BentoCard>
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
        stageLabel="Application Review & Decisions"
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
