export default function FilterPills({ filters, activeFilter, onFilterChange }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`inline-flex items-center gap-1.5 px-4 py-[7px] rounded-full text-[12px] font-medium transition-all duration-150 border ${
            activeFilter === filter.id
              ? 'bg-blue-20 text-blue-90 border-blue-90 font-semibold'
              : 'bg-white text-grey-60 border-grey-20 hover:border-blue-40 hover:text-grey-70'
          }`}
        >
          {filter.dot && (
            <span className={`w-1.5 h-1.5 rounded-full ${
              activeFilter === filter.id ? 'bg-blue-90' : filter.dotColor || 'bg-grey-40'
            }`} />
          )}
          {filter.label}
          {filter.count !== undefined && (
            <span className={activeFilter === filter.id ? 'text-blue-90/60' : 'text-grey-40'}>
              ({filter.count})
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
