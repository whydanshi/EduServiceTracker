import { useState } from 'react'
import { Shield, CheckCircle2, Clock, AlertTriangle, Eye, Square, CheckSquare, Plus, Upload } from 'lucide-react'
import BentoCard, { Field } from '../shared/BentoCard'
import PocComments from './PocComments'
import StageBottomBar from './StageBottomBar'
import { useToast } from '../shared/Toast'

const APS_PROGRESS_STEPS = [
  { id: 'applied',    label: 'Applied',             desc: 'Application submitted to APS' },
  { id: 'review',     label: 'Under Review',        desc: 'Processing records' },
  { id: 'received',   label: 'APS Received',        desc: 'Certificate issued' },
  { id: 'correction', label: 'Correction Required',  desc: 'Documents need updates' },
]

const apsStatusToStep = {
  'Applied': 0,
  'Under Review': 1,
  'APS Received': 2,
  'Correction Required': 3,
}

const WORKFLOW_ITEMS = [
  { section: 'Online Registration', items: [
    { key: 'applicationInitiated', label: 'Application Initiated' },
    { key: 'accountActivated', label: 'Account Activated' },
  ]},
  { section: 'Submission', items: [
    { key: 'courierDocuments', label: 'Courier Documents' },
    { key: 'mustReachCentre', label: 'Must reach APS Evaluation Centre' },
  ]},
  { section: 'Evaluation', items: [
    { key: 'verificationWindow', label: 'Verification Window (4-6w)' },
    { key: 'interviewRecordsCheck', label: 'Interview / Records Check' },
  ]},
]

