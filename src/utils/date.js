export function parseDDMMYY(s) {
  // expects DD/MM/YY
  const [dd, mm, yy] = (s || '').split('/').map(Number)
  if (!dd || !mm || yy === undefined) return null
  const fullYear = 2000 + yy
  const d = new Date(fullYear, mm - 1, dd)
  return isNaN(d.getTime()) ? null : d
}

export function toISODate(d) {
  if (!(d instanceof Date) || isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}

export function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function endOfDay(d) {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

export function isWithinRange(date, range) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return false
  if (!range || range.preset === 'all') return true
  const t = date.getTime()
  const s = range.start ? startOfDay(range.start).getTime() : null
  const e = range.end ? endOfDay(range.end).getTime() : null
  if (s != null && t < s) return false
  if (e != null && t > e) return false
  return true
}

export function computePresetRange(preset, now = new Date()) {
  const today = startOfDay(now)
  if (preset === 'today') return { preset: 'today', start: today, end: today }
  if (preset === '7') {
    const start = new Date(today)
    start.setDate(start.getDate() - 6)
    return { preset: '7', start, end: today }
  }
  if (preset === '30') {
    const start = new Date(today)
    start.setDate(start.getDate() - 29)
    return { preset: '30', start, end: today }
  }
  return { preset: 'all' }
}

