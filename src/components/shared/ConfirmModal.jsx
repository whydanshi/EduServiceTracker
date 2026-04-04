import { useEffect, useCallback } from 'react'
import { X, AlertTriangle } from 'lucide-react'

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete', danger = true }) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-start gap-4">
            {danger && (
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-light flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-semibold text-grey-95">{title}</h3>
              <p className="text-[13px] text-grey-60 mt-1.5 leading-relaxed">{message}</p>
            </div>
            <button onClick={onClose} className="p-1 rounded-md hover:bg-grey-10 transition-colors flex-shrink-0">
              <X className="w-4 h-4 text-grey-40" />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-grey-60 border border-grey-20 hover:bg-grey-10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm?.(); onClose?.() }}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-colors ${
              danger ? 'bg-red hover:bg-red/90' : 'bg-blue-90 hover:bg-blue-50'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
