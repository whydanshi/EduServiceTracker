import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export default function Select({ options = [], value, onChange, placeholder = 'Select...', className = '', icon: Icon = null }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState(value || '')
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (opt) => {
    setSelected(opt)
    onChange?.(opt)
    setIsOpen(false)
  }

  const displayLabel = selected || placeholder

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 w-full border rounded-lg px-3.5 py-2 text-[13px] font-medium transition-all outline-none ${
          isOpen
            ? 'border-blue-90 ring-2 ring-blue-20 bg-white'
            : 'border-grey-20 bg-white hover:border-grey-40'
        } ${selected ? 'text-grey-95' : 'text-grey-40'}`}
      >
        {Icon && <Icon className="w-3.5 h-3.5 text-grey-40 flex-shrink-0" />}
        <span className="truncate">{displayLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-grey-40 flex-shrink-0 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-grey-20 rounded-lg shadow-lg py-1 max-h-[240px] overflow-y-auto">
          {options.map((opt) => {
            const label = typeof opt === 'string' ? opt : opt.label
            const val = typeof opt === 'string' ? opt : opt.value
            const isActive = selected === val

            return (
              <button
                key={val}
                onClick={() => handleSelect(val)}
                className={`flex items-center justify-between w-full px-3.5 py-2 text-[13px] text-left transition-colors ${
                  isActive
                    ? 'bg-blue-10 text-blue-90 font-medium'
                    : 'text-grey-70 hover:bg-grey-5'
                }`}
              >
                <span>{label}</span>
                {isActive && <Check className="w-3.5 h-3.5 text-blue-90" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
