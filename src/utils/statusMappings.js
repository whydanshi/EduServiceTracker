/**
 * Centralized logic for determining correct task/action based on sales/service status combination
 */

export function getTaskForStatus(salesStatus, serviceStatus, nextTask) {
  if (salesStatus === 'Lost' || serviceStatus === 'Rejected' || nextTask === 'Sale closed') {
    return '-'
  }

  if (salesStatus === 'Submitted evaluation' && serviceStatus === 'Pending Evaluation') {
    return '-'
  }

  // QC in progress — Sales has no action
  if (serviceStatus === 'QC Check') {
    return 'Waiting for QC'
  }

  if (serviceStatus === 'Serviceable' && salesStatus === 'Sales form required') {
    return 'Fill Sales form'
  }

  // Need More Info from QC or eligibility — Sales must fix flagged fields
  if (serviceStatus === 'Need More Info' || serviceStatus === 'More Info Required') {
    return 'Fix flagged fields'
  }
  if (salesStatus === 'More info required') {
    return 'Provide additional info'
  }

  if (serviceStatus === 'QC Checked' && salesStatus === 'Sales form required') {
    return 'Fill Sales form'
  }

  if (serviceStatus === 'Email Sent' && salesStatus === 'Sales form required') {
    return '-'
  }

  if (serviceStatus === 'Signature Received' && salesStatus === 'Sales form required') {
    return 'Fill Sales form'
  }

  if (salesStatus === 'Draft') {
    return 'Complete profile evaluation form'
  }

  return nextTask || '-'
}
