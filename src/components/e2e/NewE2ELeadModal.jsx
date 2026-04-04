import { useState, useMemo } from 'react'
import { X } from 'lucide-react'
import { e2ePackages } from '../../data/e2ePackages'
import { salesTeam, serviceTeam } from '../../data/team'

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  university: '',
  course: '',
  intake: '',
  country: 'UK',
  totalAmountReceived: '',
  packageId: '',
  salesPOC: '',
  servicePOC: '',
}

export default function NewE2ELeadModal({ isOpen, onClose, onSubmit, nextId }) {
  const [form, setForm] = useState(emptyForm)

  const packageOptions = useMemo(
    () => e2ePackages.filter(pkg => pkg.id !== 'pkg-custom'),
    [],
  )

  if (!isOpen) return null

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = () => {
    if (!form.firstName || !form.lastName || !form.email || !form.university || !form.packageId) return
    const pkg = e2ePackages.find(p => p.id === form.packageId)
    const payload = {
      id: nextId,
      studentName: `${form.firstName} ${form.lastName}`.trim(),
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      university: form.university,
      course: form.course || 'TBD',
      intake: form.intake || 'TBD',
      country: form.country,
      packageId: form.packageId,
      packageName: pkg?.name || 'Custom',
      totalAmountReceived: Number(form.totalAmountReceived || 0),
      salesPOC: form.salesPOC || 'Unassigned',
      servicePOC: form.servicePOC || 'Unassigned',
      servicesOpted: [],
      vasItems: [],
      payments: [],
      history: [],
      isRefundCase: false,
      gstApplicable: true,
      gstRate: 18,
      loanDetails: { vendorId: 'lv-none', amount: 0, subvention: 0, gstApplicable: false },
      city: 'TBD',
      state: 'TBD',
      offerLetterStatus: 'Pending',
      offerLetterDate: '',
      date: new Date().toLocaleDateString('en-GB'),
    }
    onSubmit?.(payload)
    setForm(emptyForm)
    onClose?.()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-xl border border-grey-20 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-grey-20">
          <h3 className="text-[16px] font-semibold text-grey-95">Add New E2E Lead</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-grey-10 transition-colors">
            <X className="w-4 h-4 text-grey-40" />
          </button>
        </div>

        <div className="px-6 py-5 grid grid-cols-2 gap-4">
          <Input label="First Name *" value={form.firstName} onChange={v => update('firstName', v)} />
          <Input label="Last Name *" value={form.lastName} onChange={v => update('lastName', v)} />
          <Input label="Email *" type="email" value={form.email} onChange={v => update('email', v)} />
          <Input label="Phone" value={form.phone} onChange={v => update('phone', v)} />
          <Input label="University *" value={form.university} onChange={v => update('university', v)} />
          <Input label="Course" value={form.course} onChange={v => update('course', v)} />
          <Input label="Intake" value={form.intake} onChange={v => update('intake', v)} />
          <Input label="Country" value={form.country} onChange={v => update('country', v)} />
          <Input label="Total Received (INR)" type="number" value={form.totalAmountReceived} onChange={v => update('totalAmountReceived', v)} />
          <Select
            label="Package *"
            value={form.packageId}
            onChange={v => update('packageId', v)}
            options={packageOptions.map(pkg => ({ value: pkg.id, label: pkg.name }))}
          />
          <Select
            label="Sales POC"
            value={form.salesPOC}
            onChange={v => update('salesPOC', v)}
            options={(salesTeam || []).map(m => ({ value: m.name, label: m.name }))}
          />
          <Select
            label="Service POC"
            value={form.servicePOC}
            onChange={v => update('servicePOC', v)}
            options={(serviceTeam || []).map(m => ({ value: m.name, label: m.name }))}
          />
        </div>

        <div className="px-6 py-4 border-t border-grey-20 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium border border-grey-20 text-grey-60 rounded-lg hover:bg-grey-10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-[13px] font-semibold bg-blue-90 text-white rounded-lg hover:bg-blue-50 transition-colors"
          >
            Create Lead
          </button>
        </div>
      </div>
    </div>
  )
}

function Input({ label, value, onChange, type = 'text' }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-semibold text-grey-60 mb-1.5">{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-95 outline-none focus:border-blue-90 transition-colors"
      />
    </label>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-semibold text-grey-60 mb-1.5">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-95 outline-none focus:border-blue-90 transition-colors"
      >
        <option value="">Select</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  )
}
