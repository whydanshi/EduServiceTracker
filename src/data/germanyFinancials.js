import { leads } from './leads'

const costProfiles = {
  'LD-1001': { cogs: 150000, operatingCost: 22000 },
  'LD-1003': { cogs: 105000, operatingCost: 18000 },
  'LD-1005': { cogs: 195000, operatingCost: 30000 },
  'LD-1006': { cogs: 120000, operatingCost: 19000 },
  'LD-1007': { cogs: 108000, operatingCost: 16000 },
  'LD-1008': { cogs: 132000, operatingCost: 20000 },
  'LD-2010': { cogs: 126000, operatingCost: 18000 },
  'LD-3004': { cogs: 108000, operatingCost: 16000 },
  'LD-1011': { cogs: 168000, operatingCost: 25000 },
}

const paymentModeMap = {
  'Bank Transfer': 'Bank Transfer',
  'UPI': 'UPI',
  'Razorpay': 'Razorpay',
  'Credit Card': 'Credit Card',
  'NEFT': 'NEFT',
}

const accountByMode = {
  'Bank Transfer': 'indian-bank',
  'UPI': 'indian-bank',
  'Razorpay': 'razorpay',
  'Credit Card': 'indian-bank',
  'NEFT': 'indian-bank',
}

export function getGermanyFinancials(leadId) {
  const profile = costProfiles[leadId]
  if (!profile) return null
  const lead = leads.find(l => l.id === leadId)
  if (!lead) return null
  const revenue = lead.totalSaleValue || 0
  const totalCost = profile.cogs + profile.operatingCost
  const pnl = revenue - totalCost
  const margin = revenue > 0 ? (pnl / revenue) * 100 : 0
  return { revenue, cogs: profile.cogs, operatingCost: profile.operatingCost, totalCost, pnl, margin }
}

export function getAllGermanyFinancials() {
  return leads
    .filter(l => l.totalSaleValue && l.totalSaleValue > 0)
    .map(l => {
      const profile = costProfiles[l.id] || {
        cogs: Math.round(l.totalSaleValue * 0.58),
        operatingCost: Math.round(l.totalSaleValue * 0.1),
      }
      const revenue = l.totalSaleValue
      const totalCost = profile.cogs + profile.operatingCost
      const pnl = revenue - totalCost
      const margin = revenue > 0 ? (pnl / revenue) * 100 : 0
      return { leadId: l.id, studentName: l.studentName, revenue, cogs: profile.cogs, operatingCost: profile.operatingCost, totalCost, pnl, margin }
    })
}

export function getGermanyPaymentAccount(mode) {
  return accountByMode[mode] || 'indian-bank'
}

export function getGermanyPaymentMode(mode) {
  return paymentModeMap[mode] || mode
}

export function getGermanyLeadPayments(lead) {
  return (lead.payments || []).map(p => ({
    ...p,
    account: getGermanyPaymentAccount(p.mode),
    mode: getGermanyPaymentMode(p.mode),
    direction: 'incoming',
    product: 'Germany',
  }))
}
