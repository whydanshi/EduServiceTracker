import { useMemo, useState, useCallback } from 'react'
import { parseDDMMYY, isWithinRange, toISODate } from '../../utils/date'

function bucketByDay(leads, range, opts) {
  const m = new Map()
  for (const l of leads) {
    if (opts?.state && String(l.state || '').trim() !== opts.state) continue
    const d = parseDDMMYY(l.date)
    if (!d) continue
    if (!isWithinRange(d, range)) continue
    const k = toISODate(d)
    if (!k) continue
    m.set(k, (m.get(k) || 0) + 1)
  }
  return m
}

function dateRangeDays(range, leads) {
  const dates = leads.map(l => parseDDMMYY(l.date)).filter(Boolean)
  if (dates.length === 0) return []
  const minD = range?.start || new Date(Math.min(...dates.map(d => d.getTime())))
  const maxD = range?.end || new Date(Math.max(...dates.map(d => d.getTime())))
  const start = new Date(minD); start.setHours(0, 0, 0, 0)
  const end = new Date(maxD); end.setHours(0, 0, 0, 0)
  const out = []
  const cur = new Date(start)
  while (cur.getTime() <= end.getTime()) {
    out.push(toISODate(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return out.filter(Boolean)
}

const CHART_LEFT = 40
const CHART_TOP = 20
const CHART_RIGHT = 16
const CHART_BOTTOM = 24
const POINT_R = 6

function buildTicks(maxVal, targetTickCount = 5) {
  if (maxVal <= 0) return [0, 1]
  const step = Math.max(1, Math.ceil(maxVal / (targetTickCount - 1)))
  const ticks = []
  for (let v = 0; v <= maxVal; v += step) ticks.push(v)
  if (ticks[ticks.length - 1] !== maxVal) ticks.push(maxVal)
  return ticks
}

export default function LeadsTrendSparkline({ leads, range, selectedState, selectedStateColor }) {
  const [hovered, setHovered] = useState(null) // { index, x, y }

  const days = useMemo(() => dateRangeDays(range, leads), [range, leads])
  const overall = useMemo(() => bucketByDay(leads, range), [leads, range])
  const state = useMemo(() => (selectedState ? bucketByDay(leads, range, { state: selectedState }) : null), [leads, range, selectedState])

  const overallVals = days.map(d => overall.get(d) || 0)
  const stateVals = state ? days.map(d => state.get(d) || 0) : []

  const totalOverall = overallVals.reduce((s, x) => s + x, 0)
  const totalState = stateVals.reduce((s, x) => s + x, 0)
  const maxOverall = overallVals.length ? Math.max(...overallVals) : 0
  const maxState = stateVals.length ? Math.max(...stateVals) : 0
  const maxVal = Math.max(maxOverall, maxState, 1)

  const showState = !!selectedState

  const chartW = 560 - CHART_LEFT - CHART_RIGHT
  const chartH = 120 - CHART_TOP - CHART_BOTTOM
  const n = days.length

  const toX = useCallback((i) => CHART_LEFT + (n <= 1 ? 0 : (i / (n - 1)) * chartW), [n, chartW])
  const toY = useCallback((v) => CHART_TOP + (1 - v / maxVal) * chartH, [maxVal, chartH])

  const pathOverall = useMemo(() => {
    if (overallVals.length === 0) return ''
    return overallVals.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(v)}`).join(' ')
  }, [overallVals, toX, toY])

  const pathCity = useMemo(() => {
    if (!stateVals.length) return ''
    return stateVals.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(v)}`).join(' ')
  }, [stateVals, toX, toY])

  const yTicks = useMemo(() => {
    return buildTicks(maxVal, 5)
  }, [maxVal])

  const formatDate = (iso) => {
    if (!iso) return '—'
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y?.slice(2) || ''}`
  }

  return (
    <div className="overflow-hidden">
      <div className="px-6 pt-3 pb-1">
        <p className="text-[11px] font-semibold text-grey-50 tracking-[0.16em] uppercase mb-0.5">Lead trend</p>
        <p className="text-[12px] text-grey-60">
          {showState ? `${selectedState} vs overall` : 'Leads per day in selected date range · Select a state from the list to compare'}
        </p>
      </div>
      <div className="px-6 py-4 flex flex-col sm:flex-row gap-4 items-start">
        <div className="w-full overflow-x-auto min-w-0 relative">
          <svg width={560} height={120} viewBox="0 0 560 120" className="block" style={{ minWidth: 320 }}>
            {/* Y-axis scale */}
            <line x1={CHART_LEFT} y1={CHART_TOP} x2={CHART_LEFT} y2={120 - CHART_BOTTOM} stroke="#D1D5DB" strokeWidth="1" />
            {yTicks.map((v) => (
              <g key={v}>
                <line x1={CHART_LEFT} y1={toY(v)} x2={CHART_LEFT - 4} y2={toY(v)} stroke="#94A3B8" strokeWidth="1" />
                <text x={CHART_LEFT - 6} y={toY(v)} textAnchor="end" dominantBaseline="middle" className="fill-grey-60 text-[10px] font-medium">
                  {v}
                </text>
              </g>
            ))}

            {/* Paths */}
            <path d={pathOverall} fill="none" stroke="#003675" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {showState && pathCity && (
              <path d={pathCity} fill="none" stroke={selectedStateColor || '#B45309'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 3" />
            )}

            {/* Points: value above line + invisible hit area for hover */}
            {overallVals.map((v, i) => {
              const x = toX(i)
              const y = toY(v)
              const isHover = hovered?.index === i
              return (
                <g key={`overall-${i}`}>
                  {v > 0 && (
                    <text x={x} y={y - 6} textAnchor="middle" className="fill-grey-70 text-[10px] font-semibold">
                      {v}
                    </text>
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={POINT_R}
                    fill="transparent"
                    onMouseEnter={() => setHovered({ index: i, x, y, overall: v, state: stateVals[i], date: days[i] })}
                    onMouseLeave={() => setHovered(null)}
                    style={{ cursor: 'pointer' }}
                  />
                  {isHover && <circle cx={x} cy={y} r={4} fill="#003675" stroke="#fff" strokeWidth="1.5" />}
                </g>
              )
            })}
            {showState && stateVals.map((v, i) => {
              const x = toX(i)
              const y = toY(v)
              const isHover = hovered?.index === i
              return (
                <g key={`city-${i}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r={POINT_R}
                    fill="transparent"
                    onMouseEnter={() => setHovered({ index: i, x, y, overall: overallVals[i], state: v, date: days[i] })}
                    onMouseLeave={() => setHovered(null)}
                    style={{ cursor: 'pointer' }}
                  />
                  {isHover && <circle cx={x} cy={y} r={4} fill={selectedStateColor || '#B45309'} stroke="#fff" strokeWidth="1.5" />}
                </g>
              )
            })}
          </svg>

          {/* Hover tooltip */}
          {hovered != null && (
            <div
              className="absolute bg-grey-95 text-white text-[11px] rounded-lg shadow-lg px-2.5 py-2 pointer-events-none z-10"
              style={{
                left: Math.min(hovered.x + 8, 560 - 140),
                top: Math.max(hovered.y - 44, 4),
              }}
            >
              <div className="font-semibold text-white/95">{formatDate(hovered.date)}</div>
              <div>Overall: {hovered.overall ?? 0} lead{(hovered.overall ?? 0) !== 1 ? 's' : ''}</div>
              {showState && <div style={{ color: selectedStateColor || '#E6B02F' }}>{selectedState}: {hovered.state ?? 0} lead{(hovered.state ?? 0) !== 1 ? 's' : ''}</div>}
            </div>
          )}

          <div className="flex gap-4 mt-1 text-[11px] text-grey-50">
            <span>{days[0] ? formatDate(days[0]) : '—'} to {days[days.length - 1] ? formatDate(days[days.length - 1]) : '—'}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0 border-l border-grey-20 pl-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 rounded bg-[#003675]" />
            <span className="text-[12px] font-medium text-grey-80">Overall</span>
          </div>
          <p className="text-[11px] text-grey-60">
            {totalOverall} lead{totalOverall !== 1 ? 's' : ''} total · max {maxOverall}/day
          </p>
          {showState && (
            <>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-3 h-0.5 rounded" style={{ backgroundColor: selectedStateColor || '#B45309', border: '1px dashed ' + (selectedStateColor || '#B45309') }} />
                <span className="text-[12px] font-medium text-grey-80">{selectedState}</span>
              </div>
              <p className="text-[11px] text-grey-60">
                {totalState} lead{totalState !== 1 ? 's' : ''} total · max {maxState}/day
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
