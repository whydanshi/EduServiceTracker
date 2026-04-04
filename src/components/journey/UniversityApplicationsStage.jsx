import { useState, useMemo } from 'react'
import { Send, Plus, Trash2, Calendar, FileText, IndianRupee } from 'lucide-react'
import BentoCard from '../shared/BentoCard'
import PocComments from './PocComments'
import StageBottomBar from './StageBottomBar'
import Modal from '../shared/Modal'
import { useToast } from '../shared/Toast'

const WINDOW_OPTIONS = ['15–30 days', '30–45 days', 'Other']

export default function UniversityApplicationsStage({ stageData, lead, onUpdate, readOnly = false }) {
  const { toast } = useToast()
  const data = stageData || {}
  const finalizedList = useMemo(
    () => lead?.journey?.steps?.universityFinalization?.finalizedUniversities || [],
    [lead?.journey?.steps?.universityFinalization?.finalizedUniversities]
  )
  const [applications, setApplications] = useState(data.applications || [])
  const [comments, setComments] = useState(data.stageComments || [])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newApp, setNewApp] = useState({
    universityId: '',
    universityName: '',
    course: '',
    deadline: '',
    window: '',
    notarisedRequired: false,
    assessmentFee: '',
    interviewRequired: false,
    notes: '',
  })

  const isCompleted = data.status === 'completed'
  const canComplete = applications.length >= 1

  const getDefaultOptions = () => {
    if (finalizedList.length > 0 && !newApp.universityId) {
      const first = finalizedList[0]
      return { universityId: first.id, universityName: first.name, course: first.course || '' }
    }
    return {}
  }

  const handleAddApplication = () => {
    if (!newApp.universityName || !newApp.course) {
      toast({ title: 'University and course required', type: 'error' })
      return
    }
    const app = {
      id: `app-${Date.now()}`,
      ...newApp,
      status: 'Draft',
      createdAt: new Date().toLocaleDateString('en-IN'),
    }
    setApplications(prev => [...prev, app])
    setNewApp({
      universityId: '',
      universityName: '',
      course: '',
      deadline: '',
      window: '',
      notarisedRequired: false,
      assessmentFee: '',
      interviewRequired: false,
      notes: '',
    })
    setShowAddModal(false)
    toast({ title: 'Application added', type: 'success' })
  }

  const handleRemoveApplication = (id) => {
    setApplications(prev => prev.filter(a => a.id !== id))
    toast({ title: 'Application removed', type: 'success' })
  }

  const handleSaveDraft = () => {
    onUpdate?.({ ...data, applications, stageComments: comments })
    toast({ title: 'Draft saved', type: 'success' })
  }

  const handleMarkComplete = () => {
    if (!canComplete) {
      toast({ title: 'Add at least one application before completing', type: 'error' })
      return
    }
    onUpdate?.({ ...data, status: 'completed', completedAt: new Date().toLocaleDateString('en-IN'), applications, stageComments: comments })
    toast({ title: 'University Applications stage complete', type: 'success' })
  }

  const handleNextStep = () => {
    onUpdate?.({ status: 'completed' })
  }

  return (
    <div className="space-y-5 pb-20">
      <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-grey-10">
          <Send className="w-4 h-4 text-grey-40" />
          <h3 className="text-[14px] font-semibold text-grey-95">University Applications</h3>
          <span className="text-[12px] text-grey-40 ml-1">
            Track application windows, deadlines, fees, and requirements.
          </span>
        </div>
        <div className="px-5 py-5">
          <p className="text-[13px] text-grey-60 mb-5">
            {finalizedList.length === 0
              ? 'Complete Universities Finalization first to add applications from the finalized list.'
              : `Add and manage applications (e.g. 15–30 or 30–45 day windows, notarised docs, assessment fees, interviews).`}
          </p>

          <BentoCard title={`Applications (${applications.length})`} icon={Send}>
            {!readOnly && finalizedList.length > 0 && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold bg-blue-90 text-white hover:bg-blue-50 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add application
                </button>
              </div>
            )}
            {applications.length === 0 ? (
              <div className="py-10 text-center">
                <Send className="w-10 h-10 text-grey-20 mx-auto mb-3" />
                <p className="text-[13px] text-grey-40 mb-1">No applications yet</p>
                <p className="text-[11px] text-grey-30">Add applications to track deadlines and requirements</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map(app => (
                  <div
                    key={app.id}
                    className="flex items-start justify-between gap-4 px-4 py-3 rounded-xl border border-grey-20 bg-grey-5 hover:border-grey-30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-grey-95">{app.universityName}</p>
                      <p className="text-[12px] text-grey-50">{app.course}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-grey-40">
                        {app.deadline && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {app.deadline}
                          </span>
                        )}
                        {app.window && <span>{app.window} window</span>}
                        {app.assessmentFee && (
                          <span className="flex items-center gap-1">
                            <IndianRupee className="w-3 h-3" /> {app.assessmentFee}
                          </span>
                        )}
                        {app.notarisedRequired && <span className="bg-amber-light text-amber px-1.5 py-0.5 rounded">Notarised</span>}
                        {app.interviewRequired && <span className="bg-info-light text-info px-1.5 py-0.5 rounded">Interview</span>}
                      </div>
                      {app.notes && <p className="text-[11px] text-grey-40 mt-1">{app.notes}</p>}
                    </div>
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => handleRemoveApplication(app.id)}
                        className="flex-shrink-0 p-1.5 text-grey-40 hover:text-red transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
        stageLabel="University Applications"
        onSaveDraft={handleSaveDraft}
        onMarkComplete={handleMarkComplete}
        onNextStep={handleNextStep}
        isCompleted={isCompleted}
        canComplete={canComplete}
        readOnly={readOnly}
        isLastStep={false}
      />

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add application">
        <div className="space-y-4">
          {finalizedList.length > 0 && (
            <div>
              <label className="text-[12px] text-grey-40 font-medium block mb-1.5">University (from finalized list)</label>
              <select
                value={newApp.universityId}
                onChange={(e) => {
                  const u = finalizedList.find(x => x.id === e.target.value)
                  setNewApp(prev => ({ ...prev, universityId: u?.id || '', universityName: u?.name || '', course: u?.course || '' }))
                }}
                className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 outline-none focus:border-blue-90 bg-white"
              >
                <option value="">Select...</option>
                {finalizedList.map(u => (
                  <option key={u.id} value={u.id}>{u.name} – {u.course}</option>
                ))}
              </select>
            </div>
          )}
          {!finalizedList.length && (
            <>
              <div>
                <label className="text-[12px] text-grey-40 font-medium block mb-1.5">University name *</label>
                <input
                  value={newApp.universityName}
                  onChange={e => setNewApp(prev => ({ ...prev, universityName: e.target.value }))}
                  placeholder="e.g. TUM"
                  className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 outline-none focus:border-blue-90"
                />
              </div>
              <div>
                <label className="text-[12px] text-grey-40 font-medium block mb-1.5">Course *</label>
                <input
                  value={newApp.course}
                  onChange={e => setNewApp(prev => ({ ...prev, course: e.target.value }))}
                  placeholder="e.g. MSc Computer Science"
                  className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 outline-none focus:border-blue-90"
                />
              </div>
            </>
          )}
          <div>
            <label className="text-[12px] text-grey-40 font-medium block mb-1.5">Deadline</label>
            <input
              type="date"
              value={newApp.deadline}
              onChange={e => setNewApp(prev => ({ ...prev, deadline: e.target.value }))}
              className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 outline-none focus:border-blue-90"
            />
          </div>
          <div>
            <label className="text-[12px] text-grey-40 font-medium block mb-1.5">Application window</label>
            <select
              value={newApp.window}
              onChange={e => setNewApp(prev => ({ ...prev, window: e.target.value }))}
              className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 outline-none focus:border-blue-90 bg-white"
            >
              <option value="">Select...</option>
              {WINDOW_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[12px] text-grey-40 font-medium block mb-1.5">Assessment fee (₹)</label>
            <input
              type="text"
              value={newApp.assessmentFee}
              onChange={e => setNewApp(prev => ({ ...prev, assessmentFee: e.target.value }))}
              placeholder="e.g. 75 EUR"
              className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 outline-none focus:border-blue-90"
            />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newApp.notarisedRequired}
                onChange={e => setNewApp(prev => ({ ...prev, notarisedRequired: e.target.checked }))}
                className="rounded border-grey-20"
              />
              <span className="text-[12px] text-grey-60">Notarised documents required</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newApp.interviewRequired}
                onChange={e => setNewApp(prev => ({ ...prev, interviewRequired: e.target.checked }))}
                className="rounded border-grey-20"
              />
              <span className="text-[12px] text-grey-60">Interview required</span>
            </label>
          </div>
          <div>
            <label className="text-[12px] text-grey-40 font-medium block mb-1.5">Notes</label>
            <textarea
              value={newApp.notes}
              onChange={e => setNewApp(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              placeholder="Additional requirements..."
              className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 outline-none focus:border-blue-90 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg text-[13px] font-medium text-grey-60 hover:bg-grey-10">Cancel</button>
            <button
              onClick={handleAddApplication}
              disabled={!newApp.universityName || !newApp.course}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold bg-blue-90 text-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
