import { useState, useRef, useEffect } from 'react'
import { Globe, RefreshCw } from 'lucide-react'
import { GBP_BASE_RATE } from '../../data/e2ePackages'
import { fetchGBPRate } from '../../data/currencyRates'

export default function FXRatePopover() {
  const [open, setOpen] = useState(false)
  const [rate, setRate] = useState(GBP_BASE_RATE)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const liveRate = await fetchGBPRate()
      setRate(parseFloat(Number(liveRate || GBP_BASE_RATE).toFixed(2)))
      setLastUpdated(new Date())
    } catch {
      setRate(parseFloat(Number(GBP_BASE_RATE).toFixed(2)))
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) handleRefresh()
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg text-grey-40 hover:text-blue-90 hover:bg-blue-10 transition-colors"
        title="Live FX Rate"
      >
        <Globe className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-64 bg-white border border-grey-20 rounded-xl shadow-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-grey-10 flex items-center justify-between">
            <span className="text-[12px] font-semibold text-grey-95">Live FX Rate</span>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-1 rounded hover:bg-grey-10 text-grey-40 hover:text-grey-70 transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="px-4 py-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[18px]">🇬🇧</span>
                <span className="text-[12px] font-medium text-grey-60">GBP → INR</span>
              </div>
              <span className="text-[16px] font-bold text-grey-95">₹{rate}</span>
            </div>
            <div className="text-[11px] text-grey-40">
              Last updated: {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="bg-grey-5 rounded-lg px-3 py-2">
              <p className="text-[11px] text-grey-60">
                Service costs denominated in GBP are converted at this rate. Refresh to simulate a live update.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
