import { useMemo } from 'react'
import { Users, CheckCircle2, Clock, TrendingUp, ShieldCheck } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
} from 'recharts'
import {
  getStudentMetrics, getIntakeStageMatrix, getJourneyPipelineData,
  getStageMixByMonth, getJourneyTrendData, getServiceCompletionTrend,
  getSalesServiceGapData, getMonthlyEnrollmentsByProduct,
} from '../../utils/dashboardData'
import { getDashboardStageHeader, getDashboardStageTooltip, getPipelineStageLabel } from '../../utils/dashboardStageLabels'
import POCHeatmap from '../e2e/POCHeatmap'
import CityHeatmap from '../shared/CityHeatmap'

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#6366F1', '#14B8A6', '#A855F7']

const PIPELINE_COLORS = {
  Lead: '#94A3B8', Enrolled: '#3B82F6', 'Partial Payment': '#F59E0B', 'Payment Complete': '#10B981',
  'Pre-Service': '#94A3B8', 'Awaiting Services': '#F59E0B', 'Services Initiated': '#3B82F6',
  'In Progress': '#8B5CF6', 'Fully Serviced': '#10B981',
}

const STAGE_MIX_COLORS = {
  'Payment Complete': '#10B981', 'Partial Payment': '#F59E0B', Enrolled: '#3B82F6', Lead: '#94A3B8',
}

const SERVICE_TREND_COLORS = {
  'Fully Serviced': '#10B981', 'In Progress': '#8B5CF6', 'Services Initiated': '#3B82F6',
  'Awaiting Services': '#F59E0B', 'Pre-Service': '#94A3B8',
}

function ChartCard({ title, description, children, className = '' }) {
  return (
    <div className={`bg-white border border-grey-20 rounded-xl p-5 ${className}`}>
      <h3 className="text-[14px] font-semibold text-slate-900">{title}</h3>
      {description && <p className="text-[11px] text-slate-600 mt-1 mb-4 leading-snug">{description}</p>}
      {children}
    </div>
  )
}

