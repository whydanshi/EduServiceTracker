import { useState, useMemo } from 'react'
import { Award, CheckCircle2, Upload, Plus } from 'lucide-react'
import BentoCard from '../shared/BentoCard'
import PocComments from './PocComments'
import StageBottomBar from './StageBottomBar'
import Modal from '../shared/Modal'
import { useToast } from '../shared/Toast'

export default function OfferLetterStage({ stageData, lead, onUpdate, readOnly = false }) {
  const { toast } = useToast()
  const data = stageData || {}
  const acceptedFromReview = useMemo(
    () => (lead?.journey?.steps?.applicationReview?.reviews || []).filter(r => r.status === 'Accepted'),
    [lead?.journey?.steps?.applicationReview?.reviews]
  )
  const [offers, setOffers] = useState(data.offers?.length ? data.offers : acceptedFromReview.map(r => ({
    applicationId: r.applicationId,
    universityName: r.universityName,
    course: r.course,
    receivedAt: '',
    offerLetterUrl: '',
    confirmed: false,
  })))
  const [selectedOfferId, setSelectedOfferId] = useState(data.selectedOfferId || null)
  const [comments, setComments] = useState(data.stageComments || [])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newOffer, setNewOffer] = useState({ universityName: '', course: '', receivedAt: '', offerLetterUrl: '' })

  const isCompleted = data.status === 'completed'
  const hasSelection = selectedOfferId != null
  const canComplete = offers.length >= 1 && hasSelection

  const updateOffer = (applicationId, field, value) => {
    setOffers(prev => prev.map(o => o.applicationId === applicationId ? { ...o, [field]: value } : o))
  }

  const handleAddOffer = () => {
    if (!newOffer.universityName || !newOffer.course) {
      toast({ title: 'University and course required', type: 'error' })
      return
    }
    const id = `offer-${Date.now()}`
    setOffers(prev => [...prev, {
      applicationId: id,
      universityName: newOffer.universityName,
      course: newOffer.course,
      receivedAt: newOffer.receivedAt,
      offerLetterUrl: newOffer.offerLetterUrl,
      confirmed: false,
    }])
    setNewOffer({ universityName: '', course: '', receivedAt: '', offerLetterUrl: '' })
    setShowAddModal(false)
    toast({ title: 'Offer added', type: 'success' })
  }

  const handleSaveDraft = () => {
    onUpdate?.({ ...data, offers, selectedOfferId, stageComments: comments })
    toast({ title: 'Draft saved', type: 'success' })
  }

  const handleMarkComplete = () => {
    if (!canComplete) {
      toast({ title: 'Confirm at least one offer and select final university', type: 'error' })
      return
    }
    onUpdate?.({
      ...data,
      status: 'completed',
      completedAt: new Date().toLocaleDateString('en-IN'),
      offers,
      selectedOfferId,
      stageComments: comments,
    })
    toast({ title: 'Journey complete – final university selected', type: 'success' })
  }

  const handleNextStep = () => {
    onUpdate?.({ status: 'completed' })
  }

  return (
    <div className="space-y-5 pb-20">
      <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-grey-10">
          <Award className="w-4 h-4 text-grey-40" />
          <h3 className="text-[14px] font-semibold text-grey-95">Offer Letter Received</h3>
          <span className="text-[12px] text-grey-40 ml-1">
            Confirm offers, upload letters, and select the final university to complete the journey.
          </span>
        </div>
        <div className="px-5 py-5">
          <p className="text-[13px] text-grey-60 mb-5">
            {offers.length === 0
              ? 'Accepted applications from Application Review will appear here. Add offer details and select the final choice.'
              : 'Mark received offers and choose the final university for enrollment.'}
          </p>

          <BentoCard title={`Offers (${offers.length})`} icon={Award}>
            {!readOnly && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold bg-blue-90 text-white hover:bg-blue-50 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add offer
                </button>
              </div>
            )}
            {offers.length === 0 ? (
              <div className="py-10 text-center">
                <Award className="w-10 h-10 text-grey-20 mx-auto mb-3" />
                <p className="text-[13px] text-grey-40 mb-1">No offers yet</p>
                <p className="text-[11px] text-grey-30">
                  {acceptedFromReview.length === 0 ? 'Add an offer manually or complete Application Review with accepted applications first.' : 'Accepted applications from the previous step will appear here.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {offers.map(offer => (
                  <div
                    key={offer.applicationId}
                    className={`px-4 py-4 rounded-xl border-2 transition-colors ${
                      selectedOfferId === offer.applicationId
                        ? 'border-green bg-green-light/20'
                        : 'border-grey-20 bg-grey-5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-semibold text-grey-95">{offer.universityName}</p>
                        <p className="text-[12px] text-grey-50">{offer.course}</p>
                      </div>
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => setSelectedOfferId(selectedOfferId === offer.applicationId ? null : offer.applicationId)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                            selectedOfferId === offer.applicationId
                              ? 'bg-green text-white'
                              : 'bg-grey-15 text-grey-60 hover:bg-grey-20'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {selectedOfferId === offer.applicationId ? 'Final choice' : 'Select as final'}
                        </button>
                      )}
                      {readOnly && selectedOfferId === offer.applicationId && (
                        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-green bg-green-light px-3 py-1.5 rounded-lg">
                          <CheckCircle2 className="w-4 h-4" /> Final choice
                        </span>
                      )}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-grey-40 uppercase tracking-wider block mb-1">Received date</label>
                        {readOnly ? (
                          <p className="text-[12px] text-grey-70">{offer.receivedAt || '—'}</p>
                        ) : (
                          <input
                            type="date"
                            value={offer.receivedAt}
                            onChange={e => updateOffer(offer.applicationId, 'receivedAt', e.target.value)}
                            className="w-full border border-grey-20 rounded-lg px-3 py-1.5 text-[12px] text-grey-70 outline-none focus:border-blue-90"
                          />
                        )}
                      </div>
                      <div>
                        <label className="text-[10px] text-grey-40 uppercase tracking-wider block mb-1">Offer letter</label>
                        {readOnly ? (
                          <p className="text-[12px] text-grey-70">{offer.offerLetterUrl ? 'Uploaded' : '—'}</p>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={offer.offerLetterUrl}
                              onChange={e => updateOffer(offer.applicationId, 'offerLetterUrl', e.target.value)}
                              placeholder="URL or filename"
                              className="flex-1 border border-grey-20 rounded-lg px-3 py-1.5 text-[12px] text-grey-70 outline-none focus:border-blue-90"
                            />
                            <span className="text-grey-40" title="Upload"><Upload className="w-4 h-4" /></span>
                          </div>
                        )}
                      </div>
                    </div>
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
        stageLabel="Offer Letter Received"
        onSaveDraft={handleSaveDraft}
        onMarkComplete={handleMarkComplete}
        onNextStep={handleNextStep}
        isCompleted={isCompleted}
        canComplete={canComplete}
        readOnly={readOnly}
        isLastStep={true}
      />

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add offer">
        <div className="space-y-4">
          <div>
            <label className="text-[12px] text-grey-40 font-medium block mb-1.5">University name *</label>
            <input
              value={newOffer.universityName}
              onChange={e => setNewOffer(prev => ({ ...prev, universityName: e.target.value }))}
              placeholder="e.g. TUM"
              className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 outline-none focus:border-blue-90"
            />
          </div>
          <div>
            <label className="text-[12px] text-grey-40 font-medium block mb-1.5">Course *</label>
            <input
              value={newOffer.course}
              onChange={e => setNewOffer(prev => ({ ...prev, course: e.target.value }))}
              placeholder="e.g. MSc Computer Science"
              className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 outline-none focus:border-blue-90"
            />
          </div>
          <div>
            <label className="text-[12px] text-grey-40 font-medium block mb-1.5">Received date</label>
            <input
              type="date"
              value={newOffer.receivedAt}
              onChange={e => setNewOffer(prev => ({ ...prev, receivedAt: e.target.value }))}
              className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 outline-none focus:border-blue-90"
            />
          </div>
          <div>
            <label className="text-[12px] text-grey-40 font-medium block mb-1.5">Offer letter (URL or filename)</label>
            <input
              type="text"
              value={newOffer.offerLetterUrl}
              onChange={e => setNewOffer(prev => ({ ...prev, offerLetterUrl: e.target.value }))}
              placeholder="Optional"
              className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 outline-none focus:border-blue-90"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg text-[13px] font-medium text-grey-60 hover:bg-grey-10">Cancel</button>
            <button
              onClick={handleAddOffer}
              disabled={!newOffer.universityName || !newOffer.course}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold bg-blue-90 text-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" /> Add offer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
