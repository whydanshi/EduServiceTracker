import { useMemo } from 'react'
import { Package, Layers } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import { e2eServices, e2ePackages } from '../../data/e2ePackages'
import { formatINR } from '../../utils/pnlCalculator'

export default function Packages() {
  const serviceMap = useMemo(() => {
    const map = {}
    for (const svc of e2eServices) map[svc.id] = svc
    return map
  }, [])

  return (
    <div>
      <PageHeader title="E2E Packages & Services" />

      <div className="bg-white border border-grey-20 rounded-xl overflow-hidden mb-6">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-grey-10">
          <Layers className="w-4 h-4 text-grey-40" />
          <h3 className="text-[14px] font-semibold text-grey-95">Services</h3>
          <span className="text-[11px] text-grey-40 ml-auto">{e2eServices.length} services</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-grey-5 border-b border-grey-20">
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Service Name</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">GBP Cost</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">INR Cost</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Currency</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-grey-40 uppercase tracking-wider">Category</th>
              </tr>
            </thead>
            <tbody>
              {e2eServices.map(svc => (
                <tr key={svc.id} className="border-b border-grey-10 last:border-b-0">
                  <td className="px-5 py-3.5 text-[13px] font-medium text-grey-95">{svc.name}</td>
                  <td className="px-5 py-3.5 text-[13px] text-grey-70">{svc.costGBP != null ? `£${svc.costGBP.toLocaleString()}` : '—'}</td>
                  <td className="px-5 py-3.5 text-[13px] text-grey-70">{formatINR(svc.costINR)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      svc.currency === 'GBP' ? 'bg-purple-light text-purple' : 'bg-info-light text-info'
                    }`}>
                      {svc.currency}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-grey-60 uppercase">{svc.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-grey-10">
          <Package className="w-4 h-4 text-grey-40" />
          <h3 className="text-[14px] font-semibold text-grey-95">Packages</h3>
          <span className="text-[11px] text-grey-40 ml-auto">{e2ePackages.length} packages</span>
        </div>
        <div className="grid grid-cols-2 gap-4 p-5">
          {e2ePackages.map(pkg => (
            <div key={pkg.id} className="border border-grey-20 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-grey-5 border-b border-grey-10 flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-semibold text-grey-95">{pkg.name}</p>
                  <p className="text-[11px] text-grey-40 mt-0.5">{pkg.id}</p>
                </div>
                {pkg.expectedMargin > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-light text-green">
                    {pkg.expectedMargin.toFixed(1)}% margin
                  </span>
                )}
              </div>
              <div className="px-4 py-3 space-y-3">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-[11px] text-grey-40 uppercase tracking-wider">MSP (GST)</p>
                    <p className="text-[15px] font-bold text-grey-95">{formatINR(pkg.mspGST)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-grey-40 uppercase tracking-wider">MSP (No GST)</p>
                    <p className="text-[15px] font-bold text-grey-70">{formatINR(pkg.mspNoGST)}</p>
                  </div>
                </div>
                {pkg.serviceIds.length > 0 && (
                  <div>
                    <p className="text-[11px] text-grey-40 uppercase tracking-wider mb-1.5">Included Services</p>
                    <div className="flex flex-wrap gap-1.5">
                      {pkg.serviceIds.map(sid => (
                        <span key={sid} className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-grey-10 text-grey-60">
                          {serviceMap[sid]?.name || sid}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
