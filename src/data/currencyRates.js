export const DEFAULT_GBP_INR = 124.21

let cachedRate = DEFAULT_GBP_INR
let lastFetched = 0
const CACHE_TTL = 5 * 60 * 1000

export async function fetchGBPRate() {
  const now = Date.now()
  if (now - lastFetched < CACHE_TTL && cachedRate) return cachedRate

  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/GBP')
    if (res.ok) {
      const data = await res.json()
      cachedRate = data.rates?.INR ?? DEFAULT_GBP_INR
      lastFetched = now
    }
  } catch {
    // fallback to default
  }
  return cachedRate
}

export function getGBPRate() {
  return cachedRate
}

export function convertGBPtoINR(amountGBP, rate = cachedRate) {
  return Math.round(amountGBP * rate * 100) / 100
}

export function convertToINR(amount, currency, rate = cachedRate) {
  if (!amount) return 0
  if (currency === 'INR') return amount
  if (currency === 'GBP') return convertGBPtoINR(amount, rate)
  return amount
}
