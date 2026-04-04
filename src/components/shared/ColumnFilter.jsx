import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ListFilter, Check } from 'lucide-react'

export default function ColumnFilter({ options = [], value = [], onChange, placeholder = 'Filter', className = '' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [pendingValue, setPendingValue] = useState(value)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const dropdownRef = useRef(null)

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const dropdownWidth = 220
      const dropdownHeight = 340 // approx max height
      const viewportW = window.innerWidth
      const viewportH = window.innerHeight

      let left = rect.left
      let top = rect.bottom + 4

      // Flip left if it would overflow right edge
      if (left + dropdownWidth > viewportW - 16) {
        left = rect.right - dropdownWidth
      }

      // Flip upward if it would overflow bottom edge
      if (top + dropdownHeight > viewportH - 16) {
        top = rect.top - dropdownHeight - 4
        if (top < 8) top = rect.bottom + 4 // fallback to below if not enough space above
      }

      setDropdownPos({ top, left })
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    updatePosition()
    const onScroll = () => updatePosition()
    const onResize = () => updatePosition()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [isOpen, updatePosition])

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setPendingValue(value)
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, value])

  // Sync pending when value changes externally
  useEffect(() => {
    setPendingValue(value)
  }, [value])

  const handleToggle = (opt) => {
    setPendingValue(prev =>
      prev.includes(opt) ? prev.filter(v => v !== opt) : [...prev, opt]
    )
  }

  const handleSelectAll = () => setPendingValue([...options])
  const handleClear = () => setPendingValue([])

  const handleOk = () => {
    onChange?.(pendingValue)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setPendingValue(value)
    setIsOpen(false)
  }

  const isFiltered = value.length > 0 && value.length < options.length

  const dropdown = isOpen
    ? createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[9999] w-[220px] bg-white border border-grey-20 rounded-lg shadow-xl overflow-hidden"
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
        >
          {/* Header: Select all / Clear + count */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-grey-20 bg-grey-5">
            <div className="flex items-center gap-1.5 text-[11px]">
              <button onClick={handleSelectAll} className="text-blue-90 font-medium hover:underline">Select all</button>
              <span className="text-grey-40">-</span>
              <button onClick={handleClear} className="text-blue-90 font-medium hover:underline">Clear</button>
            </div>
            <span className="text-[10px] text-grey-40 uppercase tracking-wide">{pendingValue.length} of {options.length}</span>
          </div>

          {/* Options list */}
          <div className="max-h-[200px] overflow-y-auto py-1">
            {options.map((opt) => {
              const isSelected = pendingValue.includes(opt)
              return (
                <button
                  key={opt}
                  onClick={() => handleToggle(opt)}
                  className={`flex items-center gap-2.5 w-full px-3 py-2 text-[12px] text-left transition-colors ${
                    isSelected ? 'text-grey-95' : 'text-grey-40'
                  } hover:bg-grey-5`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? 'bg-blue-90 border-blue-90' : 'border-grey-40 bg-white'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <span className="truncate">{opt}</span>
                </button>
              )
            })}
          </div>

          {/* Footer: OK / Cancel */}
          <div className="flex items-center justify-end gap-2 px-3 py-2.5 border-t border-grey-20 bg-grey-5">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 rounded text-[11px] font-medium text-grey-60 hover:bg-grey-10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleOk}
              className="px-3 py-1.5 rounded text-[11px] font-semibold bg-blue-90 text-white hover:bg-blue-50 transition-colors"
            >
              OK
            </button>
          </div>
        </div>,
        document.body
      )
    : null

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1 rounded transition-colors ${
          isFiltered
            ? 'text-blue-90 bg-blue-10 hover:bg-blue-20'
            : 'text-grey-40 hover:text-grey-60 hover:bg-grey-10'
        }`}
        title={placeholder}
      >
        <ListFilter className="w-3.5 h-3.5" />
      </button>
      {dropdown}
    </div>
  )
}
