export const GBP_BASE_RATE = 124.21

export const e2eServices = [
  // IHS variants (GBP-denominated)
  { id: 'svc-ihs-1',   name: 'IHS (1 + 0.5 year)',     costGBP: 1164,  costINR: 144580,  currency: 'GBP', category: 'e2e' },
  { id: 'svc-ihs-1.5', name: 'IHS (1.5 + 0.5 year)',   costGBP: 1552,  costINR: 192774,  currency: 'GBP', category: 'e2e' },
  { id: 'svc-ihs-2',   name: 'IHS (2 + 0.5 years)',    costGBP: 1940,  costINR: 240967,  currency: 'GBP', category: 'e2e' },
  { id: 'svc-ihs-2.5', name: 'IHS (2.5 + 0.5 years)',  costGBP: 2328,  costINR: 289160,  currency: 'GBP', category: 'e2e' },
  { id: 'svc-ihs-3',   name: 'IHS (3 + 0.5 years)',    costGBP: 2716,  costINR: 337354,  currency: 'GBP', category: 'e2e' },

  // Visa (GBP-denominated)
  { id: 'svc-visa-std',     name: 'Standard Visa',           costGBP: 558,   costINR: 69309,   currency: 'GBP', category: 'e2e' },
  { id: 'svc-visa-pri',     name: 'Priority Visa Slot',      costGBP: 500,   costINR: 62105,   currency: 'GBP', category: 'e2e' },
  { id: 'svc-visa-super',   name: 'Super Priority Visa Slot', costGBP: 1000, costINR: 124210,  currency: 'GBP', category: 'e2e' },
  { id: 'svc-lounge',       name: 'Premium Lounge',          costGBP: 60,    costINR: 7453,    currency: 'GBP', category: 'e2e' },

  // INR-denominated services
  { id: 'svc-flight',   name: 'UK Flight Tickets',  costGBP: null, costINR: 70000,  currency: 'INR', category: 'e2e' },
  { id: 'svc-sim',      name: 'SIM Card',           costGBP: null, costINR: 1500,   currency: 'INR', category: 'e2e' },
  { id: 'svc-cab',      name: 'Cab',                costGBP: null, costINR: 10000,  currency: 'INR', category: 'e2e' },
  { id: 'svc-luggage',  name: 'Luggage Set',        costGBP: null, costINR: 5000,   currency: 'INR', category: 'e2e' },
  { id: 'svc-bedding',  name: 'Bedding Kit',        costGBP: null, costINR: 15000,  currency: 'INR', category: 'e2e' },
  { id: 'svc-ielts',    name: 'IELTS Test Fees',    costGBP: null, costINR: 18200,  currency: 'INR', category: 'e2e' },
]

export const e2ePackages = [
  {
    id: 'pkg-1', name: 'Package 1',
    serviceIds: ['svc-ihs-1', 'svc-visa-std', 'svc-flight', 'svc-sim', 'svc-cab', 'svc-luggage'],
    mspGST: 465000, mspNoGST: 394068, expectedMargin: 28.26, status: 'ACTIVE',
  },
  {
    id: 'pkg-2', name: 'Package 2',
    serviceIds: ['svc-ihs-1.5', 'svc-visa-std', 'svc-flight', 'svc-sim', 'svc-cab', 'svc-luggage'],
    mspGST: 520000, mspNoGST: 440678, expectedMargin: 23.90, status: 'ACTIVE',
  },
  {
    id: 'pkg-3', name: 'Package 3',
    serviceIds: ['svc-ihs-2', 'svc-visa-std', 'svc-flight', 'svc-sim', 'svc-cab', 'svc-luggage'],
    mspGST: 605000, mspNoGST: 512712, expectedMargin: 24.33, status: 'ACTIVE',
  },
  {
    id: 'pkg-4', name: 'Package 4',
    serviceIds: ['svc-ihs-2.5', 'svc-visa-std', 'svc-flight', 'svc-sim', 'svc-cab', 'svc-luggage'],
    mspGST: 695000, mspNoGST: 588983, expectedMargin: 24.26, status: 'ACTIVE',
  },
  {
    id: 'pkg-5', name: 'Package 5',
    serviceIds: ['svc-ihs-3', 'svc-visa-std', 'svc-flight', 'svc-sim', 'svc-cab', 'svc-luggage'],
    mspGST: 750000, mspNoGST: 635593, expectedMargin: 21.54, status: 'ACTIVE',
  },
  {
    id: 'pkg-6', name: 'Package 6',
    serviceIds: ['svc-ihs-3', 'svc-visa-std', 'svc-flight', 'svc-sim', 'svc-cab', 'svc-luggage', 'svc-bedding'],
    mspGST: 830000, mspNoGST: 703390, expectedMargin: 21.62, status: 'ACTIVE',
  },
  {
    id: 'pkg-7', name: 'Package 7',
    serviceIds: ['svc-ihs-1', 'svc-visa-std', 'svc-flight', 'svc-sim', 'svc-cab', 'svc-luggage', 'svc-bedding', 'svc-ielts'],
    mspGST: 630000, mspNoGST: 533898, expectedMargin: 25.59, status: 'ACTIVE',
  },
  {
    id: 'pkg-8', name: 'Package 8',
    serviceIds: ['svc-ihs-1.5', 'svc-visa-std', 'svc-flight', 'svc-sim', 'svc-cab', 'svc-luggage', 'svc-bedding', 'svc-ielts'],
    mspGST: 700000, mspNoGST: 593220, expectedMargin: 24.16, status: 'ACTIVE',
  },
  {
    id: 'pkg-9', name: 'Package 9',
    serviceIds: ['svc-ihs-1', 'svc-visa-std', 'svc-sim'],
    mspGST: 360000, mspNoGST: 305085, expectedMargin: 23.33, status: 'ACTIVE',
  },
  {
    id: 'pkg-10', name: 'Package 10',
    serviceIds: ['svc-ihs-1', 'svc-visa-std', 'svc-flight', 'svc-sim'],
    mspGST: 450000, mspNoGST: 381356, expectedMargin: 24.87, status: 'ACTIVE',
  },
  {
    id: 'pkg-11', name: 'Package 11',
    serviceIds: ['svc-ielts'],
    mspGST: 21500, mspNoGST: 18220, expectedMargin: 0, status: 'ACTIVE',
  },
  {
    id: 'pkg-custom', name: 'Custom Package',
    serviceIds: [],
    mspGST: 0, mspNoGST: 0, expectedMargin: 0, status: 'ACTIVE',
  },
]

export const paymentAccounts = [
  { id: 'loan', label: 'Loan' },
  { id: 'ebix', label: 'EBIX Transfer' },
  { id: 'uk-bank-inr', label: 'UK Bank (INR)' },
  { id: 'uk-bank-gbp', label: 'UK Bank (GBP)' },
  { id: 'stripe-inr', label: 'Stripe (INR)' },
  { id: 'stripe-gbp', label: 'Stripe (GBP)' },
  { id: 'indian-bank', label: 'Indian Bank / RZP' },
]
