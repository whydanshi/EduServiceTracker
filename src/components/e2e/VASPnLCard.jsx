import MarginBadge from './MarginBadge'
import { formatINR } from '../../utils/pnlCalculator'

function Row({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[12px] text-grey-60 uppercase tracking-wider">{label}</span>
      <span className={`text-[13px] font-semibold ${highlight === 'green' ? 'text-green' : highlight === 'red' ? 'text-red' : 'text-grey-95'}`}>
        {value}
      </span>
    </div>
  )
}

export default function VASPnLCard({ vasItems = [], title = 'VAS P&L Summary' }) {
  const totalFacilitatedAmount = vasItems.reduce((sum, item) => sum + (item.amount || 0), 0)
  const totalCost = vasItems.reduce((sum, item) => sum + (item.cost || 0), 0)
  const netPnL = totalFacilitatedAmount - totalCost
  const marginPct = totalFacilitatedAmount > 0 ? (netPnL / totalFacilitatedAmount) * 100 : 0

  return (
    <div className="bg-white border border-grey-20 rounded-xl overflow-hidden self-start h-fit">
      <div className="px-5 py-3.5 border-b border-grey-10">
        <h3 className="text-[14px] font-semibold text-grey-95">{title}</h3>
      </div>
      <div className="px-5 py-3 divide-y divide-grey-10">
        <Row label="VAS Facilitated Amount" value={formatINR(totalFacilitatedAmount)} />
        <Row label="VAS Cost" value={formatINR(totalCost)} />
        <Row label="Net VAS P&L" value={formatINR(netPnL)} highlight={netPnL >= 0 ? 'green' : 'red'} />

        <div className="flex items-center justify-between py-3 bg-grey-5 -mx-5 px-5 mt-2 rounded-b-lg">
          <span className="text-[13px] font-semibold text-grey-95">VAS Margin</span>
          <MarginBadge margin={marginPct} size="md" />
        </div>
      </div>
    </div>
  )
}
