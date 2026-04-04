const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY
const MONTH = 30 * DAY

export function relativeTime(dateInput) {
  if (!dateInput) return '-'
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
  if (isNaN(date.getTime())) return String(dateInput)

  const now = Date.now()
  const diff = now - date.getTime()

  if (diff < 0) return 'Just now'
  if (diff < MINUTE) return 'Just now'
  if (diff < HOUR) {
    const mins = Math.floor(diff / MINUTE)
    return `${mins}m ago`
  }
  if (diff < DAY) {
    const hrs = Math.floor(diff / HOUR)
    return `${hrs}h ago`
  }
  if (diff < 2 * DAY) return 'Yesterday'
  if (diff < WEEK) {
    const days = Math.floor(diff / DAY)
    return `${days}d ago`
  }
  if (diff < MONTH) {
    const weeks = Math.floor(diff / WEEK)
    return `${weeks}w ago`
  }
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function fullDate(dateInput) {
  if (!dateInput) return ''
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
  if (isNaN(date.getTime())) return String(dateInput)
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
