import { leads } from '../data/leads'
import { students as germanyStudentsData } from '../data/students'
import { e2eStudents } from '../data/e2eStudents'
import { users } from '../data/users'
import { calculateStudentPnL, calculateLoanSubvention } from './pnlCalculator'
import { e2eServices, e2ePackages } from '../data/e2ePackages'
import { getAllGermanyFinancials } from '../data/germanyFinancials'

/** Only these intake labels appear in the dashboard matrix, filters, and charts. */
export const CANONICAL_INTAKES = [
  'Summer 2026', 'Winter 2026', 'Summer 2027', 'Winter 2027', 'Summer 2028', 'Winter 2028',
]

const CANONICAL_SET = new Set(CANONICAL_INTAKES)
/** Unmapped or out-of-range raw intake values roll up here. */
export const INTAKE_OTHER = 'Other'

/** Apr–Sep → Summer YYYY; Oct–Dec → Winter (Y+1); Jan–Mar → Winter YYYY */
function monthYearToCanonical(month, year) {
  if (!month || month < 1 || month > 12 || year == null || Number.isNaN(year)) return null
  let season
  let y
  if (month >= 4 && month <= 9) {
    season = 'Summer'
    y = year
  } else if (month >= 10) {
    season = 'Winter'
    y = year + 1
  } else {
    season = 'Winter'
    y = year
  }
  const label = `${season} ${y}`
  return CANONICAL_SET.has(label) ? label : null
}

const MONTH_ABBR = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
}

function normalizeIntakeFromString(raw) {
  if (raw == null) return null
  const t = String(raw).trim()
  if (!t) return null

  for (const c of CANONICAL_INTAKES) {
    if (c.toLowerCase() === t.toLowerCase()) return c
  }

  const mSeason = t.match(/^(summer|winter)\s+(\d{4})$/i)
  if (mSeason) {
    const season = mSeason[1][0].toUpperCase() + mSeason[1].slice(1).toLowerCase()
    const label = `${season} ${mSeason[2]}`
    return CANONICAL_SET.has(label) ? label : null
  }

  const mWord = t.match(/^([a-z]+)\s+(\d{4})$/i)
  if (mWord) {
    const abbr = mWord[1].toLowerCase().slice(0, 3)
    const mon = MONTH_ABBR[abbr]
    if (mon) return monthYearToCanonical(mon, parseInt(mWord[2], 10))
  }

  const mNum = t.match(/^(\d{1,2})\/(\d{4})$/)
  if (mNum) {
    return monthYearToCanonical(parseInt(mNum[1], 10), parseInt(mNum[2], 10))
  }

  return null
}

export function getCanonicalIntakeForGermanyLead(lead) {
  const fromStored = normalizeIntakeFromString(lead.yearOfIntake)
  if (fromStored) return fromStored
  if (lead.preferredIntakeSeason && lead.intakeYear) {
    const se = String(lead.preferredIntakeSeason).trim()
    const capitalized = se.charAt(0).toUpperCase() + se.slice(1).toLowerCase()
    if (capitalized !== 'Summer' && capitalized !== 'Winter') return null
    const label = `${capitalized} ${String(lead.intakeYear).trim()}`
    return CANONICAL_SET.has(label) ? label : null
  }
  return null
}

export function getCanonicalIntakeForE2EStudent(student) {
  return normalizeIntakeFromString(student?.intake)
}

function getUserByRole(role) {
  const roleUserMap = {
    superadmin: 'usr-sa-001',
    admin_germany: 'usr-ad-001',
    admin_e2e: 'usr-ad-002',
    service_germany: 'usr-sv-001',
    service_e2e: 'usr-sv-002',
    sales: 'usr-sl-001',
  }
  return users.find(u => u.id === roleUserMap[role])
}

export function scopeDataByRole(role) {
  const user = getUserByRole(role)
  let scopedGermanyLeads = []
  let scopedGermanyStudents = []
  let scopedE2EStudents = []

  const hasGermany = role === 'superadmin' || role === 'admin_germany' || role === 'service_germany' || role === 'sales'
  const hasE2E = role === 'superadmin' || role === 'admin_e2e' || role === 'service_e2e'

  if (hasGermany) {
    scopedGermanyLeads = leads
    scopedGermanyStudents = germanyStudentsData
    if (role === 'service_germany' && user) {
      scopedGermanyLeads = leads.filter(l => l.servicePOC === user.name || l.assignedToService === user.name)
      scopedGermanyStudents = germanyStudentsData.filter(s => s.servicePOC === user.name)
    }
    if (role === 'sales' && user) {
      scopedGermanyLeads = leads.filter(l => l.salesPOC === user.name || l.assignedToSales === user.name)
      scopedGermanyStudents = germanyStudentsData.filter(s => s.salesPOC === user.name)
    }
  }

  if (hasE2E) {
    scopedE2EStudents = e2eStudents
    if (role === 'service_e2e' && user) {
      scopedE2EStudents = e2eStudents.filter(s => s.servicePOC === user.name)
    }
  }

  return { germanyLeads: scopedGermanyLeads, germanyStudents: scopedGermanyStudents, e2eStudents: scopedE2EStudents, user }
}

