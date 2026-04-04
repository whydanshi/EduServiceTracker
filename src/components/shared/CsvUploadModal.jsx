import { useMemo, useState } from 'react'
import Modal from './Modal'

function parseCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean)
  if (lines.length === 0) return { headers: [], rows: [] }

  const splitLine = (line) => {
    // minimal CSV parsing: handles quoted fields with commas
    const out = []
    let cur = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
        continue
      }
      if (ch === '"') {
        inQuotes = !inQuotes
        continue
      }
      if (ch === ',' && !inQuotes) {
        out.push(cur.trim())
        cur = ''
        continue
      }
      cur += ch
    }
    out.push(cur.trim())
    return out
  }

  const headers = splitLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim())
  const rows = lines.slice(1).map((line) => {
    const cells = splitLine(line).map(c => c.replace(/^"|"$/g, '').trim())
    const obj = {}
    headers.forEach((h, idx) => {
      obj[h] = cells[idx] ?? ''
    })
    return obj
  })

  return { headers, rows }
}

export default function CsvUploadModal({
  isOpen,
  onClose,
  title = 'Upload CSV',
  subtitle = 'Upload a CSV and preview the data before importing.',
  expectedHeaders = [],
  onImport,
}) {
  const [fileName, setFileName] = useState('')
  const [csvText, setCsvText] = useState('')
  const [error, setError] = useState('')

  const parsed = useMemo(() => (csvText ? parseCsv(csvText) : { headers: [], rows: [] }), [csvText])

  const headerIssues = useMemo(() => {
    if (!expectedHeaders?.length || parsed.headers.length === 0) return []
    const lower = parsed.headers.map(h => h.toLowerCase())
    return expectedHeaders.filter(h => !lower.includes(h.toLowerCase()))
  }, [expectedHeaders, parsed.headers])

  const handleFile = async (file) => {
    setError('')
    if (!file) return
    setFileName(file.name)
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('For this dummy frontend, only .csv uploads are supported.')
      return
    }
    const text = await file.text()
    setCsvText(text)
  }

  const handleImport = () => {
    if (parsed.rows.length === 0) {
      setError('No rows found to import.')
      return
    }
    onImport?.(parsed.rows)
    onClose?.()
    setFileName('')
    setCsvText('')
    setError('')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-3xl">
      <div className="space-y-4">
        <p className="text-[13px] text-grey-60">{subtitle}</p>

        <div className="border border-grey-20 rounded-xl p-4 bg-grey-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[13px] font-medium text-grey-95">Choose a file</p>
              <p className="text-[12px] text-grey-40 mt-0.5">{fileName || 'CSV only'}</p>
            </div>
            <label className="px-3 py-2 rounded-lg bg-blue-90 text-white text-[12px] font-semibold cursor-pointer hover:bg-blue-50 transition-colors">
              Browse
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </label>
          </div>
        </div>

        {error && <div className="text-[12px] text-red">{error}</div>}
        {headerIssues.length > 0 && (
          <div className="text-[12px] text-amber">
            Missing expected columns: <span className="font-medium">{headerIssues.join(', ')}</span>
          </div>
        )}

        {parsed.rows.length > 0 && (
          <div className="border border-grey-20 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-white border-b border-grey-20 flex items-center justify-between">
              <p className="text-[13px] font-semibold text-grey-95">Preview</p>
              <p className="text-[12px] text-grey-40">{parsed.rows.length} rows</p>
            </div>
            <div className="overflow-x-auto bg-white">
              <table className="min-w-[700px] w-full">
                <thead className="bg-grey-5">
                  <tr>
                    {parsed.headers.slice(0, 8).map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsed.rows.slice(0, 5).map((row, idx) => (
                    <tr key={idx} className="border-t border-grey-10">
                      {parsed.headers.slice(0, 8).map(h => (
                        <td key={h} className="px-4 py-2.5 text-[12px] text-grey-70">
                          {row[h] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-3 py-2 rounded-lg text-[13px] font-medium text-grey-60 hover:bg-grey-10 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="px-3 py-2 rounded-lg bg-blue-90 text-white text-[13px] font-semibold hover:bg-blue-50 transition-colors"
          >
            Import
          </button>
        </div>
      </div>
    </Modal>
  )
}

