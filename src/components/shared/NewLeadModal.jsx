import { useState, useCallback, useEffect } from 'react'
import { X, ChevronRight, ChevronLeft, Upload, Calendar } from 'lucide-react'
import { useToast } from './Toast'

const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana', 'West Bengal', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Punjab', 'Haryana', 'Kerala', 'Odisha', 'Bihar', 'Madhya Pradesh']
const citiesByState = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
  'Delhi': ['New Delhi', 'Delhi'],
  'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Noida'],
  'Punjab': ['Chandigarh', 'Ludhiana', 'Amritsar'],
  'Haryana': ['Gurgaon', 'Faridabad', 'Panipat'],
  'Kerala': ['Kochi', 'Thiruvananthapuram', 'Kozhikode'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela'],
  'Bihar': ['Patna', 'Gaya', 'Muzaffarpur'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior'],
}

const documentSections = [
  {
    title: 'Personal Documents',
    docs: ['Recent Photo', 'Passport (Front)', 'Passport (Last Page)', 'Signature (on white paper)', 'Birth Certificate'],
  },
  {
    title: 'Application Documents',
    docs: ['Europass CV', 'LOR', 'Letter of Motivation'],
  },
  {
    title: 'Entrance Exam Scores',
    docs: ['JEE Mains Score Card', 'JEE Advanced Score Card'],
  },
  {
    title: 'Academic Documents',
    docs: ['10th Mark Sheet', '12th Mark Sheet', '1st Semester Mark Sheet', '2nd Semester Mark Sheet', 'Graduation Certificate'],
  },
  {
    title: 'German Education Specific',
    docs: ['APS Certificate', 'TestAS Certificate'],
  },
  {
    title: 'Language Documents',
    docs: ['IELTS Certificate', 'MOI Certificate', 'German Certificate'],
  },
]

export default function NewLeadModal({ isOpen, onClose, onSubmit }) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('fill') // 'fill' or 'documents'
  const [form, setForm] = useState({
    // Basic Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    currentState: '',
    currentCity: '',
    source: 'Online',
    date: new Date().toISOString().split('T')[0],
    // Academic Information
    courseType: '',
    specialisation: '',
    gradingSystem: 'CGPA',
    cgpa: '',
    cgpaScale: '10',
    anyBacklogs: '',
    preferredCourseType: '',
    preferredCourse: '',
    // Language & Test Scores
    eltStatus: 'Not Given',
    eltScore: '',
    eltDate: '',
    germanLanguageLevel: '',
    apsStatus: '',
    // Additional Information
    preferredIntakeSeason: '',
    intakeYear: new Date().getFullYear().toString(),
    remarks: '',
  })
  const [documents, setDocuments] = useState({})

  const handleChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleDocumentUpload = useCallback((docName, file) => {
    if (file && file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'File size should not be larger than 5 MB', type: 'error' })
      return
    }
    setDocuments(prev => ({ ...prev, [docName]: file || null }))
  }, [toast])

  const handleSave = useCallback(() => {
    const payload = { ...form, documents }
    onSubmit?.(payload)
    toast({ title: 'Draft saved', description: 'Lead information saved as draft', type: 'success' })
  }, [form, documents, onSubmit, toast])

  const formatDateDDMMYY = useCallback((dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yy = String(d.getFullYear()).slice(-2)
    return `${dd}/${mm}/${yy}`
  }, [])

  const handleSubmit = useCallback(() => {
    // Basic validation
    const required = ['firstName', 'lastName', 'email', 'phone', 'source', 'date', 'courseType', 'cgpa', 'cgpaScale', 'anyBacklogs', 'preferredCourse', 'germanLanguageLevel', 'apsStatus', 'preferredIntakeSeason', 'intakeYear']
    const missing = required.filter(field => !form[field])
    if (missing.length > 0) {
      toast({ title: 'Missing fields', description: `Please fill all required fields: ${missing.join(', ')}`, type: 'warning' })
      return
    }
    
    // Format data to match lead model structure
    const studentName = `${form.firstName} ${form.lastName}`.trim()
    const yearOfIntake = `${form.preferredIntakeSeason} ${form.intakeYear}`
    const backlog = form.anyBacklogs !== 'No'
    const backlogCount = backlog ? parseInt(form.anyBacklogs.match(/\d+/)?.[0] || '0') : 0
    const aps = form.apsStatus === 'Yes'
    
    const payload = {
      // Map to existing lead structure
      studentName,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      dateOfBirth: form.dateOfBirth,
      gender: form.gender,
      city: form.currentCity,
      state: form.currentState,
      source: form.source,
      date: formatDateDDMMYY(form.date),
      courseType: form.courseType,
      specialisation: form.specialisation,
      preferredCourse: form.preferredCourse,
      preferredCourseType: form.preferredCourseType,
      cgpa: parseFloat(form.cgpa) || 0,
      cgpaOutOf: parseFloat(form.cgpaScale) || 10,
      backlog,
      backlogCount,
      germanProficiency: form.germanLanguageLevel,
      eltScore: form.eltStatus === 'Given' ? form.eltScore : null,
      eltDate: form.eltDate || null,
      eltStatus: form.eltStatus,
      aps,
      apsStatus: form.apsStatus,
      yearOfIntake,
      preferredIntakeSeason: form.preferredIntakeSeason,
      intakeYear: form.intakeYear,
      remarks: form.remarks,
      documents,
      // Defaults for new lead
      salesStatus: 'Draft',
      serviceStatus: 'Draft',
      salesPOC: '',
      servicePOC: null,
      assignedToSales: '',
      assignedToService: null,
    }
    
    onSubmit?.(payload)
    toast({ title: 'Lead created', description: 'New lead has been created successfully', type: 'success' })
    onClose()
  }, [form, documents, onSubmit, onClose, toast, formatDateDDMMYY])

  useEffect(() => {
    if (!isOpen) {
      setActiveTab('fill')
      setForm({
        firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', gender: '',
        currentState: '', currentCity: '', source: 'Online', date: new Date().toISOString().split('T')[0],
        courseType: '', specialisation: '', gradingSystem: 'CGPA', cgpa: '', cgpaScale: '10', anyBacklogs: '',
        preferredCourseType: '', preferredCourse: '', eltStatus: 'Not Given', eltScore: '', eltDate: '', germanLanguageLevel: '', apsStatus: '',
        preferredIntakeSeason: '', intakeYear: new Date().getFullYear().toString(), remarks: '',
      })
      setDocuments({})
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const availableCities = form.currentState ? (citiesByState[form.currentState] || []) : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-grey-20 flex-shrink-0">
          <h3 className="text-[16px] font-semibold text-grey-95">Create New Lead</h3>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-grey-10 transition-colors">
            <X className="w-4 h-4 text-grey-40" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0 border-b border-grey-20 px-6 flex-shrink-0">
          <button
            onClick={() => setActiveTab('fill')}
            className={`px-4 py-3 text-[13px] font-medium border-b-2 transition-colors ${
              activeTab === 'fill' ? 'text-blue-90 border-blue-90' : 'text-grey-40 border-transparent hover:text-grey-70'
            }`}
          >
            Fill information
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-3 text-[13px] font-medium border-b-2 transition-colors ${
              activeTab === 'documents' ? 'text-blue-90 border-blue-90' : 'text-grey-40 border-transparent hover:text-grey-70'
            }`}
          >
            Upload Documents
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === 'fill' ? (
            <FillInformationTab form={form} onChange={handleChange} availableCities={availableCities} />
          ) : (
            <UploadDocumentsTab documents={documents} onUpload={handleDocumentUpload} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-grey-20 flex-shrink-0">
          {activeTab === 'documents' ? (
            <button
              onClick={() => setActiveTab('fill')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium text-grey-60 hover:bg-grey-10 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-lg text-[13px] font-semibold text-grey-70 border border-grey-20 hover:bg-grey-10 transition-colors"
            >
              Save
            </button>
            {activeTab === 'fill' ? (
              <button
                onClick={() => setActiveTab('documents')}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-[13px] font-semibold bg-blue-90 text-white hover:bg-blue-50 transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
                Documents
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-[13px] font-semibold bg-blue-90 text-white hover:bg-blue-50 transition-colors"
              >
                Submit
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, placeholder, type = 'text', options, value, onChange, disabled = false, required = false, className = '' }) {
  const fieldId = `field-${label.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <div className={className}>
      <label htmlFor={fieldId} className="text-[11px] font-medium text-grey-40 block mb-1.5">
        {label} {required && <span className="text-red">*</span>}
      </label>
      {options ? (
        <div className="relative">
          <select
            id={fieldId}
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            className="w-full appearance-none border border-grey-20 rounded-lg px-3 py-2.5 pr-9 text-[13px] text-grey-70 outline-none focus:border-blue-90 focus:ring-2 focus:ring-blue-20 bg-white disabled:bg-grey-10 disabled:text-grey-40 cursor-pointer"
          >
            <option value="">{placeholder || 'Select...'}</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-grey-40 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      ) : type === 'textarea' ? (
        <textarea
          id={fieldId}
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 placeholder:text-grey-40 outline-none focus:border-blue-90 focus:ring-2 focus:ring-blue-20 resize-none"
        />
      ) : type === 'date' ? (
        <div className="relative">
          <input
            id={fieldId}
            type="date"
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            className="w-full border border-grey-20 rounded-lg px-3 py-2.5 pr-10 text-[13px] text-grey-70 placeholder:text-grey-40 outline-none focus:border-blue-90 focus:ring-2 focus:ring-blue-20"
          />
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-40 pointer-events-none" />
        </div>
      ) : (
        <input
          id={fieldId}
          type={type}
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 placeholder:text-grey-40 outline-none focus:border-blue-90 focus:ring-2 focus:ring-blue-20"
        />
      )}
    </div>
  )
}

function FillInformationTab({ form, onChange, availableCities }) {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h4 className="text-[12px] font-semibold text-grey-40 uppercase tracking-wider mb-4">Basic Information</h4>
        <div className="grid grid-cols-2 gap-x-5 gap-y-4">
          <Field label="First Name" value={form.firstName} onChange={(v) => onChange('firstName', v)} placeholder="First name" required />
          <Field label="Last Name" value={form.lastName} onChange={(v) => onChange('lastName', v)} placeholder="Last name" required />
          <Field label="Email" type="email" value={form.email} onChange={(v) => onChange('email', v)} placeholder="Email address" required />
          <Field label="Phone" type="tel" value={form.phone} onChange={(v) => onChange('phone', v)} placeholder="Phone number" required />
          <Field label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(v) => onChange('dateOfBirth', v)} placeholder="dd/mm/yyyy" />
          <Field label="Gender" options={['Male', 'Female', 'Other', 'Prefer not to say']} value={form.gender} onChange={(v) => onChange('gender', v)} placeholder="Select Gender" />
          <Field label="Current State" options={states} value={form.currentState} onChange={(v) => { onChange('currentState', v); onChange('currentCity', '') }} placeholder="Select State" />
          <Field label="Current City" options={availableCities} value={form.currentCity} onChange={(v) => onChange('currentCity', v)} placeholder={form.currentState ? 'Select City' : 'Select State First'} disabled={!form.currentState} />
          <Field label="Source" options={['Online', 'Offline', 'Referral', 'Social Media', 'Other']} value={form.source} onChange={(v) => onChange('source', v)} placeholder="Select Source" required />
          <Field label="Date" type="date" value={form.date} onChange={(v) => onChange('date', v)} required />
        </div>
      </div>

      {/* Academic Information */}
      <div>
        <h4 className="text-[12px] font-semibold text-grey-40 uppercase tracking-wider mb-4">Academic Information</h4>
        <div className="grid grid-cols-2 gap-x-5 gap-y-4">
          <Field label="Course Type" options={['UG - Studienkolleg', 'UG - Bachelors', 'PG']} value={form.courseType} onChange={(v) => onChange('courseType', v)} placeholder="Select Course Type" required />
          <Field label="Specialisation" value={form.specialisation} onChange={(v) => onChange('specialisation', v)} placeholder="e.g., Computer Science" />
          <div className="col-span-2">
            <label className="text-[11px] font-medium text-grey-40 block mb-1.5">Grading System</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="gradingSystem" value="CGPA" checked={form.gradingSystem === 'CGPA'} onChange={() => onChange('gradingSystem', 'CGPA')} className="accent-blue-90" />
                <span className="text-[13px] text-grey-70">CGPA</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="gradingSystem" value="Percentage" checked={form.gradingSystem === 'Percentage'} onChange={() => onChange('gradingSystem', 'Percentage')} className="accent-blue-90" />
                <span className="text-[13px] text-grey-70">Percentage</span>
              </label>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-medium text-grey-40 block mb-1.5">CGPA <span className="text-red">*</span></label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="0.01"
                value={form.cgpa || ''}
                onChange={(e) => onChange('cgpa', e.target.value)}
                placeholder="e.g., 8.5"
                className="flex-1 border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 outline-none focus:border-blue-90 focus:ring-2 focus:ring-blue-20"
              />
              <span className="text-grey-40">/</span>
              <select
                value={form.cgpaScale || '10'}
                onChange={(e) => onChange('cgpaScale', e.target.value)}
                className="w-20 appearance-none border border-grey-20 rounded-lg px-2 py-2.5 text-[13px] text-grey-70 outline-none focus:border-blue-90 focus:ring-2 focus:ring-blue-20 bg-white cursor-pointer"
              >
                {['10', '9.5', '9', '8', '7', '5', '4.2', '4'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <Field label="Any Backlogs?" options={['No', 'Yes - 1', 'Yes - 2', 'Yes - 3+']} value={form.anyBacklogs} onChange={(v) => onChange('anyBacklogs', v)} placeholder="Select" required />
          <Field label="Preferred Course Type" options={['UG - Studienkolleg', 'UG - Bachelors', 'PG', 'Masters', 'PhD']} value={form.preferredCourseType} onChange={(v) => onChange('preferredCourseType', v)} placeholder="Select Preferred Course Type" />
          <Field label="Preferred Course" value={form.preferredCourse} onChange={(v) => onChange('preferredCourse', v)} placeholder="e.g., MS in Computer Science" required />
        </div>
      </div>

      {/* Language & Test Scores */}
      <div>
        <h4 className="text-[12px] font-semibold text-grey-40 uppercase tracking-wider mb-4">Language & Test Scores</h4>
        <div className="grid grid-cols-2 gap-x-5 gap-y-4">
          <Field label="ELT Status" options={['Not Given', 'Given', 'Pending']} value={form.eltStatus} onChange={(v) => onChange('eltStatus', v)} placeholder="Select Status" />
          <Field label="ELT Score" type="number" step="0.5" value={form.eltScore} onChange={(v) => onChange('eltScore', v)} placeholder="Score" disabled={form.eltStatus === 'Not Given'} />
          <Field label="ELT Date" type="date" value={form.eltDate} onChange={(v) => onChange('eltDate', v)} placeholder="Date" disabled={form.eltStatus === 'Not Given'} />
          <div />
          <Field label="German Language Level" options={['A1', 'A2', 'B1', 'B2', 'C1', 'C2']} value={form.germanLanguageLevel} onChange={(v) => onChange('germanLanguageLevel', v)} placeholder="Select Level" required />
          <Field label="APS Status" options={['Yes', 'No', 'Pending']} value={form.apsStatus} onChange={(v) => onChange('apsStatus', v)} placeholder="Select Status" required />
        </div>
      </div>

      {/* Additional Information */}
      <div>
        <h4 className="text-[12px] font-semibold text-grey-40 uppercase tracking-wider mb-4">Additional Information</h4>
        <div className="grid grid-cols-2 gap-x-5 gap-y-4">
          <Field label="Preferred Intake Season" options={['Summer', 'Winter']} value={form.preferredIntakeSeason} onChange={(v) => onChange('preferredIntakeSeason', v)} placeholder="Select Season" required />
          <Field label="Intake Year" type="number" value={form.intakeYear} onChange={(v) => onChange('intakeYear', v)} placeholder="e.g., 2026" required />
          <div className="col-span-2">
            <Field label="Remarks" type="textarea" value={form.remarks} onChange={(v) => onChange('remarks', v)} placeholder="Additional notes or comments..." />
          </div>
        </div>
      </div>
    </div>
  )
}

function UploadDocumentsTab({ documents, onUpload }) {
  const handleFileSelect = useCallback((docName, e) => {
    const file = e.target.files?.[0]
    if (file) onUpload(docName, file)
  }, [onUpload])

  const handleDrop = useCallback((docName, e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) onUpload(docName, file)
  }, [onUpload])

  return (
    <div className="space-y-6">
      <p className="text-[12px] text-grey-40">* File size should not be larger than 5 MB</p>
      {documentSections.map((section) => (
        <div key={section.title}>
          <h4 className="text-[12px] font-semibold text-grey-40 uppercase tracking-wider mb-4">{section.title}</h4>
          <div className={`grid ${section.docs.length === 1 ? 'grid-cols-1' : section.docs.length === 2 ? 'grid-cols-2' : 'grid-cols-2'} gap-4`}>
            {section.docs.map((docName) => (
              <DocumentUploadBox
                key={docName}
                docName={docName}
                file={documents[docName]}
                onFileSelect={(e) => handleFileSelect(docName, e)}
                onDrop={(e) => handleDrop(docName, e)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function DocumentUploadBox({ docName, file, onFileSelect, onDrop }) {
  const [isDragging, setIsDragging] = useState(false)

  return (
    <div
      className={`border border-dashed rounded-xl p-6 flex flex-col items-center justify-center hover:bg-grey-10/50 transition-colors cursor-pointer group relative ${
        isDragging ? 'border-blue-90 bg-blue-10/20' : 'border-grey-20'
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
    >
      <input
        type="file"
        id={`upload-${docName}`}
        className="hidden"
        onChange={onFileSelect}
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
      />
      <label htmlFor={`upload-${docName}`} className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
        {file ? (
          <>
            <div className="w-8 h-8 rounded-full bg-green-light flex items-center justify-center mb-2">
              <svg className="w-4 h-4 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-[13px] font-medium text-grey-70 text-center">{docName}</p>
            <p className="text-[11px] text-grey-40 mt-0.5">{file.name}</p>
          </>
        ) : (
          <>
            <Upload className="w-6 h-6 text-grey-40 group-hover:text-blue-90 mb-2 transition-colors" />
            <p className="text-[13px] font-medium text-grey-70 text-center">{docName}</p>
            <p className="text-[11px] text-grey-40 mt-0.5">Drag or upload</p>
          </>
        )}
      </label>
    </div>
  )
}
