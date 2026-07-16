// Sample shipment health status records used to seed the database.
const SHIPMENT_HEALTH_STATUSES = [
  {
    shipmentId: 'SHP-100001',
    shipmentHealth: {
      overallScore: 96,
      overallStatus: 'Excellent',
      milestoneCompletion: {
        score: 100,
        status: 'Completed',
        completed: 8,
        total: 8
      },
      documentStatus: {
        score: 95,
        status: 'Completed',
        uploaded: 10,
        required: 10,
        pendingDocuments: []
      },
      forwarderPerformance: {
        score: 94,
        status: 'Excellent',
        carrier: 'DHL Global Forwarding',
        onTimePerformance: '98%',
        delay: 'None'
      },
      customsClearance: {
        score: 93,
        status: 'Completed',
        clearanceStatus: 'Released'
      }
    }
  },
  {
    shipmentId: 'SHP-100002',
    shipmentHealth: {
      overallScore: 87,
      overallStatus: 'Good',
      milestoneCompletion: {
        score: 88,
        status: 'In Progress',
        completed: 7,
        total: 8
      },
      documentStatus: {
        score: 82,
        status: 'Pending',
        uploaded: 9,
        required: 10,
        pendingDocuments: ['Commercial Invoice']
      },
      forwarderPerformance: {
        score: 91,
        status: 'Good',
        carrier: 'Kuehne + Nagel',
        onTimePerformance: '94%',
        delay: '3 Hours'
      },
      customsClearance: {
        score: 86,
        status: 'Under Review',
        clearanceStatus: 'Documents Verification'
      }
    }
  },
  {
    shipmentId: 'SHP-100003',
    shipmentHealth: {
      overallScore: 74,
      overallStatus: 'Fair',
      milestoneCompletion: {
        score: 75,
        status: 'Delayed',
        completed: 6,
        total: 8
      },
      documentStatus: {
        score: 70,
        status: 'Pending',
        uploaded: 7,
        required: 10,
        pendingDocuments: ['Packing List', 'Certificate of Origin', 'Insurance Certificate']
      },
      forwarderPerformance: {
        score: 78,
        status: 'Average',
        carrier: 'DB Schenker',
        onTimePerformance: '87%',
        delay: '1 Day'
      },
      customsClearance: {
        score: 72,
        status: 'Inspection Required',
        clearanceStatus: 'Awaiting Customs Inspection'
      }
    }
  },
  {
    shipmentId: 'SHP-100004',
    shipmentHealth: {
      overallScore: 58,
      overallStatus: 'At Risk',
      milestoneCompletion: {
        score: 55,
        status: 'Delayed',
        completed: 4,
        total: 8
      },
      documentStatus: {
        score: 60,
        status: 'Missing Documents',
        uploaded: 6,
        required: 10,
        pendingDocuments: ['Commercial Invoice', 'Packing List', 'Bill of Lading', 'Insurance Certificate']
      },
      forwarderPerformance: {
        score: 61,
        status: 'Poor',
        carrier: 'Expeditors',
        onTimePerformance: '76%',
        delay: '2 Days'
      },
      customsClearance: {
        score: 56,
        status: 'On Hold',
        clearanceStatus: 'Awaiting Additional Documents'
      }
    }
  }
];

module.exports = { SHIPMENT_HEALTH_STATUSES };
