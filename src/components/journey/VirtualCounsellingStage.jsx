import { useState } from 'react'
import { Video, User, Calendar, Link as LinkIcon, Lock, Copy, Check } from 'lucide-react'
import BentoCard from '../shared/BentoCard'
import PocComments from './PocComments'
import StageBottomBar from './StageBottomBar'
import { useToast } from '../shared/Toast'

export default function VirtualCounsellingStage({ stageData, lead, onUpdate, readOnly = false }) {
  const { toast } = useToast()
  const data = stageData || {}
  const [counselor, setCounselor] = useState(data.counselor || '')
  const [counselorRole, setCounselorRole] = useState(data.counselorRole || '')
  const [sessionDate, setSessionDate] = useState(data.sessionDate || '')
  const [meetingLink, setMeetingLink] = useState(data.meetingLink || '')
  const [notes, setNotes] = useState(data.notes || '')
  const [comments, setComments] = useState(data.stageComments || [])
  const [copied, setCopied] = useState(false)

  const isCompleted = data.status === 'completed'

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetingLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({ title: 'Link copied', type: 'success' })
    })
  }

  const handleSaveDraft = () => {
    toast({ title: 'Draft saved', type: 'success' })
  }

  const handleMarkComplete = () => {
    if (!notes.trim()) {
      toast({ title: 'Please add counselling notes before completing', type: 'error' })
      return
    }
    onUpdate?.({ ...data, status: 'completed', completedAt: new Date().toLocaleDateString('en-IN'), notes, counselor, sessionDate, meetingLink })
    toast({ title: 'Virtual Counselling session marked complete', type: 'success' })
  }

  const handleNextStep = () => {
    onUpdate?.({ status: 'completed' })
  }

  return (
    <div className="space-y-5 pb-20">
      {/* Header */}
      <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-grey-10">
          <Video className="w-4 h-4 text-grey-40" />
          <h3 className="text-[14px] font-semibold text-grey-95">Virtual Counselling Details</h3>
          <span className="text-[12px] text-grey-40 ml-1">Manage and conduct the session with the student.</span>
        </div>

        <div className="px-5 py-5">
          <div className="grid grid-cols-3 gap-4">
            {/* Counselor */}
            <div className="bg-grey-5 rounded-xl px-4 py-4 border border-grey-10">
              <p className="text-[10px] text-grey-40 uppercase tracking-wider font-semibold mb-3">Assigned Counselor</p>
              {readOnly ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-10 border border-blue-40 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-90" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-grey-95">{counselor || 'Unassigned'}</p>
                    <p className="text-[11px] text-grey-40">{counselorRole || 'N/A'}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    value={counselor} onChange={e => setCounselor(e.target.value)}
                    placeholder="Counselor name"
                    className="w-full border border-grey-20 rounded-lg px-3 py-2 text-[13px] text-grey-70 outline-none focus:border-blue-90"
                  />
                  <input
                    value={counselorRole} onChange={e => setCounselorRole(e.target.value)}
                    placeholder="Role / title"
                    className="w-full border border-grey-20 rounded-lg px-3 py-2 text-[13px] text-grey-70 outline-none focus:border-blue-90"
                  />
                </div>
              )}
            </div>

            {/* Session Date */}
            <div className="bg-grey-5 rounded-xl px-4 py-4 border border-grey-10">
              <p className="text-[10px] text-grey-40 uppercase tracking-wider font-semibold mb-3">Session Date & Time</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-grey-40" />
                {readOnly ? (
                  <p className="text-[14px] font-medium text-grey-95">{sessionDate || 'Not scheduled'}</p>
                ) : (
                  <input
                    type="datetime-local"
                    value={sessionDate ? new Date(sessionDate).toISOString().slice(0, 16) : ''}
                    onChange={e => setSessionDate(e.target.value)}
                    className="flex-1 border border-grey-20 rounded-lg px-3 py-2 text-[13px] text-grey-70 outline-none focus:border-blue-90"
                  />
                )}
              </div>
            </div>

            {/* Meeting Link */}
            <div className="bg-grey-5 rounded-xl px-4 py-4 border border-grey-10">
              <p className="text-[10px] text-grey-40 uppercase tracking-wider font-semibold mb-3">Meeting Link</p>
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-grey-40 flex-shrink-0" />
                {readOnly ? (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <a href={`https://${meetingLink}`} target="_blank" rel="noopener noreferrer"
                      className="text-[13px] text-blue-90 truncate hover:underline">{meetingLink || 'No link'}</a>
                    {meetingLink && (
                      <button onClick={handleCopyLink} className="flex-shrink-0">
                        {copied ? <Check className="w-4 h-4 text-green" /> : <Copy className="w-4 h-4 text-grey-40 hover:text-grey-60" />}
                      </button>
                    )}
                  </div>
                ) : (
                  <input
                    value={meetingLink} onChange={e => setMeetingLink(e.target.value)}
                    placeholder="meet.google.com/..."
                    className="flex-1 border border-grey-20 rounded-lg px-3 py-2 text-[13px] text-grey-70 outline-none focus:border-blue-90"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Counselling Notes */}
      <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-grey-10">
          <h3 className="text-[14px] font-semibold text-grey-95">Counselling Notes</h3>
        </div>
        <div className="px-5 py-4">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            disabled={readOnly}
            rows={8}
            placeholder="Record key takeaways, student preferences, and detailed discussion points here..."
            className="w-full border border-grey-20 rounded-lg px-4 py-3 text-[13px] text-grey-70 placeholder:text-grey-30 outline-none focus:border-blue-90 resize-none disabled:bg-grey-5"
          />
          <div className="flex items-center gap-1.5 mt-2">
            <Lock className="w-3 h-3 text-grey-30" />
            <p className="text-[11px] text-grey-30">Only visible to the counselor and designated POC.</p>
          </div>
        </div>
      </div>

      {/* Stage Comments */}
      <PocComments
        comments={comments}
        onAddComment={(c) => setComments(prev => [...prev, c])}
        readOnly={readOnly}
      />

      <StageBottomBar
        stageLabel="Virtual Counselling Session"
        onSaveDraft={handleSaveDraft}
        onMarkComplete={handleMarkComplete}
        onNextStep={handleNextStep}
        isCompleted={isCompleted}
        canComplete={!!notes.trim()}
        readOnly={readOnly}
      />
    </div>
  )
}
