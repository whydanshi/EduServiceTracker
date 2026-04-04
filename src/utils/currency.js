import { getGBPRate, convertToINR as convertFromData } from '../data/currencyRates'

export { getGBPRate, convertFromData as convertToINR }

export function formatINR(amount) {
  if (amount == null || isNaN(amount)) return '—'
  return `₹${Number(amount).toLocaleString('en-IN')}`
}

export function formatGBP(amount) {
  if (amount == null || isNaN(amount)) return '—'
  return `£${Number(amount).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function formatCurrency(amount, currency = 'INR') {
  if (currency === 'GBP') return formatGBP(amount)
  return formatINR(amount)
}
