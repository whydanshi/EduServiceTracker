import { ChevronLeft, ChevronRight } from 'lucide-react'
import ColumnFilter from './ColumnFilter'
import EmptyState from './EmptyState'
import { TableSkeleton } from './Skeleton'

export default function DataTable({
  columns,
  data,
  page = 1,
  totalItems,
  pageSize = 10,
  onPageChange,
  onRowClick,
  columnFilters = {},
  onColumnFilterChange,
  loading = false,
  emptyState,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
}) {
  const total = totalItems || data.length
  const totalPages = Math.ceil(total / pageSize)
  const showPagination = totalPages > 1

  if (loading) return <TableSkeleton rows={pageSize > 8 ? 8 : pageSize} columns={columns.length || 5} />

  if (data.length === 0 && emptyState) {
    return (
      <div className="bg-white rounded-xl border border-grey-20 overflow-hidden">
        <EmptyState {...emptyState} />
      </div>
    )
  }

  const allVisibleIds = data.map((row) => row.id).filter(Boolean)
  const allSelected = selectable && allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.includes(id))
  const someSelected = selectable && allVisibleIds.some((id) => selectedIds.includes(id))

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange?.(selectedIds.filter((id) => !allVisibleIds.includes(id)))
    } else {
      const merged = [...new Set([...selectedIds, ...allVisibleIds])]
      onSelectionChange?.(merged)
    }
  }

  const handleSelectRow = (rowId) => {
    if (selectedIds.includes(rowId)) {
      onSelectionChange?.(selectedIds.filter((id) => id !== rowId))
    } else {
      onSelectionChange?.([...selectedIds, rowId])
    }
  }

  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (page <= 3) return [1, 2, 3, 4, '...', totalPages]
    if (page >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    return [1, '...', page - 1, page, page + 1, '...', totalPages]
  }

  return (
    <div className="bg-white rounded-xl border border-grey-20 overflow-hidden">
      {selectable && selectedIds.length > 0 && (
        <div className="px-5 py-2.5 bg-blue-10 border-b border-blue-40 flex items-center justify-between">
          <span className="text-[12px] font-medium text-blue-90">{selectedIds.length} selected</span>
          <button
            onClick={() => onSelectionChange?.([])}
            className="text-[12px] text-blue-90 font-medium hover:underline"
          >
            Clear selection
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-grey-5 border-b border-grey-20">
              {selectable && (
                <th className="px-3 py-3 w-[40px] bg-grey-5">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected }}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-grey-40 text-blue-90 accent-blue-90 cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider bg-grey-5"
                  style={col.width ? { width: col.width } : {}}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    {col.filterOptions && (
                      <ColumnFilter
                        options={col.filterOptions}
                        value={columnFilters[col.key] || []}
                        onChange={(value) => onColumnFilterChange?.(col.key, value)}
                        placeholder={`Filter ${col.label}`}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const isSelected = selectable && selectedIds.includes(row.id)
              return (
                <tr
                  key={row.id || idx}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-grey-10 last:border-b-0 transition-colors ${
                    isSelected ? 'bg-blue-5' : ''
                  } ${onRowClick ? 'cursor-pointer hover:bg-blue-5' : ''}`}
                >
                  {selectable && (
                    <td className="px-3 py-3.5 w-[40px]">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => { e.stopPropagation(); handleSelectRow(row.id) }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-grey-40 text-blue-90 accent-blue-90 cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-3.5 text-[13px] text-grey-70">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showPagination && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-grey-20 bg-grey-5">
          <p className="text-[12px] text-grey-40">
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-grey-40 hover:bg-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {getPageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-[12px] text-grey-40">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange?.(p)}
                  className={`w-8 h-8 rounded-lg text-[12px] font-medium transition-colors ${
                    page === p
                      ? 'bg-blue-90 text-white'
                      : 'text-grey-60 hover:bg-white'
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-grey-40 hover:bg-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
