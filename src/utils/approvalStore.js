import { approvals as seedApprovals } from '../data/approvals'
import { readJson, writeJson } from './storage'

const APPROVALS_KEY = 'e2e_dynamic_approvals_v1'

function normalizeApproval(raw) {
  return {
    id: raw.id,
    studentId: raw.studentId,
    studentName: raw.studentName,
    type: raw.type,
    serviceName: raw.serviceName,
    amount: raw.amount,
    requestedBy: raw.requestedBy,
    requestedDate: raw.requestedDate,
    status: raw.status || 'pending',
    margin: raw.margin ?? null,
    escalated: Boolean(raw.escalated),
    remarks: raw.remarks || '',
    sendToFinance: Boolean(raw.sendToFinance),
  }
}

function getDynamicApprovals() {
  const rows = readJson(APPROVALS_KEY, [])
  if (!Array.isArray(rows)) return []
  return rows.map(normalizeApproval)
}

function setDynamicApprovals(rows) {
  writeJson(APPROVALS_KEY, rows)
}

export function getAllApprovals() {
  return [...seedApprovals, ...getDynamicApprovals()]
}

export function getNextApprovalId() {
  const all = getAllApprovals()
  const max = all.reduce((m, a) => {
    const n = Number(String(a.id || '').replace('APR-', ''))
    return Number.isFinite(n) ? Math.max(m, n) : m
  }, 0)
  return `APR-${String(max + 1).padStart(3, '0')}`
}

export function createApproval(approvalInput) {
  const next = normalizeApproval({
    ...approvalInput,
    id: approvalInput.id || getNextApprovalId(),
    status: approvalInput.status || 'pending',
  })
  const rows = getDynamicApprovals()
  rows.push(next)
  setDynamicApprovals(rows)
  return next
}

export function updateApprovalStatus(id, status, remarks) {
  const rows = getDynamicApprovals()
  const nextRows = rows.map(row => {
    if (row.id !== id) return row
    return {
      ...row,
      status,
      remarks: remarks || row.remarks || '',
    }
  })
  setDynamicApprovals(nextRows)
}
