import { useState, useMemo } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import FilterPills from '../../components/shared/FilterPills'
import ApprovalCard from '../../components/e2e/ApprovalCard'
import { useToast } from '../../components/shared/Toast'
import { getAllApprovals, updateApprovalStatus } from '../../utils/approvalStore'

export default function Approvals() {
  const { toast } = useToast()
  const [activeFilter, setActiveFilter] = useState('all')

  const [localApprovals, setLocalApprovals] = useState(() =>
    getAllApprovals().filter(a => !a.escalated),
  )

  const pending = useMemo(
    () => localApprovals.filter(a => a.status === 'pending'),
    [localApprovals],
  )

  const filtered = useMemo(() => {
    if (activeFilter === 'e2e') return pending.filter(a => a.type === 'e2e')
    if (activeFilter === 'vas') return pending.filter(a => a.type === 'vas')
    return pending
  }, [pending, activeFilter])

  const filters = [
    { id: 'all', label: 'All Pending', count: pending.length },
    { id: 'e2e', label: 'E2E', count: pending.filter(a => a.type === 'e2e').length, dot: true, dotColor: 'bg-info' },
    { id: 'vas', label: 'VAS', count: pending.filter(a => a.type === 'vas').length, dot: true, dotColor: 'bg-purple' },
  ]

  const handleApprove = (id, remarks) => {
    setLocalApprovals(prev =>
      prev.map(a => (a.id === id ? { ...a, status: 'approved', remarks } : a)),
    )
    updateApprovalStatus(id, 'approved', remarks)
    toast({ title: 'Approved', description: `Approval ${id} has been approved.`, type: 'success' })
  }

  const handleReject = (id, remarks) => {
    setLocalApprovals(prev =>
      prev.map(a => (a.id === id ? { ...a, status: 'rejected', remarks } : a)),
    )
    updateApprovalStatus(id, 'rejected', remarks)
    toast({ title: 'Rejected', description: `Approval ${id} has been rejected.`, type: 'error' })
  }

  const resolved = localApprovals.filter(a => a.status !== 'pending')

  return (
    <div>
      <PageHeader title="Payout Approvals" />

      <div className="mb-4">
        <FilterPills filters={filters} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-grey-20 rounded-xl px-5 py-12 text-center">
          <p className="text-[14px] text-grey-40">No pending approvals</p>
          <p className="text-[12px] text-grey-40 mt-1">All caught up!</p>
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

      {resolved.length > 0 && (
        <div className="mt-8">
          <h3 className="text-[14px] font-semibold text-grey-95 mb-3">Resolved</h3>
          <div className="bg-white border border-grey-20 rounded-xl overflow-hidden divide-y divide-grey-10">
            {resolved.map(a => (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-grey-95">{a.studentName}</p>
                  <p className="text-[11px] text-grey-60">{a.serviceName}</p>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                  a.status === 'approved' ? 'bg-green-light text-green' : 'bg-red-light text-red'
                }`}>
                  {a.status === 'approved' ? 'Approved' : 'Rejected'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
