import { useMemo, useState } from 'react'
import { ArrowUp, ArrowDown, TrendingUp, IndianRupee, ReceiptIndianRupee, Landmark, PiggyBank, BarChart3 } from 'lucide-react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, BarChart, Area, AreaChart,
} from 'recharts'
import { getFinancialMetrics, getEnhancedFinancialMetrics, getPerStudentCostBreakdown } from '../../utils/dashboardData'
import { formatINR, formatPct } from '../../utils/pnlCalculator'

const PRODUCT_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4']

function inrShort(amount) {
  if (Math.abs(amount) >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
  if (Math.abs(amount) >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (Math.abs(amount) >= 1000) return `₹${(amount / 1000).toFixed(0)}K`
  return `₹${amount}`
}

function KPICard({ icon: Icon, label, value, sub, subColor, accentColor = 'blue' }) {
  const borderColors = {
    blue: 'border-t-blue-500', green: 'border-t-green-500', amber: 'border-t-amber-500',
    purple: 'border-t-purple-500', red: 'border-t-red-500', teal: 'border-t-teal-500',
  }
  const iconColors = {
    blue: 'bg-blue-800 text-white shadow-sm',
    green: 'bg-emerald-800 text-white shadow-sm',
    amber: 'bg-amber-700 text-white shadow-sm',
    purple: 'bg-violet-800 text-white shadow-sm',
    red: 'bg-red-700 text-white shadow-sm',
    teal: 'bg-teal-800 text-white shadow-sm',
  }
  return (
    <div className={`bg-white border border-grey-20 border-t-[3px] ${borderColors[accentColor]} rounded-xl p-4`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColors[accentColor]}`}>
          <Icon className="w-4.5 h-4.5" strokeWidth={2.25} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-slate-600 font-semibold uppercase tracking-wider mb-1">{label}</p>
          <p className="text-[20px] font-bold text-slate-900 leading-tight">{value}</p>
          {sub && <p className={`text-[11px] mt-1 font-medium ${subColor || 'text-slate-600'}`}>{sub}</p>}
        </div>
      </div>
    </div>
  )
}

function capPaymentModes(modes, limit = 5) {
  if (modes.length <= limit) return modes
  const top = modes.slice(0, limit)
  const rest = modes.slice(limit)
  const othersValue = rest.reduce((sum, m) => sum + m.value, 0)
  return [...top, { name: 'Others', value: othersValue }]
}

export default function FinancialsTab({ data, filters, role }) {
  const fin = useMemo(() => getFinancialMetrics(data, filters), [data, filters])
  const enhanced = useMemo(() => getEnhancedFinancialMetrics(data, filters), [data, filters])
  const [selectedCostProduct, setSelectedCostProduct] = useState('E2E (UK)')

  const filteredMonthly = useMemo(() => {
    if (filters.month && filters.month !== 'all') {
      return fin.monthlyData.filter(m => m.month === filters.month)
    }
    return fin.monthlyData
  }, [fin.monthlyData, filters.month])

  const cappedPaymentModes = useMemo(() => capPaymentModes(fin.paymentModes), [fin.paymentModes])
  const costBreakdown = useMemo(() => getPerStudentCostBreakdown(selectedCostProduct), [selectedCostProduct])
  const costTotal = useMemo(() => costBreakdown.reduce((sum, c) => sum + c.amount, 0), [costBreakdown])

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          icon={IndianRupee} accentColor="blue"
          label="Total Revenue"
          value={inrShort(enhanced.totalRevenue)}
          sub={`${enhanced.totalStudents} student${enhanced.totalStudents !== 1 ? 's' : ''}`}
        />
        <KPICard
          icon={ReceiptIndianRupee} accentColor="green"
          label="Net Revenue (excl. GST)"
          value={inrShort(enhanced.netRevenueExGST)}
          sub={`GST: -${inrShort(enhanced.totalGST)}`}
          subColor="text-red-500"
        />
        <KPICard
          icon={Landmark} accentColor="purple"
          label="Loan Subvention Cost"
          value={inrShort(enhanced.totalLoanSubvention)}
          sub={`On ${inrShort(enhanced.totalLoanAmount)} loan`}
        />
        <KPICard
          icon={TrendingUp} accentColor="teal"
          label="Net Cash Inflow"
          value={inrShort(enhanced.netCashInflow)}
          sub="Net Rev - Subvention"
        />
        <KPICard
          icon={PiggyBank} accentColor="red"
          label="Cost of Services"
          value={inrShort(enhanced.totalCost)}
          sub={`~${inrShort(enhanced.costPerStudent)} / student`}
          subColor="text-red-600"
        />
        <KPICard
          icon={BarChart3} accentColor={enhanced.expectedPnL >= 0 ? 'green' : 'red'}
          label="Expected P&L"
          value={inrShort(Math.abs(enhanced.expectedPnL))}
          sub={enhanced.expectedPnL >= 0 ? '▲ Profitable' : '▼ Loss'}
          subColor={enhanced.expectedPnL >= 0 ? 'text-green-600' : 'text-red-600'}
        />
      </div>

      {/* Expected Gross Margin Hero Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl p-6 text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <p className="text-[12px] uppercase tracking-wider text-teal-50 font-semibold mb-1">Expected Gross Margin (P&L)</p>
          <p className="text-[32px] font-bold leading-tight">{inrShort(enhanced.expectedPnL)}</p>
          <p className="text-[12px] text-teal-50/95 mt-1">
            Net Revenue: {inrShort(enhanced.netRevenueExGST)} · Subvention: {inrShort(enhanced.totalLoanSubvention)} · Cost: {inrShort(enhanced.totalCost)}
          </p>
        </div>
        <div className="flex items-center gap-6 lg:gap-8">
          <div className="text-center">
            <p className="text-[22px] font-bold">{formatPct(enhanced.marginPct)}</p>
            <p className="text-[11px] text-teal-50 font-medium uppercase tracking-wider">Margin %</p>
          </div>
          <div className="text-center">
            <p className="text-[22px] font-bold">{enhanced.totalStudents.toLocaleString()}</p>
            <p className="text-[11px] text-teal-50 font-medium uppercase tracking-wider">Students</p>
          </div>
          <div className="text-center">
            <p className="text-[22px] font-bold">{inrShort(enhanced.avgRevPerStudent)}</p>
            <p className="text-[11px] text-teal-50 font-medium uppercase tracking-wider">Avg Rev/Student</p>
          </div>
          <div className="text-center">
            <p className="text-[22px] font-bold">{formatPct(enhanced.loanPct)}</p>
            <p className="text-[11px] text-teal-50 font-medium uppercase tracking-wider">Loan %</p>
          </div>
        </div>
      </div>

      {/* Product-wise Financial Summary — directly under hero */}
      {enhanced.products.length > 0 && (
        <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200">
            <h3 className="text-[14px] font-semibold text-slate-900">Product-wise Financial Summary</h3>
            <p className="text-[11px] text-slate-600 mt-0.5">Revenue, cost, margin and student data for selected filters</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  {['Product', 'Revenue', 'Net Rev (-GST)', 'Loan Sub.', 'Net Cash', 'Cost', 'Gross Margin', 'Margin %', 'Students'].map(h => (
                    <th key={h} className={`px-4 py-2.5 text-[11px] font-bold text-slate-800 uppercase tracking-wider ${h !== 'Product' ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-grey-10">
                {enhanced.products.map((p, i) => (
                  <tr key={p.name} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 text-[13px] font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color || PRODUCT_COLORS[i] }} />
                        {p.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-slate-800 text-right tabular-nums">{inrShort(p.revenue)}</td>
                    <td className="px-4 py-3 text-[13px] text-slate-800 text-right tabular-nums">{inrShort(p.netRevenue)}</td>
                    <td className="px-4 py-3 text-[13px] text-slate-800 text-right tabular-nums">{inrShort(p.loanSub)}</td>
                    <td className="px-4 py-3 text-[13px] text-slate-800 text-right tabular-nums">{inrShort(p.netCash)}</td>
                    <td className="px-4 py-3 text-[13px] text-slate-800 text-right tabular-nums">{inrShort(p.cost)}</td>
                    <td className="px-4 py-3 text-[13px] font-semibold text-right tabular-nums">
                      <span className={`inline-flex items-center gap-0.5 ${p.grossMargin >= 0 ? 'text-emerald-800' : 'text-red-700'}`}>
                        {p.grossMargin >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        {inrShort(Math.abs(p.grossMargin))}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-[13px] font-semibold text-right tabular-nums ${p.marginPct >= 0 ? 'text-emerald-800' : 'text-red-700'}`}>
                      {formatPct(p.marginPct)}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-slate-900 font-semibold text-right tabular-nums">{p.students.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="bg-slate-100 font-semibold border-t-2 border-slate-200">
                  <td className="px-4 py-3 text-[13px] text-slate-900">Total</td>
                  <td className="px-4 py-3 text-[13px] text-slate-900 text-right tabular-nums">{inrShort(enhanced.totalRevenue)}</td>
                  <td className="px-4 py-3 text-[13px] text-slate-900 text-right tabular-nums">{inrShort(enhanced.netRevenueExGST)}</td>
                  <td className="px-4 py-3 text-[13px] text-slate-900 text-right tabular-nums">{inrShort(enhanced.totalLoanSubvention)}</td>
                  <td className="px-4 py-3 text-[13px] text-slate-900 text-right tabular-nums">{inrShort(enhanced.netCashInflow)}</td>
                  <td className="px-4 py-3 text-[13px] text-slate-900 text-right tabular-nums">{inrShort(enhanced.totalCost)}</td>
                  <td className="px-4 py-3 text-[13px] font-semibold text-right tabular-nums">
                    <span className={enhanced.expectedPnL >= 0 ? 'text-emerald-800' : 'text-red-700'}>
                      {inrShort(Math.abs(enhanced.expectedPnL))}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-[13px] font-semibold text-right tabular-nums ${enhanced.marginPct >= 0 ? 'text-emerald-800' : 'text-red-700'}`}>
                    {formatPct(enhanced.marginPct)}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-slate-900 font-semibold text-right tabular-nums">{enhanced.totalStudents.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Revenue Analytics: Monthly Revenue by Product + Product Revenue Share */}
      <div className="border-b border-grey-10 pb-1 mb-2">
        <h2 className="text-[13px] font-semibold text-grey-50 uppercase tracking-wider">Revenue Analytics</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-grey-20 rounded-xl p-5">
          <h3 className="text-[14px] font-semibold text-grey-95 mb-1">Monthly Revenue by Product</h3>
          <p className="text-[11px] text-grey-40 mb-4">Stacked revenue in ₹ — updates by month & product filter</p>
          {enhanced.monthlyByProduct.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={enhanced.monthlyByProduct} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => inrShort(v)} />
                <Tooltip formatter={(val) => [inrShort(val)]} contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="E2E (UK)" stackId="rev" fill="#3B82F6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Germany" stackId="rev" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-grey-40 text-[13px]">No revenue data</div>
          )}
        </div>

        <div className="bg-white border border-grey-20 rounded-xl p-5">
          <h3 className="text-[14px] font-semibold text-grey-95 mb-1">Product Revenue Share</h3>
          <p className="text-[11px] text-grey-40 mb-4">Proportional contribution — selected period</p>
          {enhanced.products.length > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={enhanced.products.map(p => ({ name: p.name, value: p.revenue }))}
                    cx="50%" cy="50%" innerRadius={50} outerRadius={85}
                    paddingAngle={4} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {enhanced.products.map((p, i) => (
                      <Cell key={p.name} fill={p.color || PRODUCT_COLORS[i % PRODUCT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [inrShort(val)]} contentStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 mt-2 w-full">
                {enhanced.products.map((p, i) => {
                  const pct = enhanced.totalRevenue > 0 ? ((p.revenue / enhanced.totalRevenue) * 100).toFixed(1) : 0
                  return (
                    <div key={p.name} className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: p.color || PRODUCT_COLORS[i] }} />
                        <span className="text-[12px] text-grey-70">{p.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[12px] font-semibold text-grey-90">{inrShort(p.revenue)}</span>
                        <span className="text-[11px] text-grey-40 ml-2">{pct}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-grey-40 text-[13px]">No data</div>
          )}
        </div>
      </div>

      {/* Margin & P&L Analysis */}
      <div className="border-b border-grey-10 pb-1 mb-2">
        <h2 className="text-[13px] font-semibold text-grey-50 uppercase tracking-wider">Margin & P&L Analysis</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-grey-20 rounded-xl p-5">
          <h3 className="text-[14px] font-semibold text-grey-95 mb-1">Revenue vs Cost vs Gross Margin</h3>
          <p className="text-[11px] text-grey-40 mb-4">Monthly comparison — Net Revenue, Cost of Services, and Gross Margin</p>
          {enhanced.monthlyPnL.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={enhanced.monthlyPnL} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={v => inrShort(v)} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={v => `${v.toFixed(0)}%`} domain={[0, 60]} />
                <Tooltip
                  formatter={(val, name) => name === 'Margin %' ? [`${Number(val).toFixed(1)}%`, name] : [inrShort(val), name]}
                  contentStyle={{ fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar yAxisId="left" dataKey="revenue" name="Net Revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={28} />
                <Bar yAxisId="left" dataKey="cost" name="Cost of Services" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={28} />
                <Line yAxisId="right" type="monotone" dataKey="marginPct" name="Margin %" stroke="#10B981" strokeWidth={2} dot={{ r: 4, fill: '#10B981' }} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-grey-40 text-[13px]">No data for selected period</div>
          )}
        </div>

        <div className="bg-white border border-grey-20 rounded-xl p-5">
          <h3 className="text-[14px] font-semibold text-grey-95 mb-1">Product P&L Breakdown</h3>
          <p className="text-[11px] text-grey-40 mb-4">Revenue vs Cost per product in selected period</p>
          {enhanced.products.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={enhanced.products} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => inrShort(v)} />
                <Tooltip formatter={(val) => [inrShort(val)]} contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="revenue" name="Revenue (₹)" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={36} />
                <Bar dataKey="cost" name="Cost of Services (₹)" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={36} />
                <Bar dataKey="grossMargin" name="Gross Margin (₹)" fill="#10B981" radius={[4, 4, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-grey-40 text-[13px]">No data</div>
          )}
        </div>
      </div>

      {/* Payment & Cost Breakdown */}
      <div className="border-b border-grey-10 pb-1 mb-2">
        <h2 className="text-[13px] font-semibold text-grey-50 uppercase tracking-wider">Payment & Cost Breakdown</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Mode Breakdown */}
        {cappedPaymentModes.length > 0 && (
          <div className="bg-white border border-grey-20 rounded-xl p-5">
            <h3 className="text-[14px] font-semibold text-grey-95 mb-1">Payment Mode Breakdown</h3>
            <p className="text-[11px] text-grey-40 mb-4">UK Account · Loan · Indian Bank — monthly</p>
            <div className="space-y-3">
              {cappedPaymentModes.map((entry, i) => {
                const totalPM = cappedPaymentModes.reduce((s, m) => s + m.value, 0)
                const pct = totalPM > 0 ? (entry.value / totalPM * 100) : 0
                return (
                  <div key={entry.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PRODUCT_COLORS[i % PRODUCT_COLORS.length] }} />
                        <span className="text-[12px] text-grey-70">{entry.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-semibold text-grey-90">{inrShort(entry.value)}</span>
                        <span className="text-[11px] text-grey-40">{pct.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-grey-10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: PRODUCT_COLORS[i % PRODUCT_COLORS.length] }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Monthly Student Enrollments */}
        <div className="bg-white border border-grey-20 rounded-xl p-5">
          <h3 className="text-[14px] font-semibold text-grey-95 mb-1">Student Enrollments</h3>
          <p className="text-[11px] text-grey-40 mb-4">Monthly intake per product line</p>
          {enhanced.monthlyByProduct.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={enhanced.monthlyByProduct} margin={{ left: 0, right: 5, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="E2E (UK)" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Germany" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-grey-40 text-[13px]">No data</div>
          )}
        </div>

        {/* Per-Student Cost Breakdown */}
        <div className="bg-white border border-grey-20 rounded-xl p-5">
          <h3 className="text-[14px] font-semibold text-grey-95 mb-1">Cost of Services</h3>
          <p className="text-[11px] text-grey-40 mb-3">Per-student cost components by product</p>
          <div className="flex items-center gap-2 mb-4">
            {enhanced.products.map(p => (
              <button
                key={p.name}
                onClick={() => setSelectedCostProduct(p.name)}
                className={`px-3 py-1 text-[11px] font-medium rounded-md transition-colors ${
                  selectedCostProduct === p.name
                    ? 'bg-grey-90 text-white'
                    : 'bg-grey-5 text-grey-50 hover:text-grey-70'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-grey-40 mb-2">Showing: {selectedCostProduct} per-student costs</p>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {costBreakdown.map(item => (
              <div key={item.name} className="flex items-center justify-between py-1.5 border-b border-grey-5 last:border-0">
                <span className="text-[12px] text-grey-70">{item.name}</span>
                <span className="text-[12px] font-semibold text-grey-90">{formatINR(item.amount)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-grey-20">
            <span className="text-[12px] font-semibold text-grey-90">Total Per Student</span>
            <span className="text-[14px] font-bold text-grey-95">{formatINR(costTotal)}</span>
          </div>
        </div>
      </div>

      {/* Bank Account Breakdown */}
      {fin.bankAccounts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-grey-20 rounded-xl p-5">
            <h3 className="text-[14px] font-semibold text-grey-95 mb-4">Bank Account Breakdown</h3>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie data={fin.bankAccounts} cx="50%" cy="50%" innerRadius={40} outerRadius={75} paddingAngle={3} dataKey="value" nameKey="name">
                    {fin.bankAccounts.map((_, i) => (
                      <Cell key={i} fill={PRODUCT_COLORS[(i + 2) % PRODUCT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [inrShort(val)]} contentStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5">
                {fin.bankAccounts.map((entry, i) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PRODUCT_COLORS[(i + 2) % PRODUCT_COLORS.length] }} />
                    <span className="text-[11px] text-grey-70 min-w-[90px]">{entry.name}</span>
                    <span className="text-[11px] font-semibold text-grey-90">{inrShort(entry.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
