import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import SearchBar from '../../components/shared/SearchBar'
import FilterPills from '../../components/shared/FilterPills'
import DataTable from '../../components/shared/DataTable'
import { SalesStatusPill, ServiceStatusPill } from '../../components/shared/StatusPill'
import QuickView from '../../components/shared/QuickView'
import { leads } from '../../data/leads'
import { JOURNEY_STEPS } from '../../components/shared/JourneyStepper'
import { Calendar, AlertCircle, Eye, CheckCircle2 } from 'lucide-react'

// Map journey step IDs to display names
const JOURNEY_STAGE_NAMES = {
  documentPrep: 'Document Preparation',
  aps: 'APS',
  virtualCounselling: 'Virtual Counselling',
  universityShortlisting: 'University Shortlisting',
  universityFinalization: 'Universities Finalization',
  universityApplications: 'University Applications',
  applicationReview: 'Application Review',
  offerLetter: 'Offer Letter Received',
}

// Get current journey stage name from lead
const getCurrentStageName = (lead) => {
  if (!lead.journey?.steps) return 'Not Started'
  const currentStepIdx = lead.journey.currentStep ?? 0
  const currentStep = JOURNEY_STEPS[currentStepIdx]
  return currentStep ? JOURNEY_STAGE_NAMES[currentStep.id] || currentStep.label : 'Not Started'
}

// Get next task for the current stage
const getNextTask = (lead) => {
  if (!lead.journey?.steps) return 'View Journey'
  const currentStepIdx = lead.journey.currentStep ?? 0
  const currentStep = JOURNEY_STEPS[currentStepIdx]
  if (!currentStep) return '—'
  const stepData = lead.journey.steps[currentStep.id]
  if (stepData?.status === 'completed') {
    const nextStep = JOURNEY_STEPS[currentStepIdx + 1]
    return nextStep ? `View ${JOURNEY_STAGE_NAMES[nextStep.id] || nextStep.label}` : 'Journey Complete'
  }
  return `View ${JOURNEY_STAGE_NAMES[currentStep.id] || currentStep.label}`
}

// Get all unique journey stages from converted leads
const getJourneyStages = (convertedLeads) => {
  const stages = new Set()
  convertedLeads.forEach(lead => {
    if (lead.journey?.steps) {
      Object.keys(lead.journey.steps).forEach(stepId => {
        const stepData = lead.journey.steps[stepId]
        if (stepData?.status === 'active' || stepData?.status === 'completed') {
          stages.add(stepId)
        }
      })
    }
  })
  return Array.from(stages).map(id => ({
    id,
    label: JOURNEY_STAGE_NAMES[id] || id,
  }))
}

const isOverdue = (dateStr) => {
  if (!dateStr) return false
  const date = new Date(dateStr)
  return date < new Date() && date.toDateString() !== new Date().toDateString()
}

