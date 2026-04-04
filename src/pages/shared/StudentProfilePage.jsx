import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { leads } from '../../data/leads'
import BentoCard, { Field } from '../../components/shared/BentoCard'
import {
  User, GraduationCap, BookOpen, Languages, MessageSquare, Paperclip, Eye
} from 'lucide-react'

const documentSections = [
  { title: 'Personal Documents', docs: ['Recent Photo', 'Passport (Front)', 'Passport (Last Page)', 'Signature', 'Birth Certificate'] },
  { title: 'Academic Documents', docs: ['10th Mark Sheet', '12th Mark Sheet', '1st Semester Marksheet', '2nd Semester Marksheet', 'Graduation Certificate'] },
  { title: 'German Education Specific', docs: ['APS Certificate', 'TestAS Certificate'] },
  { title: 'Language Documents', docs: ['IELTS Certificate', 'Medium of Instruction (MOI) Certificate', 'German Language Certificate'] },
  { title: 'Application Documents', docs: ['Europass CV', 'Letters of Recommendation', 'Letter of Motivation'] },
  { title: 'Entrance Exam Scores', docs: ['JEE Mains Score Card', 'JEE Advanced Score Card'] },
]

const formatINR = (v) => v != null ? `₹${Number(v).toLocaleString('en-IN')}` : '—'
const formatDate = (d) => {
  if (!d) return 'N/A'
  const dt = new Date(d)
  if (isNaN(dt)) return d
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/**
 * Standalone student profile page — no sidebar, no app nav.
 * Opened in a new tab via "View full profile" from lead detail.
 */
export default function StudentProfilePage() {
  const { id } = useParams()
  const lead = leads.find(l => l.id === id) || leads[0]

  useEffect(() => {
    document.title = `${lead.studentName} – Profile`
    return () => { document.title = 'Leverage Edu' }
  }, [lead.studentName])

  return (
    <div className="min-h-screen bg-grey-5">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-[22px] font-bold text-grey-95">{lead.studentName}</h1>
          <p className="text-[13px] text-grey-50 mt-0.5">{lead.id} · {lead.email}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <BentoCard title="Personal Information" icon={User}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Field label="Full Name" value={lead.studentName} />
              <Field label="Email" value={lead.email} />
              <Field label="Phone" value={lead.phone} />
              <Field label="Date of Birth" value={formatDate(lead.dateOfBirth)} />
              <Field label="Gender" value={lead.gender} />
              <Field label="Source" value={lead.source} />
              <Field label="Location" value={[lead.city, lead.state].filter(Boolean).join(', ') || 'N/A'} />
              <Field label="Date Added" value={lead.date} />
            </div>
          </BentoCard>

          <BentoCard title="Study Preferences" icon={BookOpen}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Field label="Preferred Course Type" value={lead.preferredCourseType} />
              <Field label="Preferred Course" value={lead.preferredCourse} />
              <Field label="Intake Season" value={lead.preferredIntakeSeason} />
              <Field label="Intake Year" value={lead.intakeYear} />
            </div>
          </BentoCard>

          <BentoCard title="Education Information" icon={GraduationCap}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Field label="Course Type" value={lead.courseType} />
              <Field label="Specialisation" value={lead.specialisation} />
              <Field label="CGPA" value={lead.cgpa != null ? `${lead.cgpa} / ${lead.cgpaOutOf}` : null} />
              <Field label="Percentage" value={lead.percentage != null ? `${lead.percentage}%` : 'N/A'} />
              <Field label="Backlogs" value={lead.backlog ? `Yes (${lead.backlogCount})` : 'No'} />
            </div>
          </BentoCard>

          <BentoCard title="Language & Test Scores" icon={Languages}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Field label="ELT Status" value={lead.eltStatus} />
              <Field label="ELT Type" value={lead.eltType || 'N/A'} />
              <Field label="ELT Score" value={lead.eltStatus !== 'Not Given' ? lead.eltScore : 'N/A'} />
              <Field label="ELT Date" value={lead.eltStatus !== 'Not Given' ? formatDate(lead.eltDate) : 'N/A'} />
              <Field label="German Level" value={lead.germanProficiency} />
            </div>
          </BentoCard>

          <BentoCard title="Additional Information" icon={MessageSquare}>
            <div className="space-y-4">
              <div>
                <p className="text-[11px] text-grey-40 uppercase tracking-wider mb-1">Remarks from Sales</p>
                <p className="text-[13px] text-grey-70 leading-relaxed">{lead.remarks || 'No remarks added'}</p>
              </div>
              {lead.salesNotes && (
                <div>
                  <p className="text-[11px] text-grey-40 uppercase tracking-wider mb-1">Sales Notes</p>
                  <p className="text-[13px] text-grey-70 leading-relaxed">{lead.salesNotes}</p>
                </div>
              )}
              <div>
                <p className="text-[11px] text-grey-40 uppercase tracking-wider mb-1">Package Value</p>
                <p className="text-[16px] font-bold text-grey-95">{formatINR(lead.totalSaleValue)}</p>
              </div>
            </div>
          </BentoCard>

          <BentoCard title="Uploaded Documents" icon={Paperclip} className="col-span-2">
            {(() => {
              const allDocs = documentSections.flatMap(s => s.docs)
              const uploadedCount = allDocs.filter(doc => lead.documents?.[doc]).length
              return (
                <div className="mb-4 pb-3 border-b border-grey-10">
                  <p className="text-[12px] text-grey-60">
                    <span className="font-semibold text-grey-95">{uploadedCount}</span> of <span className="font-semibold text-grey-95">{allDocs.length}</span> documents uploaded
                  </p>
                </div>
              )
            })()}
            <div className="grid grid-cols-2 gap-6">
              {documentSections.map(section => (
                <div key={section.title}>
                  <p className="text-[11px] font-semibold text-grey-60 uppercase tracking-wider mb-2">{section.title}</p>
                  <div className="space-y-1.5">
                    {section.docs.map(doc => {
                      const uploaded = lead.documents?.[doc]
                      return (
                        <div
                          key={doc}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                        >
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${uploaded ? 'bg-green' : 'bg-grey-20'}`} />
                          <span className={`text-[12px] ${uploaded ? 'text-grey-70 font-medium' : 'text-grey-30'}`}>{doc}</span>
                          {uploaded && (
                            <span className="ml-auto flex items-center gap-1 text-[11px] text-grey-40">
                              <Eye className="w-3 h-3" /> Uploaded
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </BentoCard>
        </div>
      </div>
    </div>
  )
}