export default function ApsStage({ stageData, lead, onUpdate, readOnly = false }) {
  const { toast } = useToast()
  const data = stageData || {}
  const [apsStatus, setApsStatus] = useState(data.apsStatus || 'Applied')
  const [regNum, setRegNum] = useState(data.registrationNumber || '')
  const [subDate, setSubDate] = useState(data.submissionDate || '')
  const [trackingId, setTrackingId] = useState(data.courierTrackingId || '')
  const [documents, setDocuments] = useState(data.documents || [])
  const [checklist, setChecklist] = useState(data.workflowChecklist || {})
  const [comments, setComments] = useState(data.notes || [])

  const activeStep = apsStatusToStep[apsStatus] ?? 0
  const allChecked = WORKFLOW_ITEMS.every(s => s.items.every(i => checklist[i.key]))
  const isCompleted = data.status === 'completed'

  const toggleCheck = (key) => {
    if (readOnly) return
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSaveDraft = () => {
    toast({ title: 'Draft saved', type: 'success' })
  }

  const handleMarkComplete = () => {
    if (!allChecked) {
      toast({ title: 'Complete all checklist items first', type: 'error' })
      return
    }
    onUpdate?.({ ...data, status: 'completed', completedAt: new Date().toLocaleDateString('en-IN'), workflowChecklist: checklist, notes: comments })
    toast({ title: 'APS stage marked complete', type: 'success' })
  }

  const handleNextStep = () => {
    onUpdate?.({ status: 'completed' })
  }

  const addDocument = () => {
    setDocuments(prev => [...prev, { name: 'New Document', status: 'Pending' }])
  }

  return (
    <div className="space-y-5 pb-20">
      {/* APS Status Tracker */}
      <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-grey-10">
          <Shield className="w-4 h-4 text-grey-40" />
          <h3 className="text-[14px] font-semibold text-grey-95">APS Status Tracking</h3>
        </div>
        <div className="px-5 py-5">
          <div className="grid grid-cols-4 gap-3">
            {APS_PROGRESS_STEPS.map((step, idx) => {
              const isCurrent = idx === activeStep && apsStatus !== 'APS Received'
              const isDone = idx < activeStep || apsStatus === 'APS Received'
              const isCorrection = step.id === 'correction' && apsStatus === 'Correction Required'

              return (
                <button
                  key={step.id}
                  onClick={() => { if (!readOnly) setApsStatus(step.label === 'Applied' ? 'Applied' : step.label) }}
                  disabled={readOnly}
                  className={`relative rounded-xl px-4 py-4 text-left border-2 transition-all ${
                    isCorrection
                      ? 'border-red bg-red-light'
                      : isDone
                        ? 'border-green bg-green-light'
                        : isCurrent
                          ? 'border-blue-90 bg-blue-10'
                          : 'border-grey-20 bg-grey-5'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {isDone && !isCorrection ? (
                      <CheckCircle2 className="w-5 h-5 text-green" />
                    ) : isCorrection ? (
                      <AlertTriangle className="w-5 h-5 text-red" />
                    ) : isCurrent ? (
                      <Clock className="w-5 h-5 text-blue-90" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-grey-20" />
                    )}
                  </div>
                  <p className={`text-[13px] font-semibold ${
                    isDone ? 'text-green' : isCorrection ? 'text-red' : isCurrent ? 'text-blue-90' : 'text-grey-40'
                  }`}>{step.label}</p>
                  <p className={`text-[11px] mt-0.5 ${
                    isDone || isCurrent || isCorrection ? 'text-grey-60' : 'text-grey-30'
                  }`}>{step.desc}</p>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Submission Details */}
        <BentoCard title="APS Submission Details" icon={Shield}>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] text-grey-40 uppercase tracking-wider block mb-1.5">Registration Number</label>
              <input
                value={regNum} onChange={e => setRegNum(e.target.value)} disabled={readOnly}
                placeholder="e.g. APS-IND-2024-88901"
                className="w-full border border-grey-20 rounded-lg px-3 py-2 text-[13px] text-grey-70 outline-none focus:border-blue-90 disabled:bg-grey-5 disabled:text-grey-40"
              />
            </div>
            <div>
              <label className="text-[11px] text-grey-40 uppercase tracking-wider block mb-1.5">Submission Date</label>
              <input
                type="date" value={subDate} onChange={e => setSubDate(e.target.value)} disabled={readOnly}
                className="w-full border border-grey-20 rounded-lg px-3 py-2 text-[13px] text-grey-70 outline-none focus:border-blue-90 disabled:bg-grey-5 disabled:text-grey-40"
              />
            </div>
            <div>
              <label className="text-[11px] text-grey-40 uppercase tracking-wider block mb-1.5">Courier Tracking ID</label>
              <input
                value={trackingId} onChange={e => setTrackingId(e.target.value)} disabled={readOnly}
                placeholder="e.g. DHL-123456789"
                className="w-full border border-grey-20 rounded-lg px-3 py-2 text-[13px] text-grey-70 outline-none focus:border-blue-90 disabled:bg-grey-5 disabled:text-grey-40"
              />
            </div>
          </div>
        </BentoCard>

        {/* Workflow Checklist */}
        <BentoCard title="Workflow Checklist" icon={CheckCircle2}>
          <div className="space-y-4">
            {WORKFLOW_ITEMS.map(section => (
              <div key={section.section}>
                <p className="text-[11px] font-semibold text-grey-60 uppercase tracking-wider mb-2">{section.section}</p>
                <div className="space-y-1.5">
                  {section.items.map(item => (
                    <button
                      key={item.key}
                      onClick={() => toggleCheck(item.key)}
                      disabled={readOnly}
                      className="flex items-center gap-2.5 w-full text-left group"
                    >
                      {checklist[item.key]
                        ? <CheckSquare className="w-4 h-4 text-green flex-shrink-0" />
                        : <Square className="w-4 h-4 text-grey-30 flex-shrink-0 group-hover:text-grey-60 transition-colors" />
                      }
                      <span className={`text-[13px] ${checklist[item.key] ? 'text-grey-60 line-through' : 'text-grey-70'}`}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-[10px] text-grey-30 italic pt-1">
              POC tip: Remind student to answer calls from unknown numbers for verification
            </p>
          </div>
        </BentoCard>
      </div>

      {/* APS Document Checklist */}
      <BentoCard title="APS Document Checklist" icon={Eye}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[12px] text-grey-40">{documents.filter(d => d.status === 'Verified').length} of {documents.length} verified</p>
          {!readOnly && (
            <button onClick={addDocument} className="flex items-center gap-1.5 text-[12px] font-semibold text-blue-90 hover:underline">
              <Plus className="w-3.5 h-3.5" /> Add Document
            </button>
          )}
        </div>
        {documents.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-grey-20">
                <th className="px-3 py-2 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Document Name</th>
                <th className="px-3 py-2 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, i) => (
                <tr key={i} className="border-b border-grey-10 last:border-b-0">
                  <td className="px-3 py-2.5 text-[13px] text-grey-70">{doc.name}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                      doc.status === 'Verified' ? 'bg-green-light text-green'
                      : doc.status === 'Under Review' ? 'bg-amber-light text-amber'
                      : 'bg-grey-10 text-grey-60'
                    }`}>{doc.status}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    {!readOnly && doc.status !== 'Verified' && (
                      <button
                        onClick={() => setDocuments(prev => prev.map((d, idx) => idx === i ? { ...d, status: 'Verified' } : d))}
                        className="flex items-center gap-1 text-[12px] font-medium text-blue-90 hover:underline"
                      >
                        <Upload className="w-3 h-3" /> Mark Verified
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-[12px] text-grey-30 text-center py-6">No APS documents added yet</p>
        )}
      </BentoCard>

      {/* POC Comments */}
      <PocComments
        comments={comments}
        onAddComment={(c) => setComments(prev => [...prev, c])}
        readOnly={readOnly}
      />

      <StageBottomBar
        stageLabel="APS Stage"
        onSaveDraft={handleSaveDraft}
        onMarkComplete={handleMarkComplete}
        onNextStep={handleNextStep}
        isCompleted={isCompleted}
        canComplete={allChecked}
        readOnly={readOnly}
      />
    </div>
  )
}
