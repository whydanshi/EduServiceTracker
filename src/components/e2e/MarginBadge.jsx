import { getMarginColor } from '../../utils/pnlCalculator'

const colorMap = {
  green:  { bg: 'bg-green-light', text: 'text-green',  dot: 'bg-green', border: 'border border-green' },
  grey:   { bg: 'bg-grey-10', text: 'text-grey-70', dot: 'bg-grey-40', border: 'border border-grey-40' },
  yellow: { bg: 'bg-amber-light', text: 'text-amber',  dot: 'bg-amber', border: 'border border-amber' },
  red:    { bg: 'bg-red-light',   text: 'text-red',    dot: 'bg-red', border: 'border border-red' },
}

export default function MarginBadge({ margin, size = 'md' }) {
  if (margin == null) return <span className="text-grey-40 text-[12px]">—</span>

  const color = getMarginColor(margin)
  const c = colorMap[color] || colorMap.green

  const sizeClasses = size === 'lg'
    ? 'text-[22px] font-bold px-3.5 py-1.5 gap-2'
    : size === 'sm'
      ? 'text-[11px] font-semibold px-2 py-0.5 gap-1'
      : 'text-[13px] font-semibold px-2.5 py-1 gap-1.5'

  return (
    <span className={`inline-flex items-center rounded-full ${c.bg} ${c.text} ${c.border} ${sizeClasses}`}>
      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
      {margin.toFixed(1)}%
    </span>
  )
}
