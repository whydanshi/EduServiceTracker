export const approvals = [
  {
    id: 'APR-001', studentId: 'E2E-009', studentName: 'Kabir Malhotra',
    type: 'vas', serviceName: 'VAS1', amount: 5000,
    requestedBy: 'Amit Verma', requestedDate: '10/03/26',
    status: 'pending', margin: null, escalated: false,
    remarks: 'TB Test',
  },
  {
    id: 'APR-002', studentId: 'E2E-013', studentName: 'Aditya Banerjee',
    type: 'vas', serviceName: 'VAS1', amount: 25000,
    requestedBy: 'Amit Verma', requestedDate: '12/03/26',
    status: 'pending', margin: null, escalated: false,
    remarks: 'IELTS Classes',
  },
  {
    id: 'APR-003', studentId: 'E2E-008', studentName: 'Sneha Iyer',
    type: 'e2e', serviceName: 'Refund Processing', amount: 251111,
    requestedBy: 'Neha Gupta', requestedDate: '15/03/26',
    status: 'pending', margin: 7.2, escalated: true,
    remarks: 'Student withdrew - needs superadmin approval due to low margin',
  },
  {
    id: 'APR-004', studentId: 'E2E-002', studentName: 'Priya Sharma',
    type: 'vas', serviceName: 'VAS1', amount: 85000,
    requestedBy: 'Neha Gupta', requestedDate: '20/02/26',
    status: 'approved', margin: null, escalated: false,
    remarks: 'Accommodation Deposit · Approved by admin',
  },
  {
    id: 'APR-005', studentId: 'E2E-004', studentName: 'Ananya Reddy',
    type: 'vas', serviceName: 'VAS1', amount: 1200000,
    requestedBy: 'Neha Gupta', requestedDate: '15/01/26',
    status: 'approved', margin: null, escalated: false,
    remarks: 'Tuition Fee Transfer · Large sum - verified and approved',
  },
]
