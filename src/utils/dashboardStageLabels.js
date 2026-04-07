/**
 * Display labels for dashboard matrix / charts — aligned with TrackEdu (Germany service UI + E2E package stages).
 * Internal keys must stay stable (see deriveGermanyStage / deriveE2EStage in dashboardData.js).
 */

const STAGE_HEADERS = {
  // Germany pipeline (journey + service)
  New: 'New',
  Assigned: 'Assigned',
  Serviceable: 'Serviceable',
  QC: 'QC check',
  'Ack Sent': 'Ack. sent',
  'Need Info': 'Need more info',
  'Doc Prep': 'Document preparation',
  APS: 'APS',
  Counselling: 'Virtual counselling',
  Shortlisting: 'University shortlisting',
  'Uni Finalization': 'University finalisation',
  Applications: 'Applications',
  'Application Review': 'Application review',
  'Offer Letter': 'Offer letter',
  Converted: 'Converted',
  Lost: 'Not serviceable',
  // E2E package lifecycle (same words as Germany "Enrolled" can confuse — prefix E2E)
  Enrolled: 'E2E — Enrolled',
  'In Progress': 'E2E — In progress',
  Completed: 'E2E — Completed',
  Refund: 'E2E — Refund',
}

const STAGE_TOOLTIPS = {
  QC: 'Germany leads in QC review (Sales Form 2 / quality check).',
  'Ack Sent': 'Acknowledgement email sent to student.',
  'Need Info': 'More information requested from student.',
  'Doc Prep': 'Document preparation step in journey.',
  Serviceable: 'Eligibility passed; profile is serviceable.',
  Enrolled: 'UK E2E student enrolled on package; services not all started or completed.',
  'In Progress': 'UK E2E — at least one package service in progress.',
  Completed: 'UK E2E — all opted services completed.',
  Refund: 'UK E2E — refund case.',
}

/** Human-readable column title for Student Stage Distribution and charts */
export function getDashboardStageHeader(internalKey) {
  return STAGE_HEADERS[internalKey] ?? internalKey
}

/** Optional tooltip for table header cells */
export function getDashboardStageTooltip(internalKey) {
  return STAGE_TOOLTIPS[internalKey] ?? null
}

/** Sales / service journey pipeline segments (payment & fulfilment views) */
const PIPELINE_LABELS = {
  Lead: 'Lead',
  Enrolled: 'Enrolled',
  'Partial Payment': 'Partial payment',
  'Payment Complete': 'Payment complete',
  'Pre-Service': 'Pre-service',
  'Awaiting Services': 'Awaiting services',
  'Services Initiated': 'Services initiated',
  'In Progress': 'In progress',
  'Fully Serviced': 'Fully serviced',
}

export function getPipelineStageLabel(internalKey) {
  return PIPELINE_LABELS[internalKey] ?? internalKey
}
