import { useEffect, useMemo } from 'react'
import { X, BarChart3 } from 'lucide-react'
import { SalesStatusPill, ServiceStatusPill } from './StatusPill'

function groupCount(items, key) {
  const m = new Map()
  for (const it of items) {
    const v = (it?.[key] ?? '—') || '—'
    m.set(v, (m.get(v) || 0) + 1)
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1])
}

function Breakdown({ title, rows }) {
  return (
    <div className="border border-grey-20 rounded-xl overflow-hidden bg-white">
      <div className="px-4 py-2.5 bg-grey-5 border-b border-grey-20 flex items-center justify-between">
        <p className="text-[11px] font-semibold text-grey-40 uppercase tracking-wider">{title}</p>
        <BarChart3 className="w-3.5 h-3.5 text-grey-40" />
      </div>
      <div className="px-4 py-3 space-y-2">
        {rows.map(([label, count]) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-[12px] text-grey-70">{label}</span>
            <span className="text-[12px] font-semibold text-grey-90">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CityDetailsSheet({ isOpen, onClose, city, leads, role }) {
  const title = city || 'City'

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const salesBreakdown = useMemo(() => groupCount(leads, 'salesStatus'), [leads])
  const serviceBreakdown = useMemo(() => groupCount(leads, 'serviceStatus'), [leads])
  const sourceBreakdown = useMemo(() => groupCount(leads, 'source'), [leads])

  const leadDetailHref = (id) => (role === 'admin' ? `/admin/lead/${id}` : `/sales/lead/${id}`)

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-[520px] max-w-[95vw] bg-white shadow-xl z-50 flex flex-col border-l border-grey-20 animate-slide-in">
        <div className="flex items-start justify-between gap-3 px-6 py-5 border-b border-grey-20 flex-shrink-0">
          <div className="min-w-0">
            <h3 className="text-[16px] font-semibold text-grey-95 truncate">{title}</h3>
            <p className="text-[12px] text-grey-60 mt-0.5">{leads.length} lead{leads.length !== 1 ? 's' : ''} in selected range</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-grey-10 transition-colors">
            <X className="w-4 h-4 text-grey-40" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Breakdown title="Sales status" rows={salesBreakdown} />
            <Breakdown title="Service status" rows={serviceBreakdown} />
            <Breakdown title="Source" rows={sourceBreakdown} />
          </div>

          <div className="bg-white rounded-xl border border-grey-20 overflow-hidden">
            <div className="px-5 py-3 bg-grey-5 border-b border-grey-20">
              <p className="text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Leads</p>
            </div>
            <div className="divide-y divide-grey-10">
              {leads.map((l) => (
                <div key={l.id} className="px-5 py-4 flex items-start justify-between gap-4 hover:bg-blue-5 transition-colors">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-grey-95 truncate">{l.studentName}</p>
                    <p className="text-[12px] text-grey-60 mt-0.5">ID: {l.id} · {l.date}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <SalesStatusPill status={l.salesStatus} size="sm" />
                      <ServiceStatusPill status={l.serviceStatus} size="sm" />
                    </div>
                  </div>
                  <a
                    href={leadDetailHref(l.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-blue-90 bg-blue-10 hover:bg-blue-20 transition-colors"
                  >
                    View
                  </a>
                </div>
              ))}
              {leads.length === 0 && (
                <div className="px-5 py-10 text-center text-[13px] text-grey-40">No leads found for this selection.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