export default function AdminAllStudents() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [quickViewLead, setQuickViewLead] = useState(null)

  // Filter for converted students only (has journey OR serviceStatus === 'Converted')
  const convertedLeads = useMemo(() => {
    return leads.filter(l => l.journey?.started || l.serviceStatus === 'Converted')
  }, [])

  const journeyStages = useMemo(() => getJourneyStages(convertedLeads), [convertedLeads])

  const filters = useMemo(() => [
    { id: 'all', label: 'All', count: convertedLeads.length },
    ...journeyStages.map(s => ({
      id: s.id,
      label: s.label,
      count: convertedLeads.filter(l => {
        const currentStepIdx = l.journey?.currentStep ?? 0
        const currentStep = JOURNEY_STEPS[currentStepIdx]
        return currentStep?.id === s.id
      }).length,
    })),
  ], [convertedLeads, journeyStages])

  const filtered = useMemo(() => {
    let result = activeFilter === 'all'
      ? convertedLeads
      : convertedLeads.filter(l => {
          const currentStepIdx = l.journey?.currentStep ?? 0
          const currentStep = JOURNEY_STEPS[currentStepIdx]
          return currentStep?.id === activeFilter
        })

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(l =>
        l.studentName.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.id?.toLowerCase().includes(q)
      )
    }
    return result
  }, [activeFilter, search, convertedLeads])

  const columns = [
    {
      key: 'studentName', label: 'Student Name',
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-blue-10 border border-blue-40 flex items-center justify-center text-[10px] font-semibold text-blue-90 flex-shrink-0">
            {val.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setQuickViewLead(row) }}
            className="text-left"
          >
            <p className="font-medium text-grey-95 text-[13px] hover:text-blue-90 hover:underline">{val}</p>
            <p className="text-[11px] text-grey-40">{row.id}</p>
          </button>
        </div>
      ),
    },
    {
      key: 'servicePOC', label: 'Service POC',
      render: (val) => <span className="text-grey-60 text-[13px]">{val || 'Unassigned'}</span>,
    },
    {
      key: 'journeyStage', label: 'Current Stage',
      render: (val, row) => {
        const stageName = getCurrentStageName(row)
        const currentStepIdx = row.journey?.currentStep ?? 0
        const currentStep = JOURNEY_STEPS[currentStepIdx]
        const stepData = currentStep ? row.journey?.steps[currentStep.id] : null
        const isCompleted = stepData?.status === 'completed'
        const isActive = stepData?.status === 'active'

        return (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-green' : isActive ? 'bg-blue-90' : 'bg-grey-20'}`} />
            <span className={`text-[12px] font-medium ${isCompleted ? 'text-green' : isActive ? 'text-blue-90' : 'text-grey-60'}`}>
              {stageName}
            </span>
          </div>
        )
      },
    },
    {
      key: 'lastFollowUp', label: 'Last Follow-up',
      render: (val, row) => {
        const lastUpdate = row.journey?.steps
          ? Object.values(row.journey.steps)
              .filter(s => s.completedAt)
              .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0]?.completedAt
          : null
        return <span className="text-grey-40 text-[12px]">{lastUpdate || row.date || '—'}</span>
      },
    },
    {
      key: 'nextDue', label: 'Next Follow-up Due',
      render: (val, row) => {
        const nextDue = row.journey?.nextDueDate || null
        const overdue = nextDue && isOverdue(nextDue)
        return (
          <div className={`flex items-center gap-1 ${overdue ? 'text-red font-medium' : 'text-grey-70'}`}>
            {overdue && <AlertCircle className="w-3 h-3" />}
            <span className="text-[13px]">{nextDue || '—'}</span>
          </div>
        )
      },
    },
    { key: 'contactCount', label: 'Contacts', render: (val, row) => <span className="text-grey-70 font-medium text-[13px]">{row.journey?.contactCount || 0}</span> },
    {
      key: 'paymentStatus', label: 'Payment',
      render: (val) => (
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
          val === 'Full Payment Done' ? 'bg-green-light text-green' : 'bg-amber-light text-amber'
        }`}>
          {val === 'Full Payment Done' ? 'Full' : val === 'Partial' ? 'Partial' : 'Pending'}
        </span>
      ),
    },
    {
      key: 'nextTask', label: 'Action',
      render: (val, row) => {
        const task = getNextTask(row)
        return (
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/germany/admin/lead/${row.id}`)
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-blue-90 bg-blue-10 hover:bg-blue-20 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> {task}
          </button>
        )
      },
    },
  ]

  return (
    <div>
      <PageHeader title="Active Students" subtitle="Students who have paid and are in active service journey" />
      <div className="mb-5">
        <FilterPills filters={filters} activeFilter={activeFilter} onFilterChange={(f) => { setActiveFilter(f); setPage(1) }} />
      </div>
      <div className="flex items-center justify-between mb-6">
        <SearchBar placeholder="Search students..." value={search} onChange={setSearch} className="w-[260px]" />
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-grey-60 border border-grey-20 hover:bg-grey-10 transition-colors">
          <Calendar className="w-3.5 h-3.5" /> Date Range
        </button>
      </div>
      <DataTable
        columns={columns}
        data={filtered}
        page={page}
        totalItems={filtered.length}
        pageSize={10}
        onPageChange={setPage}
        onRowClick={(row) => setQuickViewLead(row)}
        emptyState={
          <div className="py-14 text-center">
            <p className="text-[14px] font-medium text-grey-60 mb-1">No active students found</p>
            <p className="text-[12px] text-grey-40">Students appear here after conversion</p>
          </div>
        }
      />

      <QuickView
        isOpen={!!quickViewLead}
        onClose={() => setQuickViewLead(null)}
        lead={quickViewLead}
        detailPath={quickViewLead ? `/admin/lead/${quickViewLead.id}` : ''}
        readOnly={true}
      />
    </div>
  )
}
