import { useState, useMemo } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import FilterPills from '../../components/shared/FilterPills'
import ApprovalCard from '../../components/e2e/ApprovalCard'
import { useToast } from '../../components/shared/Toast'
import { getAllApprovals, updateApprovalStatus } from '../../utils/approvalStore'

export default function Approvals() {
  const { toast } = useToast()
  const [approvalsList, setApprovalsList] = useState(getAllApprovals())
  const [filter, setFilter] = useState('pending')

  const pendingApprovals = approvalsList.filter(a => a.status === 'pending')

  const filters = [
    { id: 'pending', label: 'All Pending', count: pendingApprovals.length },
    { id: 'e2e', label: 'E2E', count: pendingApprovals.filter(a => a.type === 'e2e').length },
    { id: 'vas', label: 'VAS', count: pendingApprovals.filter(a => a.type === 'vas').length },
    { id: 'escalated', label: 'Escalated', count: pendingApprovals.filter(a => a.escalated).length, dot: true, dotColor: 'bg-red' },
  ]

  const filtered = useMemo(() => {
    let list = pendingApprovals
    if (filter === 'e2e') list = list.filter(a => a.type === 'e2e')
    else if (filter === 'vas') list = list.filter(a => a.type === 'vas')
    else if (filter === 'escalated') list = list.filter(a => a.escalated)
    return list
  }, [pendingApprovals, filter])

  const handleApprove = (id, remarks) => {
    setApprovalsList(prev =>
      prev.map(a => a.id === id ? { ...a, status: 'approved', remarks: remarks || a.remarks } : a)
    )
    updateApprovalStatus(id, 'approved', remarks)
    toast({ title: 'Approved', description: 'Payout has been approved successfully.', type: 'success' })
  }

  const handleReject = (id, remarks) => {
    setApprovalsList(prev =>
      prev.map(a => a.id === id ? { ...a, status: 'rejected', remarks: remarks || a.remarks } : a)
    )
    updateApprovalStatus(id, 'rejected', remarks)
    toast({ title: 'Rejected', description: 'Payout request has been rejected.', type: 'error' })
  }

  return (
    <div>
      <PageHeader title="Payout Approvals" />

      <div className="mb-5">
        <FilterPills filters={filters} activeFilter={filter} onFilterChange={setFilter} />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-grey-20 rounded-xl px-5 py-12 text-center">
          <p className="text-[15px] font-medium text-grey-60 mb-1">No pending approvals</p>
          <p className="text-[13px] text-grey-40">All approvals have been processed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(approval => (
            <ApprovalCard
              key={approval.id}
              approval={approval}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  )
}
