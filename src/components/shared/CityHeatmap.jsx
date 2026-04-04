import { useEffect, useMemo, useRef, useState } from 'react'
import { geoMercator, geoPath } from 'd3-geo'
import { zoom, zoomIdentity } from 'd3-zoom'
import { select } from 'd3-selection'
import { feature, merge, mesh } from 'topojson-client'
import { ZoomIn, ZoomOut, RotateCcw, Search, X, ChevronDown, ChevronRight } from 'lucide-react'
import DateRangeSelect from './DateRangeSelect'
import LeadsTrendSparkline from './LeadsTrendSparkline'
import { parseDDMMYY, computePresetRange, isWithinRange } from '../../utils/date'
import { getCityCoord, normalizeCity, getCityState } from '../../utils/geoCities'
import indiaTopology from '../../assets/maps/india.topo.json'

function groupCount(items, key) {
  const m = new Map()
  for (const it of items) {
    const v = (it?.[key] ?? '—') || '—'
    m.set(v, (m.get(v) || 0) + 1)
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1])
}

function deriveRangeFromSelectValue(v) {
  if (!v || v === 'All Dates') return { preset: 'all' }
  if (v === 'Today') return computePresetRange('today')
  if (v === 'Last 7 Days') return computePresetRange('7')
  if (v === 'Last 30 Days') return computePresetRange('30')
  // Custom value is formatted by DateRangeSelect: "DD/MM/YY - DD/MM/YY"
  const parts = String(v).split(' - ')
  if (parts.length === 2) {
    const a = parseDDMMYY(parts[0])
    const b = parseDDMMYY(parts[1])
    if (a && b) return { preset: 'custom', start: a, end: b }
  }
  return { preset: 'all' }
}

function summarizeCity(leads, range) {
  const cityCounts = new Map()
  let unknown = 0
  for (const l of leads) {
    const d = parseDDMMYY(l.date)
    if (!d || !isWithinRange(d, range)) continue
    const key = normalizeCity(l.city)
    const coord = getCityCoord(key)
    if (!coord) {
      unknown += 1
      continue
    }
    cityCounts.set(key, (cityCounts.get(key) || 0) + 1)
  }
  const rows = [...cityCounts.entries()].sort((a, b) => b[1] - a[1])
  const total = rows.reduce((s, [, c]) => s + c, 0) + unknown

  const stateMap = new Map()
  for (const [cityKey, count] of rows) {
    const st = getCityState(cityKey)
    if (!stateMap.has(st)) stateMap.set(st, { total: 0, cities: [] })
    const entry = stateMap.get(st)
    entry.total += count
    entry.cities.push({ key: cityKey, count })
  }
  for (const val of stateMap.values()) {
    val.cities.sort((a, b) => b.count - a.count)
  }
  const stateRows = [...stateMap.entries()]
    .map(([name, data]) => ({ name, total: data.total, cities: data.cities }))
    .sort((a, b) => b.total - a.total)

  return { rows, total, stateRows }
}

// Discrete heat colours (image 1): high = purple, low = yellow
const HEAT_STOPS = ['#8900D3', '#A433A4', '#B55386', '#C5706B', '#D6924B', '#E6B02F', '#FFE100']
const HEAT_LOW = HEAT_STOPS[HEAT_STOPS.length - 1]

function getHeatColor(count, maxCount) {
  if (maxCount <= 0) return HEAT_LOW
  const t = count / maxCount // 1 = high, 0 = low
  const n = HEAT_STOPS.length
  const idx = Math.min(n - 1, Math.floor((1 - t) * n))
  return HEAT_STOPS[idx]
}

const STATE_NO_LEADS_FILL = '#F1F5F9'

function getStateFill(stateLeadCount, maxStateLeads) {
  if (!stateLeadCount || stateLeadCount <= 0) return STATE_NO_LEADS_FILL
  const color = getHeatColor(stateLeadCount, maxStateLeads)
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  const opacity = 0.12 + (stateLeadCount / maxStateLeads) * 0.1
  const mix = (c) => Math.round(255 * (1 - opacity) + c * opacity)
  return `rgb(${mix(r)},${mix(g)},${mix(b)})`
}

