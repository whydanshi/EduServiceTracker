import { formatINR, formatGBP } from '../../utils/currency'

export default function CurrencyDisplay({ amountGBP, amountINR, rate, className = '' }) {
  if (amountGBP == null && amountINR == null) return <span className="text-grey-40">—</span>

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {amountINR != null && <span className="font-medium text-grey-95">{formatINR(amountINR)}</span>}
      {amountGBP != null && (
        <span className="text-[11px] text-grey-40">({formatGBP(amountGBP)})</span>
      )}
      {rate && <span className="text-[10px] text-grey-40">@{rate.toFixed(2)}</span>}
    </span>
  )
}
