import { useState, useRef, useEffect } from 'react'
import { Calendar, X } from 'lucide-react'

export default function DateRangePicker({ value, onChange, onClose }) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose?.()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleApply = () => {
    if (startDate && endDate) {
      onChange?.({ start: startDate, end: endDate })
      onClose?.()
    }
  }

  const handleClear = () => {
    setStartDate('')
    setEndDate('')
    onChange?.(null)
  }

  // Format date from YYYY-MM-DD to DD/MM/YY
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year.slice(-2)}`
  }

  return (
    <div ref={ref} className="absolute z-50 mt-1 bg-white border border-grey-20 rounded-lg shadow-lg p-4 w-[320px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-grey-60" />
          <span className="text-[13px] font-semibold text-grey-95">Custom Date Range</span>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-grey-10 transition-colors">
          <X className="w-4 h-4 text-grey-40" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-[11px] font-medium text-grey-60 mb-1.5 block">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="dd/mm/yyyy"
            className="w-full border border-grey-20 rounded-lg px-3 py-2 text-[13px] text-grey-70 focus:border-blue-90 focus:ring-2 focus:ring-blue-20 outline-none [&::-webkit-datetime-edit-fields-wrapper]:text-grey-40"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-grey-60 mb-1.5 block">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            placeholder="dd/mm/yyyy"
            className="w-full border border-grey-20 rounded-lg px-3 py-2 text-[13px] text-grey-70 focus:border-blue-90 focus:ring-2 focus:ring-blue-20 outline-none [&::-webkit-datetime-edit-fields-wrapper]:text-grey-40"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-grey-20">
        <button
          onClick={handleClear}
          className="flex-1 px-3 py-2 rounded-lg text-[12px] font-medium text-grey-60 hover:bg-grey-10 transition-colors"
        >
          Clear
        </button>
        <button
          onClick={handleApply}
          disabled={!startDate || !endDate}
          className="flex-1 px-3 py-2 rounded-lg text-[12px] font-semibold bg-blue-90 text-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  )
}
