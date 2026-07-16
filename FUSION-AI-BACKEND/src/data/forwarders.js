// Candidate freight forwarders considered for AI recommendations.
// Profiles are general industry characteristics, not live rate/capacity data.
const FORWARDERS = [
  {
    id: 'FWD-001',
    name: 'DHL Global Forwarding',
    mode: ['Air', 'Ocean'],
    incoterm: 'EXW',
    modeType: 'Door to Door',
    containerType: ['FCL', 'LCL'],
    headOffice: 'Bonn, Germany',
    rating: 4.8,
    status: 'Active'
  },
  {
    id: 'FWD-002',
    name: 'Kuehne + Nagel',
    mode: ['Air', 'Ocean'],
    incoterm: 'EXW',
    modeType: 'Door to Door',
    containerType: ['FCL', 'LCL'],
    headOffice: 'Schindellegi, Switzerland',
    rating: 4.7,
    status: 'Active'
  },
  {
    id: 'FWD-003',
    name: 'DB Schenker',
    mode: ['Air', 'Ocean'],
    incoterm: 'EXW',
    modeType: 'Door to Door',
    containerType: ['FCL', 'LCL'],
    headOffice: 'Essen, Germany',
    rating: 4.6,
    status: 'Active'
  },
  {
    id: 'FWD-004',
    name: 'DSV',
    mode: ['Air', 'Ocean'],
    incoterm: 'EXW',
    modeType: 'Door to Door',
    containerType: ['FCL', 'LCL'],
    headOffice: 'Hedehusene, Denmark',
    rating: 4.7,
    status: 'Active'
  },
  {
    id: 'FWD-005',
    name: 'Expeditors',
    mode: ['Air', 'Ocean'],
    incoterm: 'EXW',
    modeType: 'Door to Door',
    containerType: ['FCL', 'LCL'],
    headOffice: 'Seattle, USA',
    rating: 4.5,
    status: 'Active'
  },
  {
    id: 'FWD-006',
    name: 'CEVA Logistics',
    mode: ['Air', 'Ocean'],
    incoterm: 'EXW',
    modeType: 'Door to Door',
    containerType: ['FCL', 'LCL'],
    headOffice: 'Marseille, France',
    rating: 4.5,
    status: 'Active'
  },
  {
    id: 'FWD-007',
    name: 'Hellmann Worldwide Logistics',
    mode: ['Air', 'Ocean'],
    incoterm: 'EXW',
    modeType: 'Door to Door',
    containerType: ['FCL', 'LCL'],
    headOffice: 'Osnabrück, Germany',
    rating: 4.4,
    status: 'Active'
  },
  {
    id: 'FWD-008',
    name: 'Nippon Express',
    mode: ['Air', 'Ocean'],
    incoterm: 'EXW',
    modeType: 'Door to Door',
    containerType: ['FCL', 'LCL'],
    headOffice: 'Tokyo, Japan',
    rating: 4.6,
    status: 'Active'
  }
];

module.exports = { FORWARDERS };
