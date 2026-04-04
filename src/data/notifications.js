export const notifications = [
  {
    id: 'N-001', type: 'approval', title: 'VAS Payout Pending',
    message: 'TB Test payout for Kabir Malhotra needs approval',
    date: '2026-03-10T10:00:00', read: false,
  },
  {
    id: 'N-002', type: 'approval', title: 'VAS Payout Pending',
    message: 'IELTS Classes payout for Aditya Banerjee needs approval',
    date: '2026-03-12T14:00:00', read: false,
  },
  {
    id: 'N-003', type: 'alert', title: 'Low Margin Alert',
    message: 'Sneha Iyer margin dropped below 10% - escalated to super admin',
    date: '2026-03-15T11:00:00', read: false,
  },
  {
    id: 'N-004', type: 'payment', title: 'Payment Received',
    message: '₹4,15,000 received from Kabir Malhotra via NEFT',
    date: '2026-03-05T09:30:00', read: true,
  },
  {
    id: 'N-005', type: 'refund', title: 'Refund Requested',
    message: 'Sneha Iyer has requested a refund - review needed',
    date: '2026-03-15T14:00:00', read: false,
  },
]
