export default function BentoCard({ title, icon: Icon, children, className = '' }) {
  return (
    <div className={`bg-white border border-grey-20 rounded-xl overflow-hidden ${className}`}>
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-grey-10">
        {Icon && <Icon className="w-4 h-4 text-grey-40" />}
        <h3 className="text-[14px] font-semibold text-grey-95">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

export function Field({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-grey-40 mb-0.5 uppercase tracking-wider">{label}</p>
      <p className="text-[13px] font-medium text-grey-95 truncate">{value ?? 'N/A'}</p>
    </div>
  )
}

export function StatusBadge({ label, value, color }) {
  const colors = {
    green: 'bg-green-light text-green',
    red: 'bg-red-light text-red',
    amber: 'bg-amber-light text-amber',
    info: 'bg-info-light text-info',
    grey: 'bg-grey-10 text-grey-60',
    purple: 'bg-purple-light text-purple',
  }
  return (
    <div className="min-w-0">
      {label && <p className="text-[11px] text-grey-40 mb-1 uppercase tracking-wider">{label}</p>}
      <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${colors[color] || colors.grey}`}>{value}</span>
    </div>
  )
}
