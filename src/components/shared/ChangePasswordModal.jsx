import { useState } from 'react'
import Modal from './Modal'
import { Lock } from 'lucide-react'

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle password change logic here
    console.log('Password change:', { currentPassword, newPassword, confirmPassword })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[12px] text-grey-60 font-medium block mb-1.5">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 placeholder:text-grey-40 outline-none focus:border-blue-90 focus:ring-2 focus:ring-blue-20"
            placeholder="Enter current password"
            required
          />
        </div>
        <div>
          <label className="text-[12px] text-grey-60 font-medium block mb-1.5">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 placeholder:text-grey-40 outline-none focus:border-blue-90 focus:ring-2 focus:ring-blue-20"
            placeholder="Enter new password"
            required
          />
        </div>
        <div>
          <label className="text-[12px] text-grey-60 font-medium block mb-1.5">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-70 placeholder:text-grey-40 outline-none focus:border-blue-90 focus:ring-2 focus:ring-blue-20"
            placeholder="Confirm new password"
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
            <Lock className="w-4 h-4" />
            Change Password
          </button>
        </div>
      </form>
    </Modal>
  )
}
