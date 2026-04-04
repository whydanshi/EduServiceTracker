import { useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import SearchBar from '../../components/shared/SearchBar'
import FilterPills from '../../components/shared/FilterPills'
import DataTable from '../../components/shared/DataTable'
import { paymentOverview, transactionHistory } from '../../data/payments'
import { Download, ArrowUpDown, SlidersHorizontal, CreditCard, Wallet, Eye, ArrowLeft } from 'lucide-react'

const filters = [
  { id: 'all', label: 'All' },
  { id: 'full', label: 'Full Payment Done', dot: true, dotColor: 'bg-green' },
  { id: 'partial', label: 'Partial Payment Done', dot: true, dotColor: 'bg-amber' },
]

const modeColors = { 'Bank Transfer': 'bg-info-light text-info', 'Credit Card': 'bg-purple-light text-purple', 'Cash': 'bg-green-light text-green', 'UPI': 'bg-amber-light text-amber' }
const txnStatusColors = { 'Successful': 'bg-green-light text-green', 'Processing': 'bg-info-light text-info', 'Failed': 'bg-red-light text-red' }

export default function AdminPayments() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedStudent, setSelectedStudent] = useState(null)

  const filtered = activeFilter === 'all' ? paymentOverview : activeFilter === 'full' ? paymentOverview.filter(p => p.left === 0) : paymentOverview.filter(p => p.left > 0)

  const columns = [
    {
      key: 'studentName', label: 'Student Name',
      render: (val) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-grey-10 border border-grey-20 flex items-center justify-center text-[10px] font-semibold text-grey-60">{val.split(' ').map(n => n[0]).join('')}</div>
          <span className="font-medium text-grey-95">{val}</span>
        </div>
      ),
    },
    { key: 'salesPOC', label: 'Sales POC', render: (val) => <span className="text-grey-60">{val}</span> },
    { key: 'packageDetail', label: 'Package', render: (val) => <span className="text-grey-70">{val}</span> },
    { key: 'additionalServices', label: 'Add-ons', render: (val) => <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${val ? 'bg-green-light text-green' : 'bg-grey-10 text-grey-40'}`}>{val ? 'Yes' : 'No'}</span> },
    { key: 'totalAmount', label: 'Total', render: (val) => <span className="font-medium text-grey-95">${val.toLocaleString()}</span> },
    { key: 'paid', label: 'Paid', render: (val) => <span className="text-green font-medium">${val.toLocaleString()}</span> },
    { key: 'left', label: 'Left', render: (val) => <span className={`font-medium ${val > 0 ? 'text-red' : 'text-green'}`}>${val.toLocaleString()}</span> },
    { key: 'mode', label: 'Mode', render: (val) => <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${modeColors[val] || 'bg-grey-10 text-grey-60'}`}>{val}</span> },
    { key: 'lastCollected', label: 'Last Collected', render: (val) => <span className="text-grey-60">${val.toLocaleString()}</span> },
    { key: 'action', label: '', render: (_, row) => <button onClick={() => setSelectedStudent(row)} className="text-grey-40 hover:text-grey-70 transition-colors"><Eye className="w-4 h-4" /></button> },
  ]

  if (selectedStudent) {
    return (
      <div>
        <button onClick={() => setSelectedStudent(null)} className="flex items-center gap-1.5 text-[13px] text-grey-40 hover:text-grey-70 mb-5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Payments
        </button>
        <PageHeader title="Student Payment Log" subtitle={`Transaction history for ${selectedStudent.studentName}`} />
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-grey-20 rounded-xl p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-info-light flex items-center justify-center"><CreditCard className="w-5 h-5 text-info" /></div>
            <div>
              <p className="text-[11px] font-medium text-grey-40 uppercase">Total Paid</p>
              <p className="text-[22px] font-semibold text-grey-95">${selectedStudent.paid.toLocaleString()}.00</p>
            </div>
          </div>
          <div className="bg-white border border-grey-20 rounded-xl p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-light flex items-center justify-center"><Wallet className="w-5 h-5 text-amber" /></div>
            <div>
              <p className="text-[11px] font-medium text-grey-40 uppercase">Total Outstanding</p>
              <p className="text-[22px] font-semibold text-grey-95">${selectedStudent.left.toLocaleString()}.00</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-semibold text-grey-95">Transaction History</h3>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-grey-60 border border-grey-20 hover:bg-grey-10"><Download className="w-3.5 h-3.5" /> Export CSV</button>
        </div>
        <div className="bg-white rounded-xl border border-grey-20 overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-grey-5 border-b border-grey-20">
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Date</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Transaction ID</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Amount</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Payment Mode</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Status</th>
            </tr></thead>
            <tbody>
              {transactionHistory.map((txn) => (
                <tr key={txn.txnId} className="border-b border-grey-10 last:border-b-0 hover:bg-blue-5 transition-colors">
                  <td className="px-5 py-3.5 text-[13px] text-grey-60">{txn.date}</td>
                  <td className="px-5 py-3.5 text-[13px] text-grey-40 font-mono">{txn.txnId}</td>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-grey-95">${txn.amount.toLocaleString()}.00</td>
                  <td className="px-5 py-3.5 text-[13px] text-grey-60">{txn.mode}</td>
                  <td className="px-5 py-3.5"><span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${txnStatusColors[txn.status]}`}>{txn.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader greeting title="Payment Details" />
      <div className="mb-5"><FilterPills filters={filters} activeFilter={activeFilter} onFilterChange={setActiveFilter} /></div>
      <div className="flex items-center justify-between mb-6">
        <SearchBar placeholder="Search student" value={search} onChange={setSearch} className="w-[260px]" />
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-grey-60 hover:bg-grey-10"><ArrowUpDown className="w-3.5 h-3.5" /> Sort</button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-grey-60 hover:bg-grey-10"><SlidersHorizontal className="w-3.5 h-3.5" /> Filters</button>
        </div>
      </div>
      <DataTable columns={columns} data={filtered} page={page} totalItems={24} pageSize={10} onPageChange={setPage} />
    </div>
  )
}
