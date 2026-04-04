import { useState, useMemo } from 'react'
import { Search, FileDown, Plus, Trash2, Edit3, X } from 'lucide-react'
import { germanUniversities } from '../../data/universities'
import BentoCard from '../shared/BentoCard'
import PocComments from './PocComments'
import StageBottomBar from './StageBottomBar'
import Modal from '../shared/Modal'
import { useToast } from '../shared/Toast'

export default function UniversityShortlistingStage({ stageData, lead, onUpdate, readOnly = false }) {
  const { toast } = useToast()
  const data = stageData || {}
  const [universities, setUniversities] = useState(data.universities || [])
  const [comments, setComments] = useState(data.comments || [])
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedUni, setSelectedUni] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState('')
  const [editingComment, setEditingComment] = useState({})

  const isCompleted = data.status === 'completed'

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return germanUniversities
      .filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.courses.some(c => c.toLowerCase().includes(q)) ||
        u.city.toLowerCase().includes(q)
      )
      .filter(u => !universities.some(su => su.id === u.id))
      .slice(0, 8)
  }, [searchQuery, universities])

  const handleAddUniversity = () => {
    if (!selectedUni || !selectedCourse) {
      toast({ title: 'Select a university and course', type: 'error' })
      return
    }
    const newUni = {
      id: selectedUni.id,
      name: selectedUni.name,
      course: selectedCourse,
      appStartDate: '',
      appEndDate: '',
      comment: '',
    }
    setUniversities(prev => [...prev, newUni])
    setShowAddModal(false)
    setSelectedUni(null)
    setSelectedCourse('')
    setSearchQuery('')
    toast({ title: `${selectedUni.name} added`, type: 'success' })
  }

  const handleRemoveUniversity = (id) => {
    setUniversities(prev => prev.filter(u => u.id !== id))
    toast({ title: 'University removed', type: 'success' })
  }

  const handleUpdateComment = (id, comment) => {
    setUniversities(prev => prev.map(u => u.id === id ? { ...u, comment } : u))
    setEditingComment({})
  }

  const handleExportPdf = () => {
    toast({ title: 'Exporting PDF...', description: `Shortlist of ${universities.length} universities`, type: 'success' })
  }

  const handleSaveDraft = () => {
    toast({ title: 'Draft saved', type: 'success' })
  }

  const handleMarkComplete = () => {
    if (universities.length < 3) {
      toast({ title: 'Shortlist at least 3 universities', type: 'error' })
      return
    }
    onUpdate?.({ ...data, status: 'completed', completedAt: new Date().toLocaleDateString('en-IN'), universities, comments })
    toast({ title: 'University shortlisting complete', type: 'success' })
  }

  const handleNextStep = () => {
    onUpdate?.({ status: 'completed' })
  }

  return (
    <div className="space-y-5 pb-20">
      {/* Header with search */}
      <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-grey-10">
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-grey-40" />
            <h3 className="text-[14px] font-semibold text-grey-95">University Shortlisting</h3>
            <span className="text-[12px] text-grey-40">Shortlisting top German universities for your {lead?.preferredCourseType || 'Master\'s'} program.</span>
          </div>
          <button onClick={handleExportPdf} className="flex items-center gap-1.5 text-[12px] font-semibold text-blue-90 hover:underline">
            <FileDown className="w-4 h-4" /> Export PDF
          </button>
        </div>

        {/* Search & Add */}
        {!readOnly && (
          <div className="px-5 py-4">
            <div className="bg-grey-5 rounded-xl px-4 py-4 border border-grey-10">
              <p className="text-[11px] font-semibold text-grey-60 uppercase tracking-wider mb-2">Search & Add Universities</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-30" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="e.g. Technical University of Munich (TUM)..."
                    className="w-full pl-9 pr-4 py-2.5 border border-grey-20 rounded-lg text-[13px] text-grey-70 placeholder:text-grey-30 outline-none focus:border-blue-90"
                  />
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2.5 rounded-lg text-[13px] font-semibold bg-blue-90 text-white hover:bg-blue-50 transition-colors"
                >
                  Search
                </button>
              </div>

              {/* Quick results dropdown */}
              {searchResults.length > 0 && (
                <div className="mt-2 bg-white border border-grey-20 rounded-lg shadow-sm max-h-[200px] overflow-y-auto">
                  {searchResults.map(uni => (
                    <button
                      key={uni.id}
                      onClick={() => { setSelectedUni(uni); setShowAddModal(true) }}
                      className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-grey-5 border-b border-grey-10 last:border-b-0"
                    >
                      <div>
                        <p className="text-[13px] font-medium text-grey-95">{uni.name}</p>
                        <p className="text-[11px] text-grey-40">{uni.city} · {uni.type}</p>
                      </div>
                      <Plus className="w-4 h-4 text-blue-90" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Shortlisted Universities Table */}
      <BentoCard title={`Shortlisted Universities (${universities.length})`} icon={Search}>
        {universities.length === 0 ? (
          <div className="py-10 text-center">
            <Search className="w-8 h-8 text-grey-20 mx-auto mb-3" />
            <p className="text-[13px] text-grey-40 mb-1">No universities shortlisted yet</p>
            <p className="text-[11px] text-grey-30">Search and add universities above to build the shortlist</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-grey-20">
                  <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">University Name</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Course</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Application Start</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Application End</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Comment</th>
                  {!readOnly && <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {universities.map(uni => (
                  <tr key={uni.id} className="border-b border-grey-10 last:border-b-0 hover:bg-grey-5 transition-colors">
                    <td className="px-3 py-3 text-[13px] font-medium text-blue-90">{uni.name}</td>
                    <td className="px-3 py-3 text-[13px] text-grey-60">{uni.course}</td>
                    <td className="px-3 py-3 text-[13px] text-grey-60">{uni.appStartDate || '—'}</td>
                    <td className="px-3 py-3 text-[13px] text-grey-60">{uni.appEndDate || '—'}</td>
                    <td className="px-3 py-3">
                      {editingComment[uni.id] ? (
                        <div className="flex gap-1">
                          <input
                            autoFocus
                            defaultValue={uni.comment}
                            onBlur={e => handleUpdateComment(uni.id, e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleUpdateComment(uni.id, e.target.value) }}
                            className="border border-grey-20 rounded px-2 py-1 text-[12px] text-grey-70 outline-none focus:border-blue-90 w-full"
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => !readOnly && setEditingComment({ [uni.id]: true })}
                          className="text-[12px] text-grey-40 hover:text-grey-70 text-left"
                        >
                          {uni.comment || (readOnly ? '—' : 'Add note...')}
                        </button>
                      )}
                    </td>
                    {!readOnly && (
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditingComment({ [uni.id]: true })} className="text-grey-40 hover:text-blue-90">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleRemoveUniversity(uni.id)} className="text-grey-40 hover:text-red">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[11px] text-grey-30 px-3 pt-3">Last updated: Just now</p>
          </div>
        )}
      </BentoCard>

      {/* POC Comments */}
      <PocComments
        title="Overall POC Comments"
        comments={comments}
        onAddComment={(c) => setComments(prev => [...prev, c])}
        readOnly={readOnly}
      />

      <StageBottomBar
        stageLabel={`University Shortlisting · ${universities.length} shortlisted`}
        onSaveDraft={handleSaveDraft}
        onMarkComplete={handleMarkComplete}
        onNextStep={handleNextStep}
        isCompleted={isCompleted}
        canComplete={universities.length >= 3}
        readOnly={readOnly}
      />

      {/* Add University Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setSelectedUni(null); setSelectedCourse('') }} title="Add University to Shortlist">
        <div className="space-y-4">
          {!selectedUni ? (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-30" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search universities..."
                  autoFocus
                  className="w-full pl-9 pr-4 py-2.5 border border-grey-20 rounded-lg text-[13px] text-grey-70 placeholder:text-grey-30 outline-none focus:border-blue-90"
                />
              </div>
              <div className="max-h-[300px] overflow-y-auto space-y-1">
                {(searchQuery ? searchResults : germanUniversities.filter(u => !universities.some(su => su.id === u.id)).slice(0, 10)).map(uni => (
                  <button
                    key={uni.id}
                    onClick={() => setSelectedUni(uni)}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-left hover:bg-grey-5 transition-colors"
                  >
                    <div>
                      <p className="text-[13px] font-medium text-grey-95">{uni.name}</p>
                      <p className="text-[11px] text-grey-40">{uni.city}, {uni.state} · {uni.type}</p>
                    </div>
                    <Plus className="w-4 h-4 text-blue-90" />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="bg-grey-5 rounded-lg px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-semibold text-grey-95">{selectedUni.name}</p>
                    <p className="text-[12px] text-grey-40">{selectedUni.city}, {selectedUni.state} · {selectedUni.type}</p>
                  </div>
                  <button onClick={() => setSelectedUni(null)} className="text-grey-40 hover:text-grey-60">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[12px] text-grey-40 font-medium block mb-1.5">Select Course *</label>
                <select
                  value={selectedCourse}
                  onChange={e => setSelectedCourse(e.target.value)}
                  className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 outline-none focus:border-blue-90 bg-white"
                >
                  <option value="">Choose a course...</option>
                  {selectedUni.courses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => { setShowAddModal(false); setSelectedUni(null); setSelectedCourse('') }} className="px-4 py-2 rounded-lg text-[13px] font-medium text-grey-60 hover:bg-grey-10">Cancel</button>
                <button onClick={handleAddUniversity} disabled={!selectedCourse} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors ${selectedCourse ? 'bg-blue-90 text-white hover:bg-blue-50' : 'bg-grey-10 text-grey-30 cursor-not-allowed'}`}>
                  <Plus className="w-4 h-4" /> Add to Shortlist
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}
