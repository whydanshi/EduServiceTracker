import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  const handleEsc = useCallback((e) => {
    if (e.key === 'Escape') onClose?.()
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, handleEsc])

  if (!isOpen) return null

  const content = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className={`relative bg-white rounded-xl shadow-xl ${maxWidth} w-full max-h-[85vh] overflow-hidden`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="flex items-center justify-between px-6 py-4 border-b border-grey-20">
          <h3 id="modal-title" className="text-[15px] font-semibold text-grey-95">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-grey-10 transition-colors">
            <X className="w-4 h-4 text-grey-40" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto max-h-[calc(85vh-56px)]">{children}</div>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
