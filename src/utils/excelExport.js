import * as XLSX from 'xlsx'
import { calculateStudentPnL, formatINR, formatPct } from './pnlCalculator'
import { e2eServices } from '../data/e2ePackages'
import {
  getStudentMetrics,
  getFinancialMetrics,
  getCanonicalIntakeForGermanyLead,
  getCanonicalIntakeForE2EStudent,
  INTAKE_OTHER,
} from './dashboardData'
import { getAllGermanyFinancials } from '../data/germanyFinancials'

function getServiceName(serviceId) {
  return e2eServices.find(s => s.id === serviceId)?.name || serviceId
}

export function exportStudentPnL(student, gbpRate) {
  const pnl = calculateStudentPnL(student, gbpRate)

  const summaryData = [
    ['Student P&L Report'],
    [],
    ['Student Name', student.studentName],
    ['University', student.university],
    ['Course', student.course],
    ['Intake', student.intake],
    ['Package', student.packageName],
    ['Sales POC', student.salesPOC],
    ['Service POC', student.servicePOC],
    [],
    ['P&L Summary'],
    ['Total Amount Received', pnl.totalReceived],
    ['GST Amount', pnl.gstAmount],
    ['Net After Tax', pnl.netAfterTax],
    ['Loan Subvention', pnl.loanSubvention],
    ['After GST & Subvention', pnl.afterGSTAndSubvention],
    ['Expected Cost', pnl.expectedCost],
    ['Actual Cost', pnl.actualCost],
    ['Expected P&L', pnl.expectedPnL],
    ['Net P&L', pnl.netPnL],
    ['Final Margin', `${pnl.marginPct.toFixed(1)}%`],
    [],
    ['Services'],
    ['Service', 'Expected (INR)', 'Actual (INR)', 'Status'],
  ]

  for (const svc of (student.servicesOpted || [])) {
    summaryData.push([
      getServiceName(svc.serviceId),
      svc.expected || 0,
      svc.actual ?? 'Pending',
      svc.status,
    ])
  }

  if (student.vasItems?.length) {
    summaryData.push([], ['Value Added Services'])
    summaryData.push(['VAS', 'Revenue', 'Cost', 'Status'])
    for (const vas of student.vasItems) {
      summaryData.push([vas.name, vas.amount, vas.cost, vas.status])
    }
  }

  summaryData.push([], ['Payments'])
  summaryData.push(['Date', 'Amount', 'Mode', 'Account', 'Direction', 'Status'])
  for (const p of (student.payments || [])) {
    summaryData.push([p.date, p.amount, p.mode, p.account, p.direction, p.status])
  }

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, ws, 'P&L')
  XLSX.writeFile(wb, `${student.studentName.replace(/\s+/g, '_')}_PnL.xlsx`)
}

export function exportAllStudentsPnL(students, gbpRate) {
  const headers = [
    'Student ID', 'Name', 'University', 'Package', 'Intake',
    'Total Received', 'GST', 'Net After Tax', 'Expected Cost', 'Actual Cost',
    'Expected P&L', 'Net P&L', 'Margin %', 'Sales POC', 'Service POC',
    'VAS Revenue', 'VAS Cost', 'Refund Case',
  ]

  const rows = students.map(student => {
    const pnl = calculateStudentPnL(student, gbpRate)
    return [
      student.id, student.studentName, student.university, student.packageName, student.intake,
      pnl.totalReceived, pnl.gstAmount, pnl.netAfterTax, pnl.expectedCost, pnl.actualCost,
      pnl.expectedPnL, pnl.netPnL, `${pnl.marginPct.toFixed(1)}%`, student.salesPOC, student.servicePOC,
      pnl.vasRevenue, pnl.vasCost, student.isRefundCase ? 'Yes' : 'No',
    ]
  })

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
  XLSX.utils.book_append_sheet(wb, ws, 'All Students P&L')
  XLSX.writeFile(wb, 'E2E_All_Students_PnL.xlsx')
}

export function exportStudentsOverview(data) {
  const wb = XLSX.utils.book_new()

  if (data.germanyLeads.length > 0) {
    const headers = ['ID', 'Name', 'City', 'State', 'Service Status', 'Sales Status', 'Intake (canonical)', 'Sales POC', 'Service POC', 'Sale Value', 'Payment Status']
    const rows = data.germanyLeads.map(l => [
      l.id, l.studentName, l.city, l.state, l.serviceStatus, l.salesStatus,
      getCanonicalIntakeForGermanyLead(l) || INTAKE_OTHER, l.salesPOC || '', l.servicePOC || '',
      l.totalSaleValue || 0, l.paymentStatus || '',
    ])
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
    XLSX.utils.book_append_sheet(wb, ws, 'Germany Students')
  }

  if (data.e2eStudents.length > 0) {
    const headers = ['ID', 'Name', 'University', 'Course', 'Intake (canonical)', 'Country', 'Sales POC', 'Service POC', 'Amount Received', 'Margin %', 'Refund Case']
    const rows = data.e2eStudents.map(s => {
      const pnl = calculateStudentPnL(s)
      return [
        s.id, s.studentName, s.university, s.course, getCanonicalIntakeForE2EStudent(s) || INTAKE_OTHER, s.country,
        s.salesPOC, s.servicePOC, pnl.totalReceived,
        `${pnl.marginPct.toFixed(1)}%`, s.isRefundCase ? 'Yes' : 'No',
      ]
    })
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
    XLSX.utils.book_append_sheet(wb, ws, 'E2E Students')
  }

  XLSX.writeFile(wb, 'Students_Overview.xlsx')
}

export function exportFinancialsOverview(data, filters) {
  const wb = XLSX.utils.book_new()
  const fin = getFinancialMetrics(data, filters)

  const summaryRows = [
    ['Financial Overview'],
    [],
    ['Metric', 'Value'],
    ['Total Revenue', fin.totalRevenue],
    ['Germany Revenue', fin.germanyRevenue],
    ['E2E Revenue', fin.e2eRevenue],
    ['Total Inflow', fin.totalInflow],
    ['Total Cost', fin.totalCost],
    ['Total P&L', fin.totalPnL],
    ['Overall Margin', `${fin.overallMargin.toFixed(1)}%`],
    [],
    ['Product-wise P&L'],
    ['Product', 'Revenue', 'Cost', 'P&L', 'Margin %', 'Students'],
  ]
  for (const row of fin.productPnL) {
    summaryRows.push([row.product, row.revenue, row.cost, row.pnl, `${row.margin.toFixed(1)}%`, row.studentCount])
  }
  summaryRows.push([], ['Month-on-Month Revenue'], ['Month', 'Germany', 'E2E'])
  for (const m of fin.monthlyData) {
    summaryRows.push([m.month, m.germany, m.e2e])
  }
  summaryRows.push([], ['Payment Mode Breakdown'], ['Mode', 'Amount'])
  for (const p of fin.paymentModes) {
    summaryRows.push([p.name, p.value])
  }
  summaryRows.push([], ['Bank Account Breakdown'], ['Account', 'Amount'])
  for (const b of fin.bankAccounts) {
    summaryRows.push([b.name, b.value])
  }

  const ws = XLSX.utils.aoa_to_sheet(summaryRows)
  XLSX.utils.book_append_sheet(wb, ws, 'Financials')
  XLSX.writeFile(wb, 'Financial_Overview.xlsx')
}
