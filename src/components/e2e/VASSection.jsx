import { useState } from 'react'
import { Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { formatINR } from '../../utils/pnlCalculator'
import MarginBadge from './MarginBadge'

const approvalColors = {
  approved: { bg: 'bg-green-light', text: 'text-green', icon: CheckCircle2 },
  pending:  { bg: 'bg-amber-light', text: 'text-amber', icon: Clock },
  rejected: { bg: 'bg-red-light',   text: 'text-red',   icon: AlertCircle },
}

export default function VASSection({ vasItems = [], onAddVAS, editable = false, headerAction = null }) {
  const [showAdd, setShowAdd] = useState(false)
  const [newAmount, setNewAmount] = useState('')
  const [newCost, setNewCost] = useState('')

  const handleAdd = () => {
    if (!newAmount) return
    const nextNum = vasItems.length + 1
    onAddVAS?.({
      id: `VAS${nextNum}`,
      name: `VAS${nextNum}`,
      amount: parseFloat(newAmount) || 0,
      cost: parseFloat(newCost) || 0,
      status: 'pending',
      approvalStatus: 'pending',
    })
    setNewAmount('')
    setNewCost('')
    setShowAdd(false)
  }

  const totalRevenue = vasItems.reduce((s, v) => s + (v.amount || 0), 0)
  const totalCost = vasItems.reduce((s, v) => s + (v.cost || 0), 0)
  const vasPnLVal = totalRevenue - totalCost
  const vasMargin = totalRevenue > 0 ? ((vasPnLVal / totalRevenue) * 100) : 0

  return (
    <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-grey-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-[14px] font-semibold text-grey-95">Value Added Services (VAS)</h3>
          {vasItems.length > 0 && <MarginBadge margin={vasMargin} size="sm" />}
        </div>
        {headerAction || (
          editable && (
            <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 text-[12px] font-semibold text-blue-90 hover:text-blue-50 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add VAS
            </button>
          )
        )}
      </div>

      {vasItems.length === 0 && !showAdd && (
        <div className="px-5 py-8 text-center text-[13px] text-grey-40">No VAS items added</div>
      )}

      {vasItems.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-grey-5 border-b border-grey-20">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">VAS</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Revenue</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Cost</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">P&L</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Approval</th>
                </tr>
              </thead>
              <tbody>
                {vasItems.map(vas => {
                  const approval = approvalColors[vas.approvalStatus] || approvalColors.pending
                  const ApprovalIcon = approval.icon
                  const itemPnL = (vas.amount || 0) - (vas.cost || 0)
                  return (
                    <tr key={vas.id} className="border-b border-grey-10 last:border-b-0">
                      <td className="px-5 py-3.5 text-[13px] font-medium text-grey-95">{vas.id}</td>
                      <td className="px-5 py-3.5 text-[13px] text-grey-70">{formatINR(vas.amount)}</td>
                      <td className="px-5 py-3.5 text-[13px] text-grey-70">{formatINR(vas.cost)}</td>
                      <td className="px-5 py-3.5 text-[13px] font-medium">
                        <span className={itemPnL >= 0 ? 'text-green' : 'text-red'}>{formatINR(itemPnL)}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${approval.bg} ${approval.text}`}>
                          <ApprovalIcon className="w-3 h-3" />
                          {vas.approvalStatus}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showAdd && (
        <div className="px-5 py-4 border-t border-grey-10 bg-grey-5">
          <p className="text-[12px] font-semibold text-grey-60 mb-2">New VAS — will be named VAS{vasItems.length + 1}</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input value={newAmount} onChange={e => setNewAmount(e.target.value)} type="number" placeholder="Revenue (INR)" className="border border-grey-20 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-90" />
            <input value={newCost} onChange={e => setNewCost(e.target.value)} type="number" placeholder="Cost (INR)" className="border border-grey-20 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-90" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-3 py-1.5 bg-blue-90 text-white text-[12px] font-semibold rounded-lg hover:bg-blue-50 transition-colors">Add</button>
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-grey-60 text-[12px] font-medium border border-grey-20 rounded-lg hover:bg-grey-10 transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
