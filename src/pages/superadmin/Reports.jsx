import { useState } from 'react'
import { FileSpreadsheet, Download, User } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import { e2eStudents } from '../../data/e2eStudents'
import { exportAllStudentsPnL, exportStudentPnL } from '../../utils/excelExport'

export default function Reports() {
  const [selectedStudentId, setSelectedStudentId] = useState('')

  const handleExportIndividual = () => {
    const student = e2eStudents.find(s => s.id === selectedStudentId)
    if (student) exportStudentPnL(student)
  }

  return (
    <div>
      <PageHeader title="Reports & Downloads" />

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-grey-10">
            <FileSpreadsheet className="w-4 h-4 text-grey-40" />
            <h3 className="text-[14px] font-semibold text-grey-95">All Students P&L</h3>
          </div>
          <div className="px-5 py-6">
            <p className="text-[13px] text-grey-60 mb-4">
              Export a comprehensive Excel report with P&L data for all {e2eStudents.length} E2E students.
            </p>
            <button
              onClick={() => exportAllStudentsPnL(e2eStudents)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-90 text-white text-[13px] font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Download className="w-4 h-4" /> Export All Students P&L
            </button>
          </div>
        </div>

        <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-grey-10">
            <User className="w-4 h-4 text-grey-40" />
            <h3 className="text-[14px] font-semibold text-grey-95">Individual Student P&L</h3>
          </div>
          <div className="px-5 py-6">
            <p className="text-[13px] text-grey-60 mb-4">
              Export a detailed P&L report for a specific student including services, VAS, and payments.
            </p>
            <div className="flex items-center gap-3">
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="flex-1 border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 outline-none focus:border-blue-90 bg-white"
              >
                <option value="">Select a student...</option>
                {e2eStudents.map(s => (
                  <option key={s.id} value={s.id}>{s.studentName} ({s.id})</option>
                ))}
              </select>
              <button
                onClick={handleExportIndividual}
                disabled={!selectedStudentId}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-90 text-white text-[13px] font-semibold rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
