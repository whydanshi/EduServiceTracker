import { useState } from 'react'
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { formatINR } from '../../utils/pnlCalculator'
import MarginBadge from './MarginBadge'

export default function ApprovalCard({ approval, onApprove, onReject }) {
  const [remarks, setRemarks] = useState('')

  return (
    <div className={`bg-white border rounded-xl overflow-hidden ${approval.escalated ? 'border-red' : 'border-grey-20'}`}>
      {approval.escalated && (
        <div className="px-5 py-2 bg-red-light flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-red" />
          <span className="text-[11px] font-semibold text-red">Escalated — Requires Super Admin Approval</span>
        </div>
      )}
      <div className="px-5 py-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[15px] font-semibold text-grey-95">{approval.studentName}</p>
            <p className="text-[12px] text-grey-60 mt-0.5">{approval.serviceName}</p>
          </div>
          <div className="text-right">
            <p className="text-[15px] font-bold text-grey-95">{formatINR(approval.amount)}</p>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${approval.type === 'vas' ? 'bg-purple-light text-purple' : 'bg-info-light text-info'}`}>
              {approval.type.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[12px] text-grey-60 mb-3">
          <span>Requested by: <strong className="text-grey-70">{approval.requestedBy}</strong></span>
          <span>Date: {approval.requestedDate}</span>
          {approval.sendToFinance && (
            <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-info-light text-info">
              Forwarded to Finance
            </span>
          )}
          {approval.margin != null && (
            <span className="flex items-center gap-1">
              Margin: <MarginBadge margin={approval.margin} size="sm" />
            </span>
          )}
        </div>

        <input
          value={remarks}
          onChange={e => setRemarks(e.target.value)}
          placeholder="Add remarks..."
          className="w-full border border-grey-20 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-blue-90 mb-3"
        />

        <div className="flex items-center gap-2">
          <button
            onClick={() => onApprove?.(approval.id, remarks)}
            className="flex items-center gap-1.5 px-4 py-2 bg-green text-white text-[12px] font-semibold rounded-lg hover:bg-green/90 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
          </button>
          <button
            onClick={() => onReject?.(approval.id, remarks)}
            className="flex items-center gap-1.5 px-4 py-2 bg-red text-white text-[12px] font-semibold rounded-lg hover:bg-red/90 transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" /> Reject
          </button>
        </div>
      </div>
    </div>
  )
}
