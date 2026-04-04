import { useState } from 'react'
import { X, AlertTriangle, Send } from 'lucide-react'
import { e2eServices } from '../../data/e2ePackages'
import { formatINR } from '../../utils/pnlCalculator'

export default function AddPayoutModal({ isOpen, onClose, onSubmit, payoutType, currentPnL, services, vasItems }) {
  const [serviceId, setServiceId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [remarks, setRemarks] = useState('')
  const [sendToFinance, setSendToFinance] = useState(false)

  if (!isOpen) return null

  const isVAS = payoutType === 'vas'
  const amountNum = parseFloat(amount) || 0

  let projectedMargin = 0
  let needsApproval = false

  if (isVAS) {
    const totalRevenue = (vasItems || []).reduce((sum, item) => sum + (item.amount || 0), 0)
    const totalCost = (vasItems || []).reduce((sum, item) => sum + (item.cost || 0), 0)
    const projectedCost = totalCost + amountNum
    projectedMargin = totalRevenue > 0 ? ((totalRevenue - projectedCost) / totalRevenue) * 100 : 0
    needsApproval = true
  } else {
    const projectedActualCost = (currentPnL?.actualCost || 0) + amountNum
    const projectedPnL = (currentPnL?.afterGSTAndSubvention || 0) - projectedActualCost
    projectedMargin = currentPnL?.totalReceived > 0
      ? (projectedPnL / currentPnL.totalReceived) * 100
      : 0
    needsApproval = projectedMargin < 10
  }

  const isValid = amountNum > 0 && description.trim()

  const handleSubmit = () => {
    if (!isValid) return
    onSubmit({
      type: payoutType,
      serviceId: isVAS ? null : (serviceId || null),
      serviceName: isVAS ? `VAS${nextVasNum}` : (svcOptions.find(s => s.id === serviceId)?.name || 'General / Miscellaneous'),
      amount: amountNum,
      description: description.trim(),
      remarks: remarks.trim(),
      projectedMargin,
      needsApproval,
      sendToFinance,
    })
    setServiceId('')
    setAmount('')
    setDescription('')
    setRemarks('')
    setSendToFinance(false)
  }

  const svcOptions = (services || []).map(s => {
    const info = e2eServices.find(x => x.id === s.serviceId)
    return { id: s.serviceId, name: info?.name || s.serviceId }
  })

  const nextVasNum = (vasItems || []).length + 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl border border-grey-20 shadow-xl w-[480px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-grey-20">
          <h2 className="text-[16px] font-semibold text-grey-95">
            {isVAS ? 'Add VAS Payout' : 'Add E2E Service Payout'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-grey-10 rounded-lg transition-colors">
            <X className="w-4 h-4 text-grey-40" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {isVAS ? (
            <div className="bg-blue-10 rounded-lg px-4 py-3">
              <p className="text-[12px] font-semibold text-blue-90">This payout will be added as VAS{nextVasNum}</p>
              <p className="text-[11px] text-blue-90/70 mt-0.5">All VAS payouts require admin approval</p>
            </div>
          ) : (
            <div>
              <label className="block text-[12px] font-semibold text-grey-60 mb-1.5">Service</label>
              <select
                value={serviceId}
                onChange={e => setServiceId(e.target.value)}
                className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-95 outline-none focus:border-blue-90 transition-colors"
              >
                <option value="">General / Miscellaneous</option>
                {svcOptions.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[12px] font-semibold text-grey-60 mb-1.5">
              Amount (₹) *
            </label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Payout amount"
              min="0"
              className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-95 outline-none focus:border-blue-90 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-grey-60 mb-1.5">Description *</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={isVAS ? 'e.g. Accommodation deposit' : 'e.g. Additional visa processing fee'}
              className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-95 outline-none focus:border-blue-90 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-grey-60 mb-1.5">Remarks</label>
            <input
              type="text"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="Optional note for approver/finance"
              className="w-full border border-grey-20 rounded-lg px-3 py-2.5 text-[13px] text-grey-95 outline-none focus:border-blue-90 transition-colors"
            />
          </div>

          {amountNum > 0 && !isVAS && (
            <div className="bg-grey-5 border border-grey-20 rounded-lg p-4 space-y-2">
              <p className="text-[11px] font-semibold text-grey-40 uppercase tracking-wider mb-2">Impact Preview</p>
              <div className="flex justify-between text-[12px]">
                <span className="text-grey-60">Current E2E Margin</span>
                <span className={`font-semibold ${currentPnL?.marginPct >= 10 ? 'text-green' : 'text-red'}`}>
                  {currentPnL?.marginPct?.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-grey-60">Payout Amount</span>
                <span className="font-semibold text-grey-95">{formatINR(amountNum)}</span>
              </div>
              <div className="border-t border-grey-20 pt-2 mt-2 flex justify-between text-[12px]">
                <span className="text-grey-60">Projected E2E Margin</span>
                <span className={`font-semibold ${projectedMargin >= 10 ? 'text-green' : 'text-red'}`}>
                  {projectedMargin.toFixed(1)}%
                </span>
              </div>
              {needsApproval && (
                <div className="flex items-start gap-2 mt-3 p-2.5 bg-amber-light rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[12px] font-semibold text-amber">Approval Required</p>
                    <p className="text-[11px] text-amber/80 mt-0.5">
                      E2E margin will drop below 10%. Needs admin/superadmin approval.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {isVAS && amountNum > 0 && (
            <div className="bg-grey-5 border border-grey-20 rounded-lg p-4 space-y-2">
              <p className="text-[11px] font-semibold text-grey-40 uppercase tracking-wider mb-2">Impact Preview</p>
              <div className="flex justify-between text-[12px]">
                <span className="text-grey-60">Current VAS Margin</span>
                <span className={`font-semibold ${currentPnL?.vasMargin >= 5 ? 'text-green' : 'text-red'}`}>
                  {(currentPnL?.vasMargin || 0).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-grey-60">Payout Amount</span>
                <span className="font-semibold text-grey-95">{formatINR(amountNum)}</span>
              </div>
              <div className="border-t border-grey-20 pt-2 mt-2 flex justify-between text-[12px]">
                <span className="text-grey-60">Projected VAS Margin</span>
                <span className={`font-semibold ${projectedMargin >= 5 ? 'text-green' : 'text-red'}`}>
                  {projectedMargin.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-start gap-2 mt-3 p-2.5 bg-amber-light rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[12px] font-semibold text-amber">Approval Required</p>
                  <p className="text-[11px] text-amber/80 mt-0.5">
                    All VAS payouts require admin approval before processing.
                  </p>
                </div>
              </div>
            </div>
          )}

          {amountNum > 0 && (
            <label className="flex items-center gap-3 p-3 border border-grey-20 rounded-lg cursor-pointer hover:border-blue-40 transition-colors">
              <input
                type="checkbox"
                checked={sendToFinance}
                onChange={e => setSendToFinance(e.target.checked)}
                className="w-4 h-4 rounded border-grey-30 text-blue-90 focus:ring-blue-90"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-blue-90" />
                  <span className="text-[12px] font-semibold text-grey-95">Send to Finance</span>
                </div>
                <p className="text-[11px] text-grey-40 mt-0.5">
                  Forward this payout request to the finance team for processing
                </p>
              </div>
            </label>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-grey-20">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium text-grey-60 hover:text-grey-95 border border-grey-20 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className="px-4 py-2 text-[13px] font-semibold text-white bg-blue-90 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {needsApproval ? 'Submit for Approval' : 'Add Payout'}
          </button>
        </div>
      </div>
    </div>
  )
}
