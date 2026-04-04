import { useState, useRef } from 'react'
import { ArrowDownLeft, ArrowUpRight, Upload, FileCheck, X } from 'lucide-react'
import { formatINR } from '../../utils/pnlCalculator'
import { paymentAccounts } from '../../data/e2ePackages'

const modeColors = {
  'Bank Transfer': 'bg-info-light text-info',
  'UPI':           'bg-purple-light text-purple',
  'NEFT':          'bg-info-light text-info',
  'Loan':          'bg-amber-light text-amber',
  'Credit Card':   'bg-purple-light text-purple',
  'Cash':          'bg-green-light text-green',
}

const statusColors = {
  'Successful': 'bg-green-light text-green',
  'Processing': 'bg-info-light text-info',
  'Failed':     'bg-red-light text-red',
}

function getAccountLabel(accountId) {
  return paymentAccounts.find(a => a.id === accountId)?.label || accountId
}

export default function PaymentsList({ payments = [], onUploadProof }) {
  const [proofFiles, setProofFiles] = useState({})
  const fileInputRef = useRef(null)
  const [activePaymentId, setActivePaymentId] = useState(null)

  const incoming = payments.filter(p => p.direction === 'incoming')
  const outgoing = payments.filter(p => p.direction === 'outgoing')

  const handleUploadClick = (paymentId) => {
    setActivePaymentId(paymentId)
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file && activePaymentId) {
      setProofFiles(prev => ({ ...prev, [activePaymentId]: file.name }))
      onUploadProof?.(activePaymentId, file)
    }
    e.target.value = ''
    setActivePaymentId(null)
  }

  const handleRemoveProof = (paymentId) => {
    setProofFiles(prev => {
      const next = { ...prev }
      delete next[paymentId]
      return next
    })
  }

  const renderProofCell = (p) => {
    if (p.proofUrl) {
      return <a href={p.proofUrl} className="text-[11px] text-blue-90 hover:underline">View</a>
    }
    if (proofFiles[p.id]) {
      return (
        <div className="flex items-center gap-1">
          <FileCheck className="w-3.5 h-3.5 text-green" />
          <span className="text-[11px] text-green font-medium truncate max-w-[80px]">{proofFiles[p.id]}</span>
          <button onClick={() => handleRemoveProof(p.id)} className="p-0.5 text-grey-40 hover:text-red rounded">
            <X className="w-3 h-3" />
          </button>
        </div>
      )
    }
    return (
      <button onClick={() => handleUploadClick(p.id)} className="inline-flex items-center gap-1 text-[11px] text-grey-40 hover:text-blue-90 transition-colors">
        <Upload className="w-3.5 h-3.5" />
        <span>Upload</span>
      </button>
    )
  }

  const renderTable = (rows, color) => (
    <table className="w-full">
      <thead>
        <tr className="bg-grey-5 border-b border-grey-20">
          <th className="px-5 py-2 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Date</th>
          <th className="px-5 py-2 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Amount</th>
          <th className="px-5 py-2 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Mode</th>
          <th className="px-5 py-2 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Account</th>
          <th className="px-5 py-2 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Status</th>
          <th className="px-5 py-2 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Proof</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(p => (
          <tr key={p.id} className="border-b border-grey-10 last:border-b-0">
            <td className="px-5 py-2.5 text-[13px] text-grey-60">{p.date}</td>
            <td className={`px-5 py-2.5 text-[13px] font-medium ${color}`}>{formatINR(p.amount)}</td>
            <td className="px-5 py-2.5"><span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${modeColors[p.mode] || 'bg-grey-10 text-grey-60'}`}>{p.mode}</span></td>
            <td className="px-5 py-2.5 text-[13px] text-grey-60">{getAccountLabel(p.account)}</td>
            <td className="px-5 py-2.5"><span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusColors[p.status] || 'bg-grey-10 text-grey-60'}`}>{p.status}</span></td>
            <td className="px-5 py-2.5">{renderProofCell(p)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  return (
    <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="px-5 py-3 border-b border-grey-10 flex items-center gap-2">
        <h3 className="text-[14px] font-semibold text-grey-95">Payments</h3>
        {incoming.length > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green bg-green-light px-2 py-0.5 rounded-full">
            <ArrowDownLeft className="w-3 h-3" />
            {incoming.length} Incoming
          </span>
        )}
        {outgoing.length > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red bg-red-light px-2 py-0.5 rounded-full">
            <ArrowUpRight className="w-3 h-3" />
            {outgoing.length} Outgoing
          </span>
        )}
      </div>

      {incoming.length > 0 && renderTable(incoming, 'text-green')}

      {outgoing.length > 0 && (
        <>
          {incoming.length > 0 && <div className="border-t border-grey-20" />}
          {renderTable(outgoing, 'text-red')}
        </>
      )}

      {payments.length === 0 && (
        <div className="px-5 py-8 text-center text-[13px] text-grey-40">No payments recorded</div>
      )}
    </div>
  )
}
