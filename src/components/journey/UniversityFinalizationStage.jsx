import { useState, useMemo } from 'react'
import { ListChecks, CheckSquare, Square, Lock, LockOpen } from 'lucide-react'
import BentoCard from '../shared/BentoCard'
import PocComments from './PocComments'
import StageBottomBar from './StageBottomBar'
import { useToast } from '../shared/Toast'

const MIN_FINALIZED = 4
const MAX_FINALIZED = 5

export default function UniversityFinalizationStage({ stageData, lead, onUpdate, readOnly = false }) {
  const { toast } = useToast()
  const data = stageData || {}
  const shortlist = useMemo(
    () => lead?.journey?.steps?.universityShortlisting?.universities || [],
    [lead?.journey?.steps?.universityShortlisting?.universities]
  )
  const [finalizedIds, setFinalizedIds] = useState(() => {
    const existing = (data.finalizedUniversities || []).map(u => u.id)
    if (existing.length > 0) return new Set(existing)
    return new Set()
  })
  const [locked, setLocked] = useState(data.locked ?? false)
  const [comments, setComments] = useState(data.stageComments || [])

  const isCompleted = data.status === 'completed'
  const finalizedList = useMemo(
    () => shortlist.filter(u => finalizedIds.has(u.id)),
    [shortlist, finalizedIds]
  )
  const count = finalizedList.length
  const canComplete = count >= MIN_FINALIZED && count <= MAX_FINALIZED

  const toggleFinalized = (id) => {
    if (readOnly || locked) return
    setFinalizedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size < MAX_FINALIZED) next.add(id)
      else toast({ title: `Maximum ${MAX_FINALIZED} universities can be finalized`, type: 'error' })
      return next
    })
  }

  const handleLock = () => {
    if (count < MIN_FINALIZED || count > MAX_FINALIZED) {
      toast({ title: `Select between ${MIN_FINALIZED} and ${MAX_FINALIZED} universities first`, type: 'error' })
      return
    }
    setLocked(true)
    toast({ title: 'List locked for applications', type: 'success' })
  }

  const handleSaveDraft = () => {
    onUpdate?.({ ...data, finalizedUniversities: finalizedList, locked, stageComments: comments })
    toast({ title: 'Draft saved', type: 'success' })
  }

  const handleMarkComplete = () => {
    if (!canComplete) {
      toast({ title: `Select ${MIN_FINALIZED} to ${MAX_FINALIZED} universities to finalize`, type: 'error' })
      return
    }
    onUpdate?.({ ...data, status: 'completed', completedAt: new Date().toLocaleDateString('en-IN'), finalizedUniversities: finalizedList, locked: true, stageComments: comments })
    toast({ title: 'Universities finalization complete', type: 'success' })
  }

  const handleNextStep = () => {
    onUpdate?.({ status: 'completed' })
  }

  return (
    <div className="space-y-5 pb-20">
      <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-grey-10">
          <ListChecks className="w-4 h-4 text-grey-40" />
          <h3 className="text-[14px] font-semibold text-grey-95">Universities Finalization</h3>
          <span className="text-[12px] text-grey-40 ml-1">
            Select 4–5 universities from the shortlist. Lock the list after discussion with the student.
          </span>
        </div>
        <div className="px-5 py-5">
          <p className="text-[13px] text-grey-60 mb-5">
            {shortlist.length === 0
              ? 'Complete the University Shortlisting step first to see the shortlist here.'
              : `Finalized: ${count} of ${MAX_FINALIZED} (min ${MIN_FINALIZED}).`}
          </p>

          {shortlist.length > 0 && (
            <BentoCard title={`Shortlist (${shortlist.length}) → Finalized (${count})`} icon={ListChecks}>
              <div className="space-y-2">
                {shortlist.map(uni => {
                  const selected = finalizedIds.has(uni.id)
                  return (
                    <div
                      key={uni.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                        selected ? 'border-blue-40 bg-blue-10' : 'border-grey-15 bg-grey-5'
                      } ${!readOnly && !locked ? 'cursor-pointer hover:border-grey-30' : ''}`}
                      onClick={() => !readOnly && !locked && toggleFinalized(uni.id)}
                    >
                      {!readOnly && !locked ? (
                        selected ? <CheckSquare className="w-5 h-5 text-blue-90 flex-shrink-0" /> : <Square className="w-5 h-5 text-grey-40 flex-shrink-0" />
                      ) : selected ? (
                        <CheckSquare className="w-5 h-5 text-blue-90 flex-shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-grey-20 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-grey-95">{uni.name}</p>
                        <p className="text-[11px] text-grey-40">{uni.course || ''} {uni.city ? `· ${uni.city}` : ''}</p>
                      </div>
                      {selected && <span className="text-[11px] font-medium text-blue-90 bg-blue-10 px-2 py-0.5 rounded">Finalized</span>}
                    </div>
                  )
                })}
              </div>
              {!readOnly && !locked && canComplete && (
                <div className="mt-4 pt-4 border-t border-grey-10">
                  <button
                    type="button"
                    onClick={handleLock}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold bg-grey-15 text-grey-70 hover:bg-grey-20 transition-colors"
                  >
                    <Lock className="w-4 h-4" /> Lock list for applications
                  </button>
                </div>
              )}
              {locked && (
                <div className="mt-4 pt-4 border-t border-grey-10 flex items-center gap-2 text-[12px] text-grey-50">
                  <LockOpen className="w-4 h-4" /> List locked
                </div>
              )}
            </BentoCard>
          )}
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
        stageLabel="Universities Finalization"
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
