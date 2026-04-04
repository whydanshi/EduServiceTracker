export default function Skeleton({ className = '', rounded = 'rounded-lg' }) {
  return (
    <div
      className={`animate-pulse bg-grey-10 ${rounded} ${className}`.trim()}
    />
  )
}

const COLUMN_WIDTHS = ['w-[60%]', 'w-[80%]', 'w-[40%]', 'w-[70%]', 'w-[50%]']

export function TableSkeleton({ rows = 5, columns = 5 }) {
  const widths = COLUMN_WIDTHS.slice(0, columns)
  while (widths.length < columns) {
    widths.push(COLUMN_WIDTHS[widths.length % COLUMN_WIDTHS.length])
  }

  return (
    <div className="bg-white rounded-xl border border-grey-20 overflow-hidden">
      <div className="bg-grey-5 py-4 px-5 flex gap-4">
        {widths.map((w, i) => (
          <Skeleton key={i} className={`h-3 ${w}`} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="py-4 px-5 flex gap-4 border-t border-grey-20"
        >
          {widths.map((w, colIdx) => (
            <Skeleton key={colIdx} className={`h-3 ${w}`} />
          ))}
        </div>
      ))}
    </div>
  )
}
