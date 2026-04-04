export const users = [
  {
    id: 'usr-sa-001', firstName: 'Tanisha', lastName: 'Admin', name: 'Tanisha Admin',
    email: 'tanisha.admin@leverageedu.com', phone: '+91 98765 43210',
    role: 'superadmin', team: 'superadmin', status: 'active',
    productAccess: ['germany', 'e2e'],
  },
  {
    id: 'usr-ad-001', firstName: 'Anjali', lastName: 'Sharma', name: 'Anjali Sharma',
    email: 'anjali.sharma@leverageedu.com', phone: '+91 98220 11001',
    role: 'admin', team: 'admin', status: 'active',
    productAccess: ['germany'],
  },
  {
    id: 'usr-ad-002', firstName: 'Priya', lastName: 'Verma', name: 'Priya Verma',
    email: 'priya.verma@leverageedu.com', phone: '+91 98220 11002',
    role: 'admin', team: 'admin', status: 'active',
    productAccess: ['e2e'],
  },
  {
    id: 'usr-sv-001', firstName: 'Amit', lastName: 'Verma', name: 'Amit Verma',
    email: 'amit.verma@leverageedu.com', phone: '+91 98100 33001',
    role: 'service', team: 'service', status: 'active',
    productAccess: ['germany'],
  },
  {
    id: 'usr-sv-002', firstName: 'Neha', lastName: 'Gupta', name: 'Neha Gupta',
    email: 'neha.gupta@leverageedu.com', phone: '+91 98100 33002',
    role: 'service', team: 'service', status: 'active',
    productAccess: ['e2e'],
  },
  {
    id: 'usr-sl-001', firstName: 'Raj', lastName: 'Kumar', name: 'Raj Kumar',
    email: 'raj.kumar@leverageedu.com', phone: '+91 98100 22001',
    role: 'sales', team: 'sales', status: 'active',
    productAccess: ['germany'],
  },
]

export const roleConfig = {
  superadmin:      { label: 'Super Admin',        baseRole: 'superadmin' },
  admin_germany:   { label: 'Admin (Germany)',     baseRole: 'admin' },
  admin_e2e:       { label: 'Admin (E2E)',         baseRole: 'admin' },
  service_germany: { label: 'Service (Germany)',   baseRole: 'service' },
  service_e2e:     { label: 'Service (E2E)',       baseRole: 'service' },
  sales:           { label: 'Sales',               baseRole: 'sales' },
}
