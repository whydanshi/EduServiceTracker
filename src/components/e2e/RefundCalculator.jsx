import { useState } from 'react'
import { AlertTriangle, Calculator } from 'lucide-react'
import { calculateRefundAmount, formatINR } from '../../utils/pnlCalculator'

export default function RefundCalculator({ student, onInitiateRefund }) {
  const [calculated, setCalculated] = useState(false)
  const [refundData, setRefundData] = useState(null)

  const handleCalculate = () => {
    const data = calculateRefundAmount(student)
    setRefundData(data)
    setCalculated(true)
  }

  return (
    <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-grey-10 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber" />
        <h3 className="text-[14px] font-semibold text-grey-95">Refund Calculator</h3>
      </div>

      {student.refundDetails && (
        <div className="px-5 py-3 bg-amber-light border-b border-grey-10">
          <p className="text-[12px] text-amber font-medium">Reason: {student.refundDetails.reason}</p>
          <p className="text-[11px] text-grey-60 mt-0.5">Requested: {student.refundDetails.requestedDate} | Status: {student.refundDetails.status}</p>
        </div>
      )}

      <div className="px-5 py-4">
        {!calculated && (
          <button
            onClick={handleCalculate}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-90 text-white text-[13px] font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Calculator className="w-4 h-4" />
            Calculate Refund Amount
          </button>
        )}

        {calculated && refundData && (
          <div className="space-y-4">
            <div className="divide-y divide-grey-10">
              <div className="flex justify-between py-2">
                <span className="text-[12px] text-grey-60 uppercase tracking-wider">Total Received</span>
                <span className="text-[13px] font-semibold text-grey-95">{formatINR(refundData.totalReceived)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[12px] text-grey-60 uppercase tracking-wider">GST Deducted</span>
                <span className="text-[13px] text-grey-70">- {formatINR(refundData.gstAmount)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[12px] text-grey-60 uppercase tracking-wider">Services Provided Cost</span>
                <span className="text-[13px] text-grey-70">- {formatINR(refundData.servicesProvidedCost)}</span>
              </div>
              {refundData.vasCostProvided > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-[12px] text-grey-60 uppercase tracking-wider">VAS Provided Cost</span>
                  <span className="text-[13px] text-grey-70">- {formatINR(refundData.vasCostProvided)}</span>
                </div>
              )}
            </div>

            {refundData.providedServices.length > 0 && (
              <div className="bg-grey-5 rounded-lg p-3">
                <p className="text-[11px] font-semibold text-grey-40 uppercase tracking-wider mb-2">Services Already Provided</p>
                {refundData.providedServices.map((svc, i) => (
                  <div key={i} className="flex justify-between py-1">
                    <span className="text-[12px] text-grey-60">{svc.name}</span>
                    <span className="text-[12px] text-grey-70">{formatINR(svc.cost)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between py-3 bg-amber-light rounded-lg px-4">
              <span className="text-[14px] font-bold text-amber">Refund Amount</span>
              <span className="text-[18px] font-bold text-amber">{formatINR(refundData.refundAmount)}</span>
            </div>

            {onInitiateRefund && (
              <button
                onClick={() => onInitiateRefund(refundData)}
                className="w-full px-4 py-2.5 bg-red text-white text-[13px] font-semibold rounded-lg hover:bg-red/90 transition-colors"
              >
                Process Refund
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
