import MarginBadge from './MarginBadge'
import { formatINR } from '../../utils/pnlCalculator'

function Row({ label, value, highlight, sub }) {
  return (
    <div className={`flex items-center justify-between py-2 ${sub ? 'pl-4' : ''}`}>
      <span className={`text-[12px] ${sub ? 'text-grey-40' : 'text-grey-60'} uppercase tracking-wider`}>{label}</span>
      <span className={`text-[13px] font-semibold ${highlight === 'green' ? 'text-green' : highlight === 'red' ? 'text-red' : 'text-grey-95'}`}>
        {value}
      </span>
    </div>
  )
}

export default function PnLSummaryCard({ pnl, title = 'E2E P&L Summary' }) {
  if (!pnl) return null

  return (
    <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-grey-10">
        <h3 className="text-[14px] font-semibold text-grey-95">{title}</h3>
      </div>
      <div className="px-5 py-3 divide-y divide-grey-10">
        <Row label="Total Received" value={formatINR(pnl.totalReceived)} />
        <Row label="GST Deducted" value={formatINR(pnl.gstAmount)} />
        <Row label="Loan Subvention" value={formatINR(pnl.loanSubvention)} />
        <Row label="Net After Deductions" value={formatINR(pnl.afterGSTAndSubvention)} />
        <Row label="Expected Service Cost" value={formatINR(pnl.expectedCost)} />
        <Row label="Actual Service Cost" value={formatINR(pnl.actualCost)} />
        <Row label="Expected P&L" value={formatINR(pnl.expectedPnL)} highlight={pnl.expectedPnL >= 0 ? 'green' : 'red'} />
        <Row label="Net E2E P&L" value={formatINR(pnl.netPnL)} highlight={pnl.netPnL >= 0 ? 'green' : 'red'} />

        <div className="flex items-center justify-between py-3 bg-grey-5 -mx-5 px-5 mt-2 rounded-b-lg">
          <span className="text-[13px] font-semibold text-grey-95">E2E Margin</span>
          <MarginBadge margin={pnl.marginPct} size="md" />
        </div>
      </div>
    </div>
  )
}
