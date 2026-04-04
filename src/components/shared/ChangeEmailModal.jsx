import { useState } from 'react'
import Modal from './Modal'
import { Mail } from 'lucide-react'

export default function ChangeEmailModal({ isOpen, onClose, currentEmail }) {
  const [newEmail, setNewEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle email change logic here
    console.log('Email change:', { currentEmail, newEmail, confirmEmail })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Email">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[12px] text-grey-60 font-medium block mb-1.5">Current Email</label>
          <input
            type="email"
            value={currentEmail || ''}
            disabled
            className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-40 bg-grey-5 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="text-[12px] text-grey-60 font-medium block mb-1.5">New Email</label>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 placeholder:text-grey-40 outline-none focus:border-blue-90 focus:ring-2 focus:ring-blue-20"
            placeholder="Enter new email"
            required
          />
        </div>
        <div>
          <label className="text-[12px] text-grey-60 font-medium block mb-1.5">Confirm New Email</label>
          <input
            type="email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 placeholder:text-grey-40 outline-none focus:border-blue-90 focus:ring-2 focus:ring-blue-20"
            placeholder="Confirm new email"
            required
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[13px] font-medium text-grey-60 hover:bg-grey-10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold bg-blue-90 text-white hover:bg-blue-50 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Change Email
          </button>
        </div>
      </form>
    </Modal>
  )
}
