import { useEffect, useCallback } from 'react'
import { X } from 'lucide-react'

export default function ProfileSheet({ isOpen, onClose, title = 'Student Profile', subtitle, children }) {
  const handleEsc = useCallback((e) => {
    if (e.key === 'Escape') onClose?.()
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, handleEsc])

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-[820px] max-w-[92vw] bg-white shadow-xl z-50 flex flex-col border-l border-grey-20 animate-slide-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-grey-20 flex-shrink-0">
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold text-grey-95 truncate">{title}</h3>
            {subtitle && <p className="text-[11px] text-grey-40 mt-0.5 truncate">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-grey-10 transition-colors">
            <X className="w-4 h-4 text-grey-40" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </>
  )
}

