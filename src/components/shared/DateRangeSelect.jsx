import { useState } from 'react'
import Select from './Select'
import DateRangePicker from './DateRangePicker'
import { Calendar } from 'lucide-react'

export default function DateRangeSelect({ value, onChange, className = '' }) {
  const [showPicker, setShowPicker] = useState(false)
  const [selectedRange, setSelectedRange] = useState(null)

  const options = ['All Dates', 'Today', 'Last 7 Days', 'Last 30 Days', 'Custom Date Range']

  const formatRange = (range) => {
    if (!range) return ''
    const formatDate = (dateStr) => {
      const [year, month, day] = dateStr.split('-')
      return `${day}/${month}/${year.slice(-2)}`
    }
    return `${formatDate(range.start)} - ${formatDate(range.end)}`
  }

  const displayValue = selectedRange ? formatRange(selectedRange) : (value || 'All Dates')

  const handleSelect = (opt) => {
    if (opt === 'Custom Date Range') {
      setShowPicker(true)
    } else {
      setSelectedRange(null)
      onChange?.(opt)
    }
  }

  const handleDateRangeChange = (range) => {
    if (range) {
      setSelectedRange(range)
      onChange?.(formatRange(range))
    } else {
      setSelectedRange(null)
      onChange?.('All Dates')
    }
  }

  return (
    <div className={`relative ${className}`}>
      <Select
        options={options}
        value={displayValue}
        onChange={handleSelect}
        icon={Calendar}
        className="w-full"
      />
      {showPicker && (
        <DateRangePicker
          value={selectedRange}
          onChange={handleDateRangeChange}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