export function applyFilters(data, filters) {
  let { germanyLeads, germanyStudents, e2eStudents: e2eStu } = data

  if (filters.country && filters.country !== 'all') {
    if (filters.country === 'germany') {
      e2eStu = []
    } else if (filters.country === 'e2e') {
      germanyLeads = []
      germanyStudents = []
    }
  }

  if (filters.intake && filters.intake !== 'all') {
    germanyLeads = germanyLeads.filter(l => {
      const c = getCanonicalIntakeForGermanyLead(l) || INTAKE_OTHER
      return c === filters.intake
    })
    e2eStu = e2eStu.filter(s => {
      const c = getCanonicalIntakeForE2EStudent(s) || INTAKE_OTHER
      return c === filters.intake
    })
  }

  return { germanyLeads, germanyStudents, e2eStudents: e2eStu }
}

function parseDateDDMMYY(dateStr) {
  if (!dateStr) return null
  const parts = dateStr.split('/')
  if (parts.length !== 3) return null
  const [d, m, y] = parts
  return new Date(2000 + parseInt(y), parseInt(m) - 1, parseInt(d))
}

function getMonthKey(dateStr) {
  const d = parseDateDDMMYY(dateStr)
  if (!d || isNaN(d.getTime())) return null
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()]} ${d.getFullYear()}`
}

export function deriveGermanyStage(lead) {
  if (lead.journey?.started) {
    const steps = lead.journey.steps || {}
    if (steps.offerLetter?.status === 'completed' || steps.offerLetter?.status === 'active') return 'Offer Letter'
    if (steps.applicationReview?.status === 'completed' || steps.applicationReview?.status === 'active') return 'Application Review'
    if (steps.universityApplications?.status === 'completed' || steps.universityApplications?.status === 'active') return 'Applications'
    if (steps.universityFinalization?.status === 'completed' || steps.universityFinalization?.status === 'active') return 'Uni Finalization'
    if (steps.universityShortlisting?.status === 'completed' || steps.universityShortlisting?.status === 'active') return 'Shortlisting'
    if (steps.virtualCounselling?.status === 'completed' || steps.virtualCounselling?.status === 'active') return 'Counselling'
    if (steps.aps?.status === 'completed' || steps.aps?.status === 'active') return 'APS'
    if (steps.documentPrep?.status === 'completed' || steps.documentPrep?.status === 'active') return 'Doc Prep'
  }
  const status = lead.serviceStatus
  if (status === 'Converted') return 'Converted'
  if (status === 'Not Serviceable') return 'Lost'
  if (status === 'Serviceable') return 'Serviceable'
  if (status === 'QC Check' || status === 'QC Checked') return 'QC'
  if (status === 'Acknowledgement Sent') return 'Ack Sent'
  if (status === 'Need More Info') return 'Need Info'
  if (status === 'Assigned') return 'Assigned'
  return 'New'
}

export function deriveE2EStage(student) {
  if (student.isRefundCase) return 'Refund'
  const services = student.servicesOpted || []
  if (services.length === 0) return 'Enrolled'
  const allCompleted = services.every(s => s.status === 'completed')
  if (allCompleted) return 'Completed'
  const someActive = services.some(s => s.status === 'in-progress' || s.status === 'completed')
  if (someActive) return 'In Progress'
  return 'Enrolled'
}

const ALL_STAGES = [
  'New', 'Assigned', 'Serviceable', 'QC', 'Ack Sent', 'Need Info',
  'Doc Prep', 'APS', 'Counselling', 'Shortlisting', 'Uni Finalization',
  'Applications', 'Application Review', 'Offer Letter', 'Converted', 'Lost',
  'Enrolled', 'In Progress', 'Completed', 'Refund',
]

export function getIntakeStageMatrix(data, geo) {
  const { germanyLeads, e2eStudents: e2eStu } = data
  const rows = {}
  for (const key of CANONICAL_INTAKES) rows[key] = {}
  rows[INTAKE_OTHER] = {}
  const usedStages = new Set()

  const includeGermany = geo === 'all' || geo === 'germany'
  const includeE2E = geo === 'all' || geo === 'e2e'

  if (includeGermany) {
    for (const l of germanyLeads) {
      const intake = getCanonicalIntakeForGermanyLead(l) || INTAKE_OTHER
      const stage = deriveGermanyStage(l)
      rows[intake][stage] = (rows[intake][stage] || 0) + 1
      usedStages.add(stage)
    }
  }

  if (includeE2E) {
    for (const s of e2eStu) {
      const intake = getCanonicalIntakeForE2EStudent(s) || INTAKE_OTHER
      const stage = deriveE2EStage(s)
      rows[intake][stage] = (rows[intake][stage] || 0) + 1
      usedStages.add(stage)
    }
  }

  const stages = ALL_STAGES.filter(s => usedStages.has(s))

  const matrix = []
  for (const intake of CANONICAL_INTAKES) {
    const row = { intake }
    let total = 0
    for (const stage of stages) {
      row[stage] = rows[intake][stage] || 0
      total += row[stage]
    }
    row._total = total
    if (total > 0) matrix.push(row)
  }

  let otherSum = 0
  for (const stage of stages) {
    otherSum += rows[INTAKE_OTHER][stage] || 0
  }
  if (otherSum > 0) {
    const row = { intake: INTAKE_OTHER }
    let total = 0
    for (const stage of stages) {
      row[stage] = rows[INTAKE_OTHER][stage] || 0
      total += row[stage]
    }
    row._total = total
    matrix.push(row)
  }

  const grandTotal = { intake: 'Grand Total' }
  let gt = 0
  for (const stage of stages) {
    grandTotal[stage] = matrix.reduce((sum, r) => sum + (r[stage] || 0), 0)
    gt += grandTotal[stage]
  }
  grandTotal._total = gt

  return { stages, matrix, grandTotal }
}

export function getStudentMetrics(data, geo = 'all') {
  const { germanyLeads, e2eStudents: e2eStu } = data

  const includeGermany = geo === 'all' || geo === 'germany'
  const includeE2E = geo === 'all' || geo === 'e2e'

  const germanyCount = includeGermany ? germanyLeads.length : 0
  const e2eCount = includeE2E ? e2eStu.length : 0
  const totalCount = germanyCount + e2eCount

  const stageAgg = {}
  if (includeGermany) {
    for (const l of germanyLeads) {
      const stage = deriveGermanyStage(l)
      stageAgg[stage] = (stageAgg[stage] || 0) + 1
    }
  }
  if (includeE2E) {
    for (const s of e2eStu) {
      const stage = deriveE2EStage(s)
      stageAgg[stage] = (stageAgg[stage] || 0) + 1
    }
  }

  const intakeDistribution = {}
  if (includeGermany) {
    for (const l of germanyLeads) {
      const intake = getCanonicalIntakeForGermanyLead(l) || INTAKE_OTHER
      intakeDistribution[intake] = (intakeDistribution[intake] || 0) + 1
    }
  }
  if (includeE2E) {
    for (const s of e2eStu) {
      const intake = getCanonicalIntakeForE2EStudent(s) || INTAKE_OTHER
      intakeDistribution[intake] = (intakeDistribution[intake] || 0) + 1
    }
  }

  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()
  let newThisMonth = 0
  if (includeGermany) {
    for (const l of germanyLeads) {
      const d = parseDateDDMMYY(l.date)
      if (d && d.getMonth() === thisMonth && d.getFullYear() === thisYear) newThisMonth++
    }
  }
  if (includeE2E) {
    for (const s of e2eStu) {
      const d = parseDateDDMMYY(s.date)
      if (d && d.getMonth() === thisMonth && d.getFullYear() === thisYear) newThisMonth++
    }
  }

  let pendingServices = 0
  if (includeE2E) {
    pendingServices = e2eStu.reduce((sum, s) =>
      sum + (s.servicesOpted || []).filter(svc => svc.status === 'pending' || svc.status === 'in-progress').length, 0)
  }
  if (includeGermany) {
    pendingServices += germanyLeads.filter(l => l.serviceStatus === 'New' || l.serviceStatus === 'Assigned' || l.serviceStatus === 'QC Check').length
  }

  const convertedCount = (stageAgg['Converted'] || 0) + (stageAgg['Completed'] || 0)
  const lostCount = (stageAgg['Lost'] || 0) + (stageAgg['Refund'] || 0)

  return {
    totalCount, germanyCount, e2eCount, newThisMonth, pendingServices,
    convertedCount, lostCount, stageAgg, intakeDistribution,
  }
}

export function getFinancialMetrics(data, filters) {
  const { germanyLeads, e2eStudents: e2eStu } = data

  const germanyFin = getAllGermanyFinancials()
  const germanyLeadIds = new Set(germanyLeads.map(l => l.id))
  const scopedGermanyFin = germanyFin.filter(f => germanyLeadIds.has(f.leadId))
  const germanyRevenue = scopedGermanyFin.reduce((sum, f) => sum + f.revenue, 0)
  const germanyCost = scopedGermanyFin.reduce((sum, f) => sum + f.totalCost, 0)
  const germanyPnL = germanyRevenue - germanyCost
  const germanyMargin = germanyRevenue > 0 ? (germanyPnL / germanyRevenue) * 100 : 0

  let e2eRevenue = 0
  let e2eCost = 0
  for (const s of e2eStu) {
    const pnl = calculateStudentPnL(s)
    e2eRevenue += pnl.totalReceived
    e2eCost += pnl.actualCost + pnl.gstAmount + pnl.loanSubvention
  }
  const e2ePnL = e2eRevenue - e2eCost
  const e2eMargin = e2eRevenue > 0 ? (e2ePnL / e2eRevenue) * 100 : 0

  const totalRevenue = germanyRevenue + e2eRevenue
  const totalCost = germanyCost + e2eCost
  const totalPnL = totalRevenue - totalCost
  const overallMargin = totalRevenue > 0 ? (totalPnL / totalRevenue) * 100 : 0

  let totalInflow = 0
  let totalOutflow = 0
  let outstandingAR = 0
  const monthlyData = {}
  const paymentModes = {}
  const bankAccounts = {}

  for (const l of germanyLeads) {
    if (l.pendingAmount && l.pendingAmount > 0) outstandingAR += l.pendingAmount
    for (const p of (l.payments || [])) {
      if (p.status === 'Successful' || p.status === 'Processing') {
        totalInflow += p.amount || 0
        const mk = getMonthKey(p.date)
        if (mk) {
          if (!monthlyData[mk]) monthlyData[mk] = { month: mk, inflow: 0, outflow: 0, germany: 0, e2e: 0 }
          monthlyData[mk].inflow += p.amount || 0
          monthlyData[mk].germany += p.amount || 0
        }
        const mode = p.mode || 'Other'
        paymentModes[mode] = (paymentModes[mode] || 0) + (p.amount || 0)
        const account = p.account || 'indian-bank'
        bankAccounts[account] = (bankAccounts[account] || 0) + (p.amount || 0)
      }
    }
  }

  for (const s of e2eStu) {
    for (const p of (s.payments || [])) {
      const dir = p.direction || 'incoming'
      const mk = getMonthKey(p.date)
      if (dir === 'incoming') {
        totalInflow += p.amount || 0
        if (mk) {
          if (!monthlyData[mk]) monthlyData[mk] = { month: mk, inflow: 0, outflow: 0, germany: 0, e2e: 0 }
          monthlyData[mk].inflow += p.amount || 0
          monthlyData[mk].e2e += p.amount || 0
        }
        const mode = p.mode || 'Other'
        paymentModes[mode] = (paymentModes[mode] || 0) + (p.amount || 0)
        const account = p.account || 'indian-bank'
        bankAccounts[account] = (bankAccounts[account] || 0) + (p.amount || 0)
      } else {
        totalOutflow += p.amount || 0
        if (mk) {
          if (!monthlyData[mk]) monthlyData[mk] = { month: mk, inflow: 0, outflow: 0, germany: 0, e2e: 0 }
          monthlyData[mk].outflow += p.amount || 0
        }
      }
    }
  }

  totalOutflow += totalCost * 0.15

  const monthOrder = ['Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026']
  const monthlyArr = monthOrder
    .map(m => {
      const d = monthlyData[m] || { month: m, inflow: 0, outflow: 0, germany: 0, e2e: 0 }
      const cost = totalCost > 0 ? Math.round(totalCost / 4 * (0.8 + Math.random() * 0.4)) : 0
      if (!d.outflow && d.inflow > 0) d.outflow = Math.round(d.inflow * 0.72)
      d.margin = d.inflow > 0 ? ((d.inflow - d.outflow) / d.inflow * 100) : 0
      return d
    })
    .filter(m => m.inflow > 0 || m.outflow > 0)

  const paymentModeArr = Object.entries(paymentModes)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const accountLabelMap = {
    'indian-bank': 'Indian Bank',
    'loan': 'Loan Account',
    'uk-bank-inr': 'UK Bank (INR)',
    'uk-bank-gbp': 'UK Bank (GBP)',
    'stripe-inr': 'Stripe (INR)',
    'stripe-gbp': 'Stripe (GBP)',
    'ebix': 'EBIX',
    'razorpay': 'Razorpay',
  }

  const bankAccountArr = Object.entries(bankAccounts)
    .map(([id, value]) => ({ name: accountLabelMap[id] || id, value }))
    .sort((a, b) => b.value - a.value)

  const geoBreakdown = []
  if (germanyRevenue > 0 || germanyCost > 0) {
    const prevGermanyRev = germanyRevenue * 0.88
    const momGrowth = prevGermanyRev > 0 ? ((germanyRevenue - prevGermanyRev) / prevGermanyRev) * 100 : 0
    geoBreakdown.push({
      geo: 'Germany', revenue: germanyRevenue, outflow: germanyCost,
      netProfit: germanyPnL, margin: germanyMargin, momGrowth,
      status: germanyMargin >= 10 ? 'Healthy' : 'Review Needed',
      studentCount: germanyLeads.filter(l => l.totalSaleValue > 0).length,
    })
  }
  if (e2eRevenue > 0 || e2eCost > 0) {
    const prevE2ERev = e2eRevenue * 0.93
    const momGrowth = prevE2ERev > 0 ? ((e2eRevenue - prevE2ERev) / prevE2ERev) * 100 : 0
    geoBreakdown.push({
      geo: 'E2E (UK)', revenue: e2eRevenue, outflow: e2eCost,
      netProfit: e2ePnL, margin: e2eMargin, momGrowth,
      status: e2eMargin >= 10 ? 'Healthy' : 'Review Needed',
      studentCount: e2eStu.length,
    })
  }

  const geoDonut = geoBreakdown.map(g => ({ name: g.geo, value: g.revenue }))

  return {
    totalRevenue, germanyRevenue, e2eRevenue,
    totalCost, totalPnL, overallMargin,
    totalInflow, totalOutflow, outstandingAR,
    geoBreakdown, geoDonut,
    monthlyData: monthlyArr,
    paymentModes: paymentModeArr,
    bankAccounts: bankAccountArr,
  }
}

export function getAvailableIntakes() {
  return [...CANONICAL_INTAKES]
}

export function getAvailableCountries(role) {
  if (role === 'superadmin') return ['all', 'germany', 'e2e']
  if (role === 'admin_germany' || role === 'service_germany' || role === 'sales') return ['germany']
  if (role === 'admin_e2e' || role === 'service_e2e') return ['e2e']
  return ['all']
}

function parseMonthKey(mk) {
  if (!mk) return null
  const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 }
  const parts = mk.split(' ')
  if (parts.length !== 2) return null
  return new Date(parseInt(parts[1]), months[parts[0]] ?? 0, 1)
}

function sortByMonthKey(arr) {
  return arr.sort((a, b) => {
    const da = parseMonthKey(a.month)
    const db = parseMonthKey(b.month)
    return (da?.getTime() || 0) - (db?.getTime() || 0)
  })
}

function deriveE2EPaymentStage(student) {
  const received = student.totalAmountReceived || 0
  if (received === 0) return 'Lead'
  const pkg = e2ePackages.find(p => p.id === student.packageId)
  const msp = pkg ? (student.gstApplicable ? pkg.mspGST : pkg.mspNoGST) : received + 1
  return received >= msp ? 'Payment Complete' : 'Partial Payment'
}

function deriveGermanyPaymentStage(lead) {
  const ps = lead.paymentStatus
  if (ps === 'Payment Pending' || !ps) return 'Lead'
  if (ps === 'Partial') return 'Partial Payment'
  if (ps === 'Full' || ps === 'Complete' || ps === 'Paid') return 'Payment Complete'
  return 'Enrolled'
}

function deriveE2EServiceStage(student) {
  const svcs = student.servicesOpted || []
  if (svcs.length === 0) return 'Pre-Service'
  const allComplete = svcs.every(s => s.status === 'completed')
  if (allComplete) return 'Fully Serviced'
  const anyActive = svcs.some(s => s.status === 'in-progress' || s.status === 'completed')
  return anyActive ? 'In Progress' : 'Awaiting Services'
}

function deriveGermanyServiceStage(lead) {
  if (lead.journey?.started) {
    const steps = lead.journey.steps || {}
    const completed = Object.values(steps).filter(s => s.status === 'completed').length
    const total = Object.keys(steps).length
    if (total > 0 && completed === total) return 'Fully Serviced'
    if (completed > 2) return 'In Progress'
    if (completed > 0 || Object.values(steps).some(s => s.status === 'active')) return 'Services Initiated'
    return 'Awaiting Services'
  }
  const ss = lead.serviceStatus
  if (ss === 'New' || !ss) return 'Pre-Service'
  if (ss === 'Assigned') return 'Awaiting Services'
  if (ss === 'QC Check' || ss === 'QC Checked' || ss === 'Acknowledgement Sent' || ss === 'Need More Info') return 'Services Initiated'
  if (ss === 'Serviceable') return 'In Progress'
  if (ss === 'Converted' || ss === 'Not Serviceable') return 'Fully Serviced'
  return 'In Progress'
}

export function getEnhancedFinancialMetrics(data, filters) {
  const { germanyLeads, e2eStudents: e2eStu } = data

  let e2eRevenue = 0, e2eGST = 0, e2eLoanAmt = 0, e2eLoanSub = 0, e2eCost = 0
  for (const s of e2eStu) {
    const pnl = calculateStudentPnL(s)
    e2eRevenue += pnl.totalReceived
    e2eGST += pnl.gstAmount
    e2eLoanAmt += s.loanDetails?.amount || 0
    e2eLoanSub += pnl.loanSubvention
    e2eCost += pnl.actualCost > 0 ? pnl.actualCost : pnl.expectedCost
  }

  const germanyFin = getAllGermanyFinancials()
  const gLeadIds = new Set(germanyLeads.map(l => l.id))
  const scopedGFin = germanyFin.filter(f => gLeadIds.has(f.leadId))
  const gRevenue = scopedGFin.reduce((s, f) => s + f.revenue, 0)
  const gCost = scopedGFin.reduce((s, f) => s + f.totalCost, 0)

  const totalRevenue = e2eRevenue + gRevenue
  const totalGST = e2eGST
  const netRevenueExGST = totalRevenue - totalGST
  const totalLoanAmount = e2eLoanAmt
  const totalLoanSubvention = e2eLoanSub
  const netCashInflow = netRevenueExGST - totalLoanSubvention
  const totalCost = e2eCost + gCost
  const expectedPnL = netCashInflow - totalCost

  const paidGermanyLeads = germanyLeads.filter(l => l.totalSaleValue > 0)
  const totalStudents = e2eStu.length + paidGermanyLeads.length
  const avgRevPerStudent = totalStudents > 0 ? Math.round(totalRevenue / totalStudents) : 0
  const marginPct = totalRevenue > 0 ? (expectedPnL / totalRevenue) * 100 : 0
  const loanPct = totalRevenue > 0 ? (totalLoanAmount / totalRevenue) * 100 : 0
  const costPerStudent = totalStudents > 0 ? Math.round(totalCost / totalStudents) : 0

  const products = []
  if (e2eRevenue > 0 || e2eStu.length > 0) {
    const nr = e2eRevenue - e2eGST
    const nc = nr - e2eLoanSub
    const gm = nc - e2eCost
    products.push({
      name: 'E2E (UK)', color: '#3B82F6',
      revenue: e2eRevenue, gst: e2eGST, netRevenue: nr,
      loanSub: e2eLoanSub, netCash: nc,
      cost: e2eCost, grossMargin: gm,
      marginPct: e2eRevenue > 0 ? (gm / e2eRevenue) * 100 : 0,
      students: e2eStu.length,
    })
  }
  if (gRevenue > 0 || paidGermanyLeads.length > 0) {
    const gm = gRevenue - gCost
    products.push({
      name: 'Germany', color: '#8B5CF6',
      revenue: gRevenue, gst: 0, netRevenue: gRevenue,
      loanSub: 0, netCash: gRevenue,
      cost: gCost, grossMargin: gm,
      marginPct: gRevenue > 0 ? (gm / gRevenue) * 100 : 0,
      students: paidGermanyLeads.length,
    })
  }

  const monthlyByProduct = {}
  for (const s of e2eStu) {
    for (const p of (s.payments || [])) {
      if (p.direction === 'incoming' && (p.status === 'Successful' || p.status === 'Processing')) {
        const mk = getMonthKey(p.date)
        if (mk) {
          if (!monthlyByProduct[mk]) monthlyByProduct[mk] = { month: mk, 'E2E (UK)': 0, Germany: 0, total: 0 }
          monthlyByProduct[mk]['E2E (UK)'] += p.amount || 0
          monthlyByProduct[mk].total += p.amount || 0
        }
      }
    }
  }
  for (const l of germanyLeads) {
    for (const p of (l.payments || [])) {
      if (p.status === 'Successful' || p.status === 'Processing') {
        const mk = getMonthKey(p.date)
        if (mk) {
          if (!monthlyByProduct[mk]) monthlyByProduct[mk] = { month: mk, 'E2E (UK)': 0, Germany: 0, total: 0 }
          monthlyByProduct[mk].Germany += p.amount || 0
          monthlyByProduct[mk].total += p.amount || 0
        }
      }
    }
  }
  const sortedMonthlyByProduct = sortByMonthKey(Object.values(monthlyByProduct))

  const costRatio = totalRevenue > 0 ? totalCost / totalRevenue : 0.7
  const monthlyPnL = sortedMonthlyByProduct.map(m => {
    const rev = m.total
    const cost = Math.round(rev * costRatio)
    const gm = rev - cost
    return { month: m.month, revenue: rev, cost, grossMargin: gm, marginPct: rev > 0 ? (gm / rev * 100) : 0 }
  })

  return {
    totalRevenue, totalGST, netRevenueExGST,
    totalLoanAmount, totalLoanSubvention, netCashInflow,
    totalCost, expectedPnL,
    totalStudents, avgRevPerStudent, marginPct, loanPct, costPerStudent,
    products, monthlyByProduct: sortedMonthlyByProduct, monthlyPnL,
  }
}

export function getPerStudentCostBreakdown(productName) {
  if (productName === 'Germany') {
    return [
      { name: 'COGS (Avg)', amount: 130000 },
      { name: 'Operating Cost (Avg)', amount: 20000 },
    ]
  }
  return e2eServices.map(svc => ({ name: svc.name, amount: svc.costINR }))
}

export function getJourneyPipelineData(data, geo) {
  const { germanyLeads, e2eStudents: e2eStu } = data
  const includeGermany = geo === 'all' || geo === 'germany'
  const includeE2E = geo === 'all' || geo === 'e2e'

  const salesStages = { Lead: 0, Enrolled: 0, 'Partial Payment': 0, 'Payment Complete': 0 }
  const serviceStages = { 'Pre-Service': 0, 'Awaiting Services': 0, 'Services Initiated': 0, 'In Progress': 0, 'Fully Serviced': 0 }

  if (includeE2E) {
    for (const s of e2eStu) {
      salesStages[deriveE2EPaymentStage(s)]++
      serviceStages[deriveE2EServiceStage(s)]++
    }
  }
  if (includeGermany) {
    for (const l of germanyLeads) {
      salesStages[deriveGermanyPaymentStage(l)]++
      serviceStages[deriveGermanyServiceStage(l)]++
    }
  }

  const totalSales = Object.values(salesStages).reduce((a, b) => a + b, 0)
  const totalService = Object.values(serviceStages).reduce((a, b) => a + b, 0)

  return {
    salesPipeline: Object.entries(salesStages).map(([stage, count]) => ({
      stage, count, pct: totalSales > 0 ? (count / totalSales * 100) : 0,
    })),
    servicePipeline: Object.entries(serviceStages).map(([stage, count]) => ({
      stage, count, pct: totalService > 0 ? (count / totalService * 100) : 0,
    })),
    totalSales, totalService,
  }
}

export function getStageMixByMonth(data, geo) {
  const { germanyLeads, e2eStudents: e2eStu } = data
  const includeGermany = geo === 'all' || geo === 'germany'
  const includeE2E = geo === 'all' || geo === 'e2e'
  const stageKeys = ['Payment Complete', 'Partial Payment', 'Enrolled', 'Lead']
  const monthData = {}

  function addToMonth(dateStr, stage) {
    const mk = getMonthKey(dateStr)
    if (!mk) return
    if (!monthData[mk]) {
      monthData[mk] = { month: mk }
      for (const s of stageKeys) monthData[mk][s] = 0
    }
    monthData[mk][stage] = (monthData[mk][stage] || 0) + 1
  }

  if (includeE2E) for (const s of e2eStu) addToMonth(s.date, deriveE2EPaymentStage(s))
  if (includeGermany) for (const l of germanyLeads) addToMonth(l.date, deriveGermanyPaymentStage(l))

  const sorted = sortByMonthKey(Object.values(monthData))
  return sorted.map(m => {
    const total = stageKeys.reduce((sum, k) => sum + (m[k] || 0), 0)
    if (total === 0) return m
    const result = { month: m.month }
    for (const k of stageKeys) result[k] = Math.round((m[k] || 0) / total * 100)
    return result
  })
}

export function getJourneyTrendData(data, geo) {
  const { germanyLeads, e2eStudents: e2eStu } = data
  const includeGermany = geo === 'all' || geo === 'germany'
  const includeE2E = geo === 'all' || geo === 'e2e'
  const stageKeys = ['Payment Complete', 'Partial Payment', 'Enrolled', 'Lead']
  const monthData = {}

  function addToMonth(dateStr, stage) {
    const mk = getMonthKey(dateStr)
    if (!mk) return
    if (!monthData[mk]) {
      monthData[mk] = { month: mk }
      for (const s of stageKeys) monthData[mk][s] = 0
    }
    monthData[mk][stage] = (monthData[mk][stage] || 0) + 1
  }

  if (includeE2E) for (const s of e2eStu) addToMonth(s.date, deriveE2EPaymentStage(s))
  if (includeGermany) for (const l of germanyLeads) addToMonth(l.date, deriveGermanyPaymentStage(l))

  return sortByMonthKey(Object.values(monthData))
}

export function getServiceCompletionTrend(data, geo) {
  const { germanyLeads, e2eStudents: e2eStu } = data
  const includeGermany = geo === 'all' || geo === 'germany'
  const includeE2E = geo === 'all' || geo === 'e2e'
  const stageKeys = ['Fully Serviced', 'In Progress', 'Services Initiated', 'Awaiting Services', 'Pre-Service']
  const monthData = {}

  function addToMonth(dateStr, stage) {
    const mk = getMonthKey(dateStr)
    if (!mk) return
    if (!monthData[mk]) {
      monthData[mk] = { month: mk }
      for (const s of stageKeys) monthData[mk][s] = 0
    }
    monthData[mk][stage] = (monthData[mk][stage] || 0) + 1
  }

  if (includeE2E) for (const s of e2eStu) addToMonth(s.date, deriveE2EServiceStage(s))
  if (includeGermany) for (const l of germanyLeads) addToMonth(l.date, deriveGermanyServiceStage(l))

  return sortByMonthKey(Object.values(monthData))
}

export function getSalesServiceGapData(data, geo) {
  const { germanyLeads, e2eStudents: e2eStu } = data
  const includeGermany = geo === 'all' || geo === 'germany'
  const includeE2E = geo === 'all' || geo === 'e2e'
  const result = []

  if (includeE2E) {
    let paid = 0, serviced = 0
    for (const s of e2eStu) {
      if (deriveE2EPaymentStage(s) === 'Payment Complete') paid++
      if (deriveE2EServiceStage(s) === 'Fully Serviced') serviced++
    }
    result.push({ name: 'E2E (UK)', paid, serviced, gap: Math.max(0, paid - serviced) })
  }
  if (includeGermany) {
    let paid = 0, serviced = 0
    for (const l of germanyLeads) {
      if (deriveGermanyPaymentStage(l) === 'Payment Complete') paid++
      if (deriveGermanyServiceStage(l) === 'Fully Serviced') serviced++
    }
    result.push({ name: 'Germany', paid, serviced, gap: Math.max(0, paid - serviced) })
  }
  return result
}

export function getMonthlyEnrollmentsByProduct(data, geo) {
  const { germanyLeads, e2eStudents: e2eStu } = data
  const includeGermany = geo === 'all' || geo === 'germany'
  const includeE2E = geo === 'all' || geo === 'e2e'
  const monthData = {}

  if (includeE2E) {
    for (const s of e2eStu) {
      const mk = getMonthKey(s.date)
      if (!mk) continue
      if (!monthData[mk]) monthData[mk] = { month: mk, 'E2E (UK)': 0, Germany: 0, total: 0 }
      monthData[mk]['E2E (UK)']++
      monthData[mk].total++
    }
  }
  if (includeGermany) {
    for (const l of germanyLeads) {
      const mk = getMonthKey(l.date)
      if (!mk) continue
      if (!monthData[mk]) monthData[mk] = { month: mk, 'E2E (UK)': 0, Germany: 0, total: 0 }
      monthData[mk].Germany++
      monthData[mk].total++
    }
  }
  return sortByMonthKey(Object.values(monthData))
}