export default function CityHeatmap({
  leads,
  role = 'sales',
  title = 'Leads by City',
  dateSelect: dateSelectProp,
  onDateSelectChange,
  hideDateSelect = false,
  variant,
}) {
  const isAdminDedup = variant === 'adminDedup'
  const [dateSelectInternal, setDateSelectInternal] = useState('All Dates')
  const dateSelect = dateSelectProp ?? dateSelectInternal
  const setDateSelect = onDateSelectChange ?? setDateSelectInternal
  const range = useMemo(() => deriveRangeFromSelectValue(dateSelect), [dateSelect])

  const { rows, total, stateRows } = useMemo(() => summarizeCity(leads, range), [leads, range])
  const maxCount = rows.length ? rows[0][1] : 0
  const uniqueCities = rows.length

  const [selectedState, setSelectedState] = useState(null)
  const selectedStateLabel = selectedState || null
  const selectedStateLeads = useMemo(() => {
    if (!selectedState) return []
    return leads.filter(l => {
      const d = parseDDMMYY(l.date)
      if (!d || !isWithinRange(d, range)) return false
      return String(l.state || '').trim() === selectedState
    })
  }, [leads, range, selectedState])

  const selectedStateServiceable = useMemo(() => {
    return selectedStateLeads.filter(l => String(l.serviceStatus || '').trim() === 'Serviceable').length
  }, [selectedStateLeads])

  const selectedStateTopSource = useMemo(() => {
    if (!selectedStateLeads.length) return { label: '—', count: 0, pct: 0 }
    const m = new Map()
    for (const l of selectedStateLeads) {
      const src = String(l.source || '—').trim() || '—'
      m.set(src, (m.get(src) || 0) + 1)
    }
    let best = { label: '—', count: 0 }
    for (const [label, count] of m.entries()) {
      if (count > best.count) best = { label, count }
    }
    return { ...best, pct: (best.count / selectedStateLeads.length) * 100 }
  }, [selectedStateLeads])

  const selectedStateServiceabilityRate = useMemo(() => {
    if (!selectedStateLeads.length) return 0
    return (selectedStateServiceable / selectedStateLeads.length) * 100
  }, [selectedStateLeads.length, selectedStateServiceable])

  const selectedStateCityRows = useMemo(() => {
    const m = new Map()
    for (const l of selectedStateLeads) {
      const key = normalizeCity(l.city)
      if (!key) continue
      m.set(key, (m.get(key) || 0) + 1)
    }
    const toLabel = (k) => k.split(' ').map(w => w[0]?.toUpperCase() + w.slice(1)).join(' ')
    return [...m.entries()]
      .map(([k, c]) => ({ key: k, label: toLabel(k), count: c }))
      .sort((a, b) => b.count - a.count)
  }, [selectedStateLeads])

  const topoRef = useRef(null)
  const [geo, setGeo] = useState(null)
  const [world, setWorld] = useState(null)

  const svgRef = useRef(null)
  const gRef = useRef(null)
  const [zoomK, setZoomK] = useState(1)

  useEffect(() => {
    let alive = true
    // India map: use bundled topology so it works in production (fetch('/src/...') 404s after build)
    const topology = indiaTopology
    topoRef.current = topology
    const dist = topology?.objects?.districts
    if (dist?.geometries) {
      const byState = new Map()
      for (const g of dist.geometries) {
        const name = g.properties?.st_nm || 'Other'
        if (!byState.has(name)) byState.set(name, [])
        byState.get(name).push(g)
      }
      const stateFeatures = []
      for (const [stateName, geoms] of byState) {
        try {
          const merged = merge(topology, geoms)
          if (merged) stateFeatures.push({ feature: merged, name: stateName })
        } catch (_) {}
      }
      let stateMesh = null
      try {
        stateMesh = mesh(topology, dist, (a, b) => {
          const sa = a?.properties?.st_nm
          const sb = b?.properties?.st_nm
          return sa && sb && sa !== sb
        })
      } catch (_) {}
      if (alive) setGeo({ stateFeatures, stateMesh })
    }
    // World map: load from CDN (optional, for context when zoomed out)
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((r) => r.json())
      .then((worldTopo) => {
        if (!alive) return
        if (worldTopo?.objects?.countries) {
          try {
            setWorld(feature(worldTopo, worldTopo.objects.countries))
          } catch {
            setWorld(null)
          }
        }
      })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  const width = 680
  const height = 420
  const oceanBlue = '#BAE6FD'

  const projection = useMemo(() => {
    // India + a bit of surrounding area (slightly lower scale), ocean visible
    return geoMercator().center([82.5, 22.0]).scale(720).translate([width / 2, height / 2])
  }, [])

  const path = useMemo(() => geoPath(projection), [projection])

  useEffect(() => {
    if (!svgRef.current || !gRef.current) return
    const svg = select(svgRef.current)
    const g = select(gRef.current)
    const z = zoom()
      .scaleExtent([1, 6])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
        setZoomK(event.transform.k)
      })
    svg.call(z)
    // Initial reset
    svg.call(z.transform, zoomIdentity)
    return () => {
      svg.on('.zoom', null)
    }
  }, [])

  const onZoomIn = () => {
    if (!svgRef.current) return
    const svg = select(svgRef.current)
    svg.transition().duration(200).call(zoom().scaleBy, 1.25)
  }
  const onZoomOut = () => {
    if (!svgRef.current) return
    const svg = select(svgRef.current)
    svg.transition().duration(200).call(zoom().scaleBy, 0.8)
  }
  const onReset = () => {
    if (!svgRef.current) return
    const svg = select(svgRef.current)
    svg.transition().duration(200).call(zoom().transform, zoomIdentity)
  }

  const [citySearch, setCitySearch] = useState('')
  const [expandedStates, setExpandedStates] = useState(new Set())

  useEffect(() => {
    setExpandedStates(new Set(stateRows.slice(0, 3).map(s => s.name)))
  }, [stateRows.length])

  const toggleState = (name) => {
    setExpandedStates(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name); else next.add(name)
      return next
    })
  }

  const filteredStateRows = useMemo(() => {
    const q = (citySearch || '').trim().toLowerCase()
    if (!q) return stateRows
    return stateRows
      .map(s => ({
        ...s,
        cities: s.cities.filter(c => {
          const label = c.key.split(' ').map(w => w[0]?.toUpperCase() + w.slice(1)).join(' ')
          return label.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
        }),
      }))
      .filter(s => s.cities.length > 0)
  }, [stateRows, citySearch])

  const mapSectionHeight = 468

  const stateLeadMap = useMemo(() => {
    const m = new Map()
    for (const s of stateRows) m.set(s.name, s.total)
    return m
  }, [stateRows])
  const maxStateLeads = stateRows.length ? stateRows[0].total : 0

  const selectedStateTotal = selectedState ? (stateLeadMap.get(selectedState) || 0) : 0
  const selectedStateColor = selectedState && maxStateLeads > 0 ? getHeatColor(selectedStateTotal, maxStateLeads) : null

  return (
    <div>
      <div className="bg-white rounded-xl border border-grey-20 overflow-hidden">
        <div className="px-6 py-3.5 border-b border-grey-20 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-grey-50 tracking-[0.16em] uppercase mb-0.5">Leads by City</p>
            <p className="text-[12px] text-grey-60">Track where new leads are coming from</p>
          </div>
          {!hideDateSelect && (
            <div className="w-[220px]">
              <DateRangeSelect value={dateSelect} onChange={setDateSelect} />
            </div>
          )}
        </div>

        <div className={selectedState ? 'grid grid-cols-[240px_1fr_300px]' : 'grid grid-cols-[240px_1fr]'} style={{ minHeight: mapSectionHeight }}>
          {/* Left: States + top 5 cities per state */}
          <div className="border-r border-grey-20 bg-white flex flex-col" style={{ height: mapSectionHeight }}>
            <div className="px-4 py-3 border-b border-grey-20 flex-shrink-0">
              <p className="text-[11px] font-semibold text-grey-40 uppercase tracking-wider mb-2">States & Cities</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-grey-40" />
                <input
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  placeholder="Search state or city..."
                  className="w-full border border-grey-20 rounded-lg pl-9 pr-3 py-2 text-[13px] text-grey-70 placeholder:text-grey-40 outline-none focus:border-blue-90 bg-white"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
              {filteredStateRows.map((st) => {
                const isExpanded = expandedStates.has(st.name)
                const top5 = st.cities.slice(0, 5)
                const remaining = st.cities.length - 5
                const isSelectedState = selectedState === st.name
                const stateFill = getStateFill(st.total, maxStateLeads)
                return (
                  <div key={st.name}>
                    <button
                      type="button"
                      onClick={() => setSelectedState((prev) => (prev === st.name ? null : st.name))}
                      className={`w-full flex items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors group ${
                        isSelectedState ? 'bg-blue-10 border border-blue-30' : 'hover:bg-grey-5 border border-transparent'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleState(st.name) }}
                        className="p-0.5 rounded hover:bg-white/60"
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        title={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded
                          ? <ChevronDown className="w-3.5 h-3.5 text-grey-40" />
                          : <ChevronRight className="w-3.5 h-3.5 text-grey-40" />
                        }
                      </button>
                      <span className="w-3 h-3 rounded-[4px] border border-grey-20 flex-shrink-0" style={{ backgroundColor: stateFill }} />
                      <span className="text-[12px] font-semibold text-grey-80 truncate flex-1">{st.name}</span>
                      {!isAdminDedup && (
                        <span className="text-[11px] font-semibold text-grey-50 bg-grey-10 rounded-full px-2 py-0.5">{st.total}</span>
                      )}
                    </button>
                    {isExpanded && (
                      <div className="ml-5 space-y-0.5 mb-1">
                        {top5.map((c) => {
                          const label = c.key.split(' ').map(w => w[0]?.toUpperCase() + w.slice(1)).join(' ')
                          return (
                            <div
                              key={c.key}
                              className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left border border-transparent"
                            >
                              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-grey-30" />
                              <span className="text-[12px] font-medium text-grey-90 truncate flex-1">{label}</span>
                              {!isAdminDedup && <span className="text-[11px] font-semibold text-grey-60">{c.count}</span>}
                            </div>
                          )
                        })}
                        {remaining > 0 && (
                          <p className="text-[11px] text-grey-40 pl-5 py-1">
                            {isAdminDedup ? 'More cities…' : `+${remaining} more cit${remaining === 1 ? 'y' : 'ies'}`}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
              {filteredStateRows.length === 0 && (
                <div className="text-[13px] text-grey-40 py-6 text-center border border-dashed border-grey-20 rounded-lg">No matching results.</div>
              )}
            </div>
            {!isAdminDedup && (
              <div className="px-4 py-2 border-t border-grey-10 text-[11px] text-grey-40 flex-shrink-0">
                {total} leads · {stateRows.length} states · {uniqueCities} cities
              </div>
            )}
          </div>

          {/* Center: Map fullscreen in section (no padding) */}
          <div className="flex flex-col flex-1 min-h-0" style={{ height: mapSectionHeight }}>
            <div className="overflow-hidden relative w-full h-full flex-1 min-h-0">
              <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="block w-full h-full object-cover">
                <defs>
                  <linearGradient id="heatKeyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    {HEAT_STOPS.map((c, i) => (
                      <stop key={c} offset={`${(i / (HEAT_STOPS.length - 1)) * 100}%`} stopColor={c} />
                    ))}
                  </linearGradient>
                </defs>
                <g ref={gRef}>
                  <rect x={-width * 2} y={-height * 2} width={width * 5} height={height * 5} fill={oceanBlue} />
                  {/* World countries (context when zoomed out) */}
                  {world?.features?.map((f, i) => (
                    <path key={`w-${i}`} d={path(f)} fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="0.5" />
                  ))}
                  {/* India: state fills tinted by lead volume */}
                  {geo?.stateFeatures?.map((s, i) => {
                    const stLeads = stateLeadMap.get(s.name) || 0
                    const fill = getStateFill(stLeads, maxStateLeads)
                    return (
                      <path key={`s-${i}`} d={path(s.feature)} fill={fill} stroke="none" />
                    )
                  })}
                  {geo?.stateMesh && (
                    <path d={path(geo.stateMesh)} fill="none" stroke="#94A3B8" strokeWidth="0.8" />
                  )}

                  {/* State labels */}
                  {geo?.stateFeatures?.map((s, i) => {
                    const c = path.centroid(s.feature)
                    if (c.some(isNaN)) return null
                    return (
                      <text
                        key={`label-${i}`}
                        x={c[0]}
                        y={c[1]}
                        dy={3}
                        textAnchor="middle"
                        className="fill-grey-60 text-[9px] font-medium pointer-events-none"
                      >
                        {s.name || ''}
                      </text>
                    )
                  })}
                </g>
              </svg>
              {/* Zoom: vertical on the right, above the key */}
              <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
                <div className="flex flex-col gap-1 bg-white/95 border border-grey-20 rounded-lg shadow-sm p-1.5">
                  <button onClick={onZoomIn} className="p-1.5 rounded border border-grey-20 hover:bg-grey-5" title="Zoom in">
                    <ZoomIn className="w-3.5 h-3.5 text-grey-60" />
                  </button>
                  <button onClick={onZoomOut} className="p-1.5 rounded border border-grey-20 hover:bg-grey-5" title="Zoom out">
                    <ZoomOut className="w-3.5 h-3.5 text-grey-60" />
                  </button>
                  <button onClick={onReset} className="p-1.5 rounded border border-grey-20 hover:bg-grey-5" title="Reset view">
                    <RotateCcw className="w-3.5 h-3.5 text-grey-60" />
                  </button>
                </div>
                <span className="text-[11px] text-grey-60 font-medium">Zoom {Math.round(zoomK * 100)}%</span>
                {/* Key: 7 discrete colours only */}
                <div className="bg-white/95 border border-grey-20 rounded-lg shadow-sm px-4 py-3 mt-1">
                  <p className="text-[10px] font-semibold text-grey-40 uppercase tracking-wider mb-2">Key</p>
                  <div className="flex w-28 rounded overflow-hidden border border-grey-20 mb-1">
                    {HEAT_STOPS.map((c) => (
                      <div key={c} className="flex-1 h-2.5" style={{ backgroundColor: c }} title={c} />
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-grey-50">
                    <span>High</span>
                    <span>Low</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Details (only when a city is selected) */}
          {selectedState && (
            <div className="border-l border-grey-20 bg-grey-5/30 flex flex-col overflow-hidden" style={{ height: mapSectionHeight }}>
              <div className="px-4 py-3 border-b border-grey-20 bg-white flex items-center justify-between flex-shrink-0 gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Details</p>
                  <h4 className="text-[14px] font-semibold text-grey-95 truncate">{selectedStateLabel}</h4>
                  <p className="text-[12px] text-grey-60 mt-0.5">State snapshot for selected range</p>
                </div>
                <button type="button" onClick={() => setSelectedState(null)} className="p-1.5 rounded-md hover:bg-grey-10 text-grey-50 hover:text-grey-90 flex-shrink-0" title="Close"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white rounded-lg border border-grey-20 p-3">
                    <p className="text-[10px] font-semibold text-grey-40 uppercase tracking-wider mb-1.5">Total new leads</p>
                    <p className="text-[18px] font-semibold text-grey-95 leading-none">{selectedStateLeads.length}</p>
                  </div>
                  <div className="bg-white rounded-lg border border-grey-20 p-3">
                    <p className="text-[10px] font-semibold text-grey-40 uppercase tracking-wider mb-1.5">Serviceable leads</p>
                    <p className="text-[18px] font-semibold text-grey-95 leading-none">{selectedStateServiceable}</p>
                  </div>
                  <div className="bg-white rounded-lg border border-grey-20 p-3">
                    <p className="text-[10px] font-semibold text-grey-40 uppercase tracking-wider mb-1.5">Top source</p>
                    <p className="text-[14px] font-semibold text-grey-95 leading-tight truncate">{selectedStateTopSource.label}</p>
                    <p className="text-[11px] text-grey-60 mt-0.5">{Math.round(selectedStateTopSource.pct)}% · {selectedStateTopSource.count}/{selectedStateLeads.length}</p>
                  </div>
                  <div className="bg-white rounded-lg border border-grey-20 p-3">
                    <p className="text-[10px] font-semibold text-grey-40 uppercase tracking-wider mb-1.5">Serviceability rate</p>
                    <p className="text-[18px] font-semibold text-grey-95 leading-none">{Math.round(selectedStateServiceabilityRate)}%</p>
                    <p className="text-[11px] text-grey-60 mt-0.5">{selectedStateServiceable}/{selectedStateLeads.length} serviceable</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[10px] font-semibold text-grey-40 uppercase tracking-wider">New leads by city</p>
                  </div>
                  <div className="h-px bg-grey-20 my-2" />
                  <div className="max-h-64 overflow-y-auto divide-y divide-grey-10 bg-white rounded-lg">
                    {selectedStateCityRows.map((c) => (
                      <div key={c.key} className="px-2 py-2.5 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-grey-30 flex-shrink-0" />
                          <span className="text-[12px] font-medium text-grey-90 truncate">{c.label}</span>
                        </div>
                        <span className="text-[12px] font-semibold text-grey-80">{c.count}</span>
                      </div>
                    ))}
                    {selectedStateCityRows.length === 0 && (
                      <div className="px-3 py-6 text-center text-[12px] text-grey-40">No city data in this range.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {!isAdminDedup && (
          <div className="border-t border-grey-20">
            <LeadsTrendSparkline leads={leads} range={range} selectedState={selectedStateLabel} selectedStateColor={selectedStateColor} />
          </div>
        )}
      </div>

    </div>
  )
}

