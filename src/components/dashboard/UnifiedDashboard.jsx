import { useState, useMemo } from 'react'
import { Download } from 'lucide-react'
import PageHeader from '../layout/PageHeader'
import DashboardFilters from './DashboardFilters'
import StudentsTab from './StudentsTab'
import FinancialsTab from './FinancialsTab'
import { scopeDataByRole, applyFilters, getAvailableCountries } from '../../utils/dashboardData'
import { exportStudentsOverview, exportFinancialsOverview } from '../../utils/excelExport'

export default function UnifiedDashboard({ role }) {
  const [activeTab, setActiveTab] = useState('students')
  const [filters, setFilters] = useState({ country: 'all', intake: 'all', month: 'all' })

  const countries = useMemo(() => getAvailableCountries(role), [role])
  const scopedData = useMemo(() => scopeDataByRole(role), [role])
  const filteredData = useMemo(() => applyFilters(scopedData, filters), [scopedData, filters])

  const handleExport = () => {
    if (activeTab === 'students') {
      exportStudentsOverview(filteredData)
    } else {
      exportFinancialsOverview(filteredData, filters)
    }
  }

  return (
    <>
      <PageHeader title="Dashboard">
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-white border border-grey-20 rounded-lg text-grey-70 hover:bg-grey-5 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
      </PageHeader>

      {/* Tab bar + global filters in a single row */}
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        {/* Tab-style navigation */}
        <div className="flex items-center border-b border-grey-20">
          {[
            { key: 'students', label: 'Students' },
            { key: 'financials', label: 'Financials' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 text-[13px] font-medium transition-colors relative ${
                activeTab === tab.key
                  ? 'text-blue-600'
                  : 'text-grey-50 hover:text-grey-70'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-t" />
              )}
            </button>
          ))}
        </div>

        <DashboardFilters
          filters={filters}
          onChange={setFilters}
          countries={countries}
          activeTab={activeTab}
        />
      </div>

      {activeTab === 'students'
        ? <StudentsTab data={filteredData} role={role} filters={filters} />
        : <FinancialsTab data={filteredData} filters={filters} role={role} />}
    </>
  )
}
