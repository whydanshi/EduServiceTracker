import { e2eServices } from '../data/e2ePackages'
import { loanVendors } from '../data/loanVendors'

const GST_RATE = 18

export function calculateGST(amount, rate = GST_RATE) {
  if (!amount || !rate) return 0
  return Math.round((amount * rate) / (100 + rate) * 100) / 100
}

export function calculateLoanSubvention(loanDetails) {
  if (!loanDetails || !loanDetails.amount) return 0
  const vendor = loanVendors.find(v => v.id === loanDetails.vendorId)
  if (vendor) {
    const baseSubvention = (loanDetails.amount * (vendor.subventionRate || 0)) / 100
    const gstOnSubvention = (vendor.gstOnSubvention && loanDetails.gstApplicable)
      ? (baseSubvention * GST_RATE) / 100
      : 0
    return Math.round((baseSubvention + gstOnSubvention) * 100) / 100
  }
  return loanDetails.subvention || 0
}

export function getServiceCostINR(serviceId) {
  const svc = e2eServices.find(s => s.id === serviceId)
  return svc?.costINR ?? 0
}

export function calculateStudentPnL(student, gbpRate) {
  const totalReceived = student.totalAmountReceived || 0
  const gstAmount = student.gstApplicable ? calculateGST(totalReceived, student.gstRate || GST_RATE) : 0
  const netAfterTax = totalReceived - gstAmount

  const loanSubvention = calculateLoanSubvention(student.loanDetails)
  const afterGSTAndSubvention = netAfterTax - loanSubvention

  let expectedCost = 0
  let actualCost = 0
  let completedCost = 0

  for (const svc of (student.servicesOpted || [])) {
    expectedCost += svc.expected || 0
    if (svc.actual != null) {
      actualCost += svc.actual
    }
    if (svc.status === 'completed' && svc.actual != null) {
      completedCost += svc.actual
    }
  }

  let vasRevenue = 0
  let vasCost = 0
  for (const vas of (student.vasItems || [])) {
    vasRevenue += vas.amount || 0
    vasCost += vas.cost || 0
  }
  const vasMargin = vasRevenue > 0 ? ((vasRevenue - vasCost) / vasRevenue) * 100 : 0

  const expectedPnL = afterGSTAndSubvention - expectedCost
  const netPnL = afterGSTAndSubvention - actualCost
  const marginPct = totalReceived > 0 ? (netPnL / totalReceived) * 100 : 0
  const expectedMarginPct = totalReceived > 0 ? (expectedPnL / totalReceived) * 100 : 0

  const e2eMargin = totalReceived > 0 ? ((afterGSTAndSubvention - actualCost) / totalReceived) * 100 : 0
  const overallMargin = marginPct

  return {
    totalReceived,
    gstAmount,
    netAfterTax,
    loanSubvention,
    afterGSTAndSubvention,
    expectedCost,
    actualCost,
    completedCost,
    expectedPnL,
    netPnL,
    marginPct,
    expectedMarginPct,
    vasRevenue,
    vasCost,
    vasMargin,
    e2eMargin,
    overallMargin,
  }
}

export function calculateRefundAmount(student) {
  const totalReceived = student.totalAmountReceived || 0
  let servicesProvidedCost = 0
  const providedServices = []

  for (const svc of (student.servicesOpted || [])) {
    if (svc.status === 'completed' && svc.actual != null) {
      servicesProvidedCost += svc.actual
      const svcInfo = e2eServices.find(s => s.id === svc.serviceId)
      providedServices.push({
        name: svcInfo?.name || svc.serviceId,
        cost: svc.actual,
      })
    }
  }

  let vasCostProvided = 0
  for (const vas of (student.vasItems || [])) {
    if (vas.status === 'completed') {
      vasCostProvided += vas.cost || 0
      providedServices.push({ name: vas.name, cost: vas.cost || 0 })
    }
  }

  const gstAmount = student.gstApplicable ? calculateGST(totalReceived, student.gstRate || GST_RATE) : 0
  const totalDeductions = servicesProvidedCost + vasCostProvided + gstAmount
  const refundAmount = Math.max(0, totalReceived - totalDeductions)

  return {
    totalReceived,
    servicesProvidedCost,
    vasCostProvided,
    gstAmount,
    totalDeductions,
    refundAmount,
    providedServices,
  }
}

export function calculateVASMargin(vasItems) {
  let totalRevenue = 0
  let totalCost = 0
  for (const vas of (vasItems || [])) {
    totalRevenue += vas.amount || 0
    totalCost += vas.cost || 0
  }
  return totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0
}

export function getMarginColor(marginPct) {
  if (marginPct > 15) return 'green'
  if (marginPct >= 10) return 'yellow'
  return 'red'
}

export function getMarginLabel(marginPct) {
  if (marginPct > 15) return 'Healthy'
  if (marginPct >= 10) return 'Acceptable'
  return 'Below Minimum'
}

export function needsApproval(type, marginPct) {
  if (type === 'vas') return true
  if (type === 'e2e' && marginPct < 10) return true
  return false
}

export function needsSuperAdminApproval(marginPct) {
  return marginPct < 10
}

export function formatINR(amount) {
  if (amount == null) return '—'
  return `₹${Number(amount).toLocaleString('en-IN')}`
}

export function formatPct(value) {
  if (value == null) return '—'
  return `${Number(value).toFixed(1)}%`
}
