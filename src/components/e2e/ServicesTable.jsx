import { useState } from 'react'
import { CheckCircle2, Clock, Loader2, Pencil, Check, X } from 'lucide-react'
import { e2eServices } from '../../data/e2ePackages'
import { formatINR } from '../../utils/pnlCalculator'
import FXRatePopover from './FXRatePopover'

const statusConfig = {
  completed:     { icon: CheckCircle2, label: 'Completed',   bg: 'bg-green-light', text: 'text-green' },
  'in-progress': { icon: Loader2,      label: 'In Progress', bg: 'bg-amber-light', text: 'text-amber' },
  pending:       { icon: Clock,        label: 'Pending',     bg: 'bg-grey-10',     text: 'text-grey-60' },
}

function ServiceStatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.pending
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${cfg.bg} ${cfg.text}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  )
}

export default function ServicesTable({
  services = [],
  onUpdateService,
  editable = false,
  editableExpected = false,
  headerAction = null,
  showCosts = true,
}) {
  const [editingIdx, setEditingIdx] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [editingExpectedIdx, setEditingExpectedIdx] = useState(null)
  const [editExpectedValue, setEditExpectedValue] = useState('')

  const handleEdit = (idx, currentActual) => {
    setEditingIdx(idx)
    setEditValue(currentActual?.toString() || '')
  }

  const handleEditExpected = (idx, currentExpected) => {
    setEditingExpectedIdx(idx)
    setEditExpectedValue(currentExpected?.toString() || '')
  }

  const handleSave = (idx) => {
    const val = parseFloat(editValue)
    if (!isNaN(val)) {
      onUpdateService?.(idx, { actual: val })
    }
    setEditingIdx(null)
  }

  const handleSaveExpected = (idx) => {
    const val = parseFloat(editExpectedValue)
    if (!isNaN(val)) {
      onUpdateService?.(idx, { expected: val })
    }
    setEditingExpectedIdx(null)
  }

  return (
    <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-grey-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-[14px] font-semibold text-grey-95">Services</h3>
          <FXRatePopover />
        </div>
        {headerAction}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-grey-5 border-b border-grey-20">
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Service</th>
              {showCosts && <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Expected</th>}
              {showCosts && <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Actual</th>}
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {services.map((svc, idx) => {
              const svcInfo = e2eServices.find(s => s.id === svc.serviceId)
              const isOverBudget = svc.actual != null && svc.actual > svc.expected
              const isEditing = editingIdx === idx
              const isEditingExpected = editingExpectedIdx === idx

              return (
                <tr key={svc.serviceId} className="border-b border-grey-10 last:border-b-0">
                  <td className="px-5 py-3.5 text-[13px] font-medium text-grey-95">{svcInfo?.name || svc.serviceId}</td>
                  {showCosts && (
                    <td className="px-5 py-3.5 text-[13px] text-grey-70">
                      {isEditingExpected ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={editExpectedValue}
                            onChange={e => setEditExpectedValue(e.target.value)}
                            className="w-28 border border-grey-20 rounded px-2 py-1 text-[13px] outline-none focus:border-blue-90"
                            autoFocus
                          />
                          <button onClick={() => handleSaveExpected(idx)} className="p-1 text-green hover:bg-green-light rounded"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setEditingExpectedIdx(null)} className="p-1 text-red hover:bg-red-light rounded"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={!editableExpected || svc.status === 'completed'}
                          onClick={() => handleEditExpected(idx, svc.expected)}
                          className={`inline-flex items-center gap-1 ${
                            editableExpected && svc.status !== 'completed'
                              ? 'hover:text-blue-90 transition-colors cursor-pointer'
                              : 'cursor-default'
                          } text-grey-70`}
                        >
                          <span>{formatINR(svc.expected)}</span>
                          {editableExpected && svc.status !== 'completed' && <Pencil className="w-3 h-3 text-grey-40" />}
                        </button>
                      )}
                    </td>
                  )}
                  {showCosts && (
                    <td className="px-5 py-3.5 text-[13px]">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            className="w-28 border border-grey-20 rounded px-2 py-1 text-[13px] outline-none focus:border-blue-90"
                            autoFocus
                          />
                          <button onClick={() => handleSave(idx)} className="p-1 text-green hover:bg-green-light rounded"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setEditingIdx(null)} className="p-1 text-red hover:bg-red-light rounded"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={!editable || svc.status === 'completed'}
                          onClick={() => handleEdit(idx, svc.actual)}
                          className={`inline-flex items-center gap-1 ${
                            editable && svc.status !== 'completed'
                              ? 'hover:text-blue-90 transition-colors cursor-pointer'
                              : 'cursor-default'
                          } ${isOverBudget ? 'text-red font-medium' : 'text-grey-70'}`}
                        >
                          <span>{svc.actual != null ? formatINR(svc.actual) : '—'}</span>
                          {editable && svc.status !== 'completed' && <Pencil className="w-3 h-3 text-grey-40" />}
                        </button>
                      )}
                    </td>
                  )}
                  <td className="px-5 py-3.5"><ServiceStatusBadge status={svc.status} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
