import { CANONICAL_INTAKES } from '../../utils/dashboardData'

const GEO_OPTIONS = [
  { value: 'all', label: 'Global' },
  { value: 'germany', label: 'Germany' },
  { value: 'e2e', label: 'E2E (UK)' },
]

const INTAKE_OPTIONS = [{ value: 'all', label: 'All Intakes' }, ...CANONICAL_INTAKES.map(v => ({ value: v, label: v }))]

const MONTH_OPTIONS = [
  { value: 'all', label: 'All Months' },
  { value: 'Dec 2025', label: 'Dec 2025' },
  { value: 'Jan 2026', label: 'Jan 2026' },
  { value: 'Feb 2026', label: 'Feb 2026' },
  { value: 'Mar 2026', label: 'Mar 2026' },
]

export default function DashboardFilters({ filters, onChange, countries = ['all'], activeTab }) {
  const showGeo = countries.length > 1

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {showGeo && (
        <div className="flex items-center gap-0.5 bg-grey-5 rounded-lg p-0.5">
          {GEO_OPTIONS.map(geo => (
            <button
              key={geo.value}
              onClick={() => onChange({ ...filters, country: geo.value })}
              className={`px-3 py-1 text-[11px] font-medium rounded-md transition-colors ${
                filters.country === geo.value
                  ? 'bg-white text-grey-95 shadow-sm'
                  : 'text-grey-50 hover:text-grey-70'
              }`}
            >
              {geo.label}
            </button>
          ))}
        </div>
      )}

      <select
        value={filters.intake}
        onChange={e => onChange({ ...filters, intake: e.target.value })}
        className="text-[12px] border border-grey-20 rounded-lg px-2.5 py-1.5 bg-white text-grey-80 focus:outline-none focus:ring-1 focus:ring-blue-30"
      >
        {INTAKE_OPTIONS.map(i => (
          <option key={i.value} value={i.value}>{i.label}</option>
        ))}
      </select>

      {activeTab === 'financials' && (
        <select
          value={filters.month}
          onChange={e => onChange({ ...filters, month: e.target.value })}
          className="text-[12px] border border-grey-20 rounded-lg px-2.5 py-1.5 bg-white text-grey-80 focus:outline-none focus:ring-1 focus:ring-blue-30"
        >
          {MONTH_OPTIONS.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      )}
    </div>
  )
}