function SectionHeading({ title, description }) {
  return (
    <div className="border-b border-grey-10 pb-1 mb-2">
      <h2 className="text-[13px] font-semibold text-slate-700 uppercase tracking-wider">{title}</h2>
      {description && <p className="text-[11px] text-slate-600 mt-1 normal-case font-normal tracking-normal">{description}</p>}
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, sub, color = 'blue' }) {
  const colorMap = {
    blue: 'bg-blue-50/10 text-blue-600', green: 'bg-green-50/10 text-green-600',
    amber: 'bg-amber-50/10 text-amber-600', purple: 'bg-purple-50/10 text-purple-600',
    red: 'bg-red-50/10 text-red-600', teal: 'bg-teal-50/10 text-teal-600',
  }
  return (
    <div className="bg-white border border-grey-20 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-grey-50 font-medium uppercase tracking-wider">{label}</p>
          <p className="text-[20px] font-bold text-grey-95 leading-tight">{value}</p>
          {sub && <p className="text-[11px] text-grey-40 mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  )
}

function PipelineBar({ stages, title, label }) {
  const total = stages.reduce((sum, s) => sum + s.count, 0)
  if (total === 0) return null
  const active = stages.filter(s => s.count > 0)
  return (
    <div className="bg-white border border-grey-20 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-grey-95">{title}</h3>
        <span className="text-[11px] px-2 py-0.5 bg-grey-5 text-grey-50 rounded-md font-medium">{label}</span>
      </div>
      <div className="flex rounded-lg overflow-hidden min-h-[52px]">
        {active.map(s => {
          const tip = `${s.stage}: ${s.count.toLocaleString()} (${s.pct.toFixed(1)}%)`
          const showCount = s.pct >= 5
          return (
            <div
              key={s.stage}
              title={tip}
              aria-label={tip}
              className="flex items-center justify-center min-w-0 px-0.5 py-2 transition-colors hover:brightness-110 cursor-default"
              style={{ flex: `${Math.max(s.pct, 0.02)} 1 0%`, backgroundColor: PIPELINE_COLORS[s.stage] || '#94A3B8' }}
            >
              {showCount ? (
                <span className="text-white font-bold text-[clamp(11px,2.5vw,16px)] leading-none tabular-nums truncate max-w-full text-center">
                  {s.count.toLocaleString()}
                </span>
              ) : null}
            </div>
          )
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
        {active.map(s => (
          <div key={s.stage} className="flex items-start gap-1.5 max-w-[min(100%,220px)]">
            <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ backgroundColor: PIPELINE_COLORS[s.stage] || '#94A3B8' }} />
            <span className="text-[11px] text-slate-700 leading-snug">
              <span className="font-semibold text-slate-900">{getPipelineStageLabel(s.stage)}</span>
              {' '}
              <span className="text-slate-500">{s.count.toLocaleString()} · {s.pct.toFixed(1)}%</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function StudentsTab({ data, role, filters }) {
  const geo = filters?.country || 'all'
  const metrics = useMemo(() => getStudentMetrics(data, geo), [data, geo])
  const { stages, matrix, grandTotal } = useMemo(() => getIntakeStageMatrix(data, geo), [data, geo])
  const pipeline = useMemo(() => getJourneyPipelineData(data, geo), [data, geo])
  const stageMix = useMemo(() => getStageMixByMonth(data, geo), [data, geo])
  const journeyTrend = useMemo(() => getJourneyTrendData(data, geo), [data, geo])
  const serviceTrend = useMemo(() => getServiceCompletionTrend(data, geo), [data, geo])
  const salesServiceGap = useMemo(() => getSalesServiceGapData(data, geo), [data, geo])
  const monthlyEnrollments = useMemo(() => getMonthlyEnrollmentsByProduct(data, geo), [data, geo])

  const conversionRate = metrics.totalCount > 0 ? ((metrics.convertedCount / metrics.totalCount) * 100) : 0
  const fullyServiced = pipeline.servicePipeline.find(s => s.stage === 'Fully Serviced')?.count || 0
  const serviceRate = metrics.totalCount > 0 ? ((fullyServiced / metrics.totalCount) * 100) : 0

  const intakeChartData = useMemo(() =>
    Object.entries(metrics.intakeDistribution)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    [metrics.intakeDistribution]
  )

  const hasGermany = data.germanyLeads.length > 0
  const hasE2E = data.e2eStudents.length > 0

  return (
    <div className="space-y-6">
      <p className="text-[11px] text-slate-600 -mt-2 mb-1">
        KPIs reflect the same scope as the filters above (intake / region). Total students = Germany leads + E2E students in scope.
      </p>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard icon={Users} label="Total Students" value={metrics.totalCount.toLocaleString()} sub={`${metrics.germanyCount + metrics.e2eCount} across products`} color="blue" />
        <MetricCard icon={CheckCircle2} label="Payment Complete" value={metrics.convertedCount} sub={`${conversionRate.toFixed(1)}% conversion rate`} color="green" />
        <MetricCard icon={Clock} label="In Progress" value={metrics.pendingServices} sub={`${metrics.totalCount - metrics.convertedCount} leads remaining`} color="amber" />
        <MetricCard icon={ShieldCheck} label="Fully Serviced" value={fullyServiced} sub={`${serviceRate.toFixed(0)}% service rate`} color="teal" />
        <MetricCard icon={TrendingUp} label="Conversion Rate" value={`${conversionRate.toFixed(1)}%`} sub={`${metrics.convertedCount} of ${metrics.totalCount} complete`} color="purple" />
      </div>

      {/* Student Stage Distribution — directly under KPI cards */}
      {matrix.length > 0 && (
        <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200">
            <h3 className="text-[14px] font-semibold text-slate-900">Student stage distribution</h3>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              Count of students by canonical intake (rows) and pipeline stage (columns). Germany stages follow the service/journey model; E2E stages are prefixed &quot;E2E —&quot;. With <span className="font-medium">Global</span>, columns combine both product lines.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-indigo-800 text-white">
                  <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider sticky left-0 bg-indigo-800 z-10 border-r border-indigo-700">Intake</th>
                  {stages.map(s => {
                    const tip = getDashboardStageTooltip(s)
                    return (
                      <th
                        key={s}
                        title={tip || undefined}
                        className="px-3 py-2.5 text-[11px] font-bold text-center whitespace-nowrap max-w-[140px] leading-tight"
                      >
                        {getDashboardStageHeader(s)}
                      </th>
                    )
                  })}
                  <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-center">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {matrix.map((row, idx) => (
                  <tr key={row.intake} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className={`px-4 py-2.5 text-[12px] font-semibold text-slate-900 sticky left-0 z-10 border-r border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                      {row.intake}
                    </td>
                    {stages.map(s => (
                      <td key={s} className="px-3 py-2.5 text-[12px] text-slate-800 font-medium text-center tabular-nums">
                        {row[s] || 0}
                      </td>
                    ))}
                    <td className="px-3 py-2.5 text-[12px] font-bold text-slate-900 text-center tabular-nums">{row._total}</td>
                  </tr>
                ))}
                <tr className="bg-slate-200 font-bold border-t-2 border-slate-300">
                  <td className="px-4 py-2.5 text-[12px] text-slate-900 sticky left-0 bg-slate-200 z-10 border-r border-slate-300">Grand Total</td>
                  {stages.map(s => (
                    <td key={s} className="px-3 py-2.5 text-[12px] text-slate-900 text-center tabular-nums">{grandTotal[s] || 0}</td>
                  ))}
                  <td className="px-3 py-2.5 text-[12px] text-slate-900 text-center tabular-nums">{grandTotal._total}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <SectionHeading
        title="Journey pipelines"
        description="Sales journey: payment / enrolment stages. Service journey: delivery stages. Counts in the bar; full labels in the legend below each bar."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PipelineBar stages={pipeline.salesPipeline} title="Sales journey" label="Payment status" />
        <PipelineBar stages={pipeline.servicePipeline} title="Service journey" label="Service delivery" />
      </div>

      <SectionHeading
        title="Enrollment analytics"
        description="New records by month, split by region (E2E vs Germany). Intake share shows distribution of students across intake labels — not product lines."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {monthlyEnrollments.length > 0 && (
          <ChartCard
            title="Monthly enrollments by region"
            description="Stacked student counts by month. E2E (UK) vs Germany — not Italy/MBBS product tags unless added to data."
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyEnrollments} margin={{ left: 5, right: 5, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="E2E (UK)" stackId="enroll" fill="#3B82F6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Germany" stackId="enroll" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {intakeChartData.length > 0 && (
          <ChartCard
            title="Intake share"
            description="Share of students by canonical intake (Summer/Winter seasons). This is not a product mix chart."
          >
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="55%" height={240}>
                <PieChart>
                  <Pie data={intakeChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="count" nameKey="name">
                    {intakeChartData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [val, 'Students']} contentStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {intakeChartData.map((entry, i) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-[12px] text-grey-70">{entry.name}</span>
                    <span className="text-[12px] font-semibold text-grey-90">{entry.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        )}
      </div>

      <SectionHeading
        title="Payment and service trends"
        description="Stage mix shows % composition each month (how the funnel mix changes). Journey trend shows headcounts (volume). Service completion trend uses fulfilment stages — different legend from payment stages."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {stageMix.length > 0 && (
          <ChartCard
            title="Stage mix by month"
            description="100% stacked: share of students in each payment stage per month. Answers &quot;what % are in partial vs complete&quot; — not raw volume."
          >
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={stageMix} margin={{ left: 0, right: 5, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} domain={[0, 100]} />
                <Tooltip formatter={(val) => [`${val}%`]} contentStyle={{ fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {Object.entries(STAGE_MIX_COLORS).map(([key, color]) => (
                  <Area key={key} type="monotone" dataKey={key} stackId="mix" fill={color} stroke={color} fillOpacity={0.8} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {journeyTrend.length > 0 && (
          <ChartCard
            title="Journey stage trend (payment)"
            description="Number of students in each payment stage per month — same stages as stage mix, but as counts (volume), not percentages."
          >
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={journeyTrend} margin={{ left: 0, right: 5, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="Payment Complete" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Partial Payment" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Enrolled" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Lead" stroke="#94A3B8" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {serviceTrend.length > 0 && (
          <ChartCard
            title="Service completion trend"
            description="Headcount in each service-delivery stage by month (pre-service through fully serviced)."
          >
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={serviceTrend} margin={{ left: 0, right: 5, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {Object.entries(SERVICE_TREND_COLORS).map(([key, color]) => (
                  <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={2} dot={{ r: 3 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {salesServiceGap.length > 0 && (
        <>
          <SectionHeading
            title="Sales vs service gap"
            description="Per region: students who reached payment complete vs fully serviced. Gap = paid but not yet fully serviced (backlog)."
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Payment vs fulfilment" description="Compare payment-complete count to fully serviced; orange gap is the backlog.">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={salesServiceGap} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="paid" name="Payment Complete" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="serviced" name="Fully Serviced" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="gap" name="Gap" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}

      {/* City/State Heatmap */}
      {hasGermany && (geo === 'all' || geo === 'germany') && (
        <CityHeatmap
          leads={data.germanyLeads}
          role="admin"
          title="Leads by City"
          hideDateSelect
          variant="adminDedup"
        />
      )}

      {/* POC Heatmap */}
      {hasE2E && (geo === 'all' || geo === 'e2e') && (
        <>
          <SectionHeading
            title="E2E margin by POC"
            description="UK E2E students only. Each bar is the average of per-student deal margin % (same P&amp;L formula). Sales POC vs Service POC only changes which field we group by — not two different margin definitions."
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <POCHeatmap
              students={data.e2eStudents}
              pocField="salesPOC"
              title="E2E margin by sales POC"
              description="Average deal margin % for students attributed to each sales POC (closing / ownership field)."
            />
            <POCHeatmap
              students={data.e2eStudents}
              pocField="servicePOC"
              title="E2E margin by service POC"
              description="Average deal margin % for students attributed to each service POC (delivery owner). Same margin formula as sales side; different grouping."
            />
          </div>
        </>
      )}
    </div>
  )
}
