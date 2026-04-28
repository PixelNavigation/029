import { useState } from 'react';
// Central authority feature removed.
{
  id: 2,
    certificateId: 'CERT-2025-005678',
      studentName: 'Priya Patel',
        institution: 'Indian Institute of Technology (ISM) Dhanbad',
          degree: 'M.Sc Mathematics',
            issueDate: '2025-07-20',
              flagReason: 'Institution not in authorized list',
                severity: 'critical',
                  status: 'blocked'
},
{
  id: 3,
    certificateId: 'CERT-2025-009876',
      studentName: 'Arjun Singh',
        institution: 'Birla Institute of Technology Mesra',
          degree: 'B.E Mechanical',
            issueDate: '2025-08-10',
              flagReason: 'Duplicate certificate number detected',
                severity: 'medium',
                  status: 'resolved'
},
{
  id: 4,
    certificateId: 'CERT-2025-011223',
      studentName: 'Sneha Reddy',
        institution: 'National Institute of Technology Jamshedpur',
          degree: 'MBA Finance',
            issueDate: '2025-09-05',
              flagReason: 'Grade discrepancy with records',
                severity: 'medium',
                  status: 'investigating'
},
{
  id: 5,
    certificateId: 'CERT-2025-013579',
      studentName: 'Vikram Gupta',
        institution: 'Vinoba Bhave University',
          degree: 'Ph.D Computer Science',
            issueDate: '2025-08-30',
              flagReason: 'Fraudulent watermark detected',
                severity: 'critical',
                  status: 'blocked'
}
  ];

const auditReports = [
  {
    id: 1,
    institution: 'Indian Institute of Technology (ISM) Dhanbad',
    reportDate: '2025-08-15',
    auditor: 'Dr. Ramesh Chandra',
    type: 'Annual Compliance Audit',
    status: 'completed',
    score: 94,
    findings: 'Minor documentation gaps',
    certificatesReviewed: 1250
  },
  {
    id: 2,
    institution: 'Ranchi University',
    reportDate: '2025-07-20',
    auditor: 'Prof. Sunita Sharma',
    type: 'Certificate Verification Audit',
    status: 'completed',
    score: 87,
    findings: 'Need better digital security measures',
    certificatesReviewed: 2100
  },
  {
    id: 3,
    institution: 'Birla Institute of Technology Mesra',
    reportDate: '2025-06-30',
    auditor: 'Dr. K. Ramanathan',
    type: 'Security Assessment',
    status: 'in_progress',
    score: null,
    findings: 'Ongoing evaluation',
    certificatesReviewed: 890
  },
  {
    id: 4,
    institution: 'National Institute of Technology Jamshedpur',
    reportDate: '2025-09-10',
    auditor: 'Dr. Anjali Banerjee',
    type: 'Digital Infrastructure Audit',
    status: 'completed',
    score: 91,
    findings: 'Excellent digital compliance',
    certificatesReviewed: 980
  },
  {
    id: 5,
    institution: 'Vinoba Bhave University',
    reportDate: '2025-08-25',
    auditor: 'Mr. Suresh Kumar',
    type: 'Annual Compliance Audit',
    status: 'completed',
    score: 89,
    findings: 'Good overall compliance',
    certificatesReviewed: 1800
  },
  {
    id: 6,
    institution: 'Central University of Jharkhand',
    reportDate: '2025-05-15',
    auditor: 'Dr. Meera Joshi',
    type: 'Risk Assessment',
    status: 'action_required',
    score: 76,
    findings: 'Several security vulnerabilities identified',
    certificatesReviewed: 1540
  }
];

return (
  <div className="min-h-screen bg-gray-50">
    {/* Header */}
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-red-600 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Central Authority Portal</h1>
              <p className="text-sm text-gray-600">Government Regulatory Dashboard</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              Welcome, <span className="font-medium">{user?.name}</span>
            </div>
            <button
              onClick={signOut}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation Tabs */}
      <div className="mb-8">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: TrendingUp },
            { id: 'institutions', name: 'Institution Management', icon: Building2 },
            { id: 'certificates', name: 'Alerts', icon: FileCheck },
            { id: 'reports', name: 'Audit Reports', icon: Download }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 font-medium text-sm rounded-md transition-colors ${activeTab === tab.id
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.title} className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      <div className={`flex items-center text-sm mt-2 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                        <TrendingUp className={`h-4 w-4 mr-1 ${stat.trend === 'down' ? 'rotate-180' : ''
                          }`} />
                        {stat.change} from last month
                      </div>
                    </div>
                    <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                      <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Activity & Pending Approvals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${activity.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                        }`}>
                        {activity.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.institution}</p>
                      </div>
                      <div className="text-xs text-gray-500">{activity.timestamp}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pending Institution Approvals */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Pending Institution Approvals</h3>
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {pendingInstitutions.length} Pending
                </span>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {pendingInstitutions.map((institution) => (
                    <div key={institution.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{institution.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${institution.status === 'under_review'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          {institution.status === 'under_review' ? 'Under Review' : 'Docs Pending'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{institution.location}</p>
                      <p className="text-sm text-gray-500 mb-3">{institution.type}</p>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          Submitted: {institution.submittedDate} • {institution.documents} documents
                        </div>
                        <div className="flex space-x-2">
                          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                  View All Pending Approvals
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'institutions' && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Institution Management</h3>
              <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <Plus className="h-4 w-4" />
                <span>Add Institution</span>
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="flex space-x-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search institutions..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {institutions.map((institution) => (
                <div key={institution.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-900 text-sm">{institution.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${institution.status === 'verified'
                        ? 'bg-green-100 text-green-800'
                        : institution.status === 'pending_review'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                      {institution.status === 'verified' ? 'Verified' :
                        institution.status === 'pending_review' ? 'Pending Review' : 'Under Review'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">📍 {institution.location}</p>
                    <p className="text-sm text-gray-600">🏛️ {institution.type}</p>
                    <p className="text-sm text-gray-600">📅 Est. {institution.established}</p>
                    <p className="text-sm text-gray-600">👥 {institution.students} students</p>
                    <p className="text-sm text-gray-500">Last audit: {institution.lastAudit}</p>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'certificates' && (
        <div className="space-y-6">
          {/* Alert Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-red-900">Critical Alerts</h4>
                  <p className="text-2xl font-bold text-red-700">2</p>
                  <p className="text-sm text-red-600">Immediate attention required</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-900">Under Investigation</h4>
                  <p className="text-2xl font-bold text-yellow-700">2</p>
                  <p className="text-sm text-yellow-600">Being reviewed</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-900">Resolved</h4>
                  <p className="text-2xl font-bold text-green-700">1</p>
                  <p className="text-sm text-green-600">This month</p>
                </div>
              </div>
            </div>
          </div>

          {/* Flagged Certificates */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Flagged Certificates</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Export Report
                  </button>
                  <button className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100">
                    View All Alerts
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {flaggedCertificates.map((cert) => (
                  <div key={cert.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{cert.studentName}</h4>
                          <span className="text-sm text-gray-500">#{cert.certificateId}</span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${cert.severity === 'critical'
                              ? 'bg-red-100 text-red-800'
                              : cert.severity === 'high'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {cert.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">🎓 {cert.degree}</p>
                        <p className="text-sm text-gray-600 mb-1">🏛️ {cert.institution}</p>
                        <p className="text-sm text-gray-500">📅 Issued: {cert.issueDate}</p>
                      </div>

                      <div className="text-right">
                        <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${cert.status === 'blocked'
                            ? 'bg-red-100 text-red-800'
                            : cert.status === 'investigating'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                          {cert.status === 'blocked' ? 'Blocked' :
                            cert.status === 'investigating' ? 'Investigating' : 'Resolved'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Flag Reason:</p>
                      <p className="text-sm text-gray-600">{cert.flagReason}</p>
                    </div>

                    <div className="flex space-x-2">
                      <button className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors">
                        View Details
                      </button>
                      {cert.status !== 'blocked' && (
                        <button className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors">
                          Blacklist
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Audit Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-center">
                <h4 className="font-semibold text-blue-900">Total Audits</h4>
                <p className="text-2xl font-bold text-blue-700">6</p>
                <p className="text-sm text-blue-600">This quarter</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-center">
                <h4 className="font-semibold text-green-900">Completed</h4>
                <p className="text-2xl font-bold text-green-700">4</p>
                <p className="text-sm text-green-600">Audit reports</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-center">
                <h4 className="font-semibold text-yellow-900">In Progress</h4>
                <p className="text-2xl font-bold text-yellow-700">1</p>
                <p className="text-sm text-yellow-600">Ongoing</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-center">
                <h4 className="font-semibold text-red-900">Action Required</h4>
                <p className="text-2xl font-bold text-red-700">1</p>
                <p className="text-sm text-red-600">Needs attention</p>
              </div>
            </div>
          </div>

          {/* Verification Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Verification vs Flagged Certificates Chart */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Certificate Verification Status</h3>
                <p className="text-sm text-gray-500">Verified vs Flagged certificates this month</p>
              </div>
              <div className="p-6">
                <div className="relative">
                  {/* Simple Bar Chart */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Verified Certificates</span>
                      <span className="text-sm font-bold text-green-600">23,456 (94.2%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full" style={{ width: '94.2%' }}></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Flagged/Suspicious</span>
                      <span className="text-sm font-bold text-red-600">1,234 (4.9%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-red-500 h-3 rounded-full" style={{ width: '4.9%' }}></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Under Review</span>
                      <span className="text-sm font-bold text-yellow-600">230 (0.9%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-yellow-500 h-3 rounded-full" style={{ width: '0.9%' }}></div>
                    </div>
                  </div>

                  {/* Pie Chart Representation */}
                  <div className="mt-6 flex justify-center">
                    <div className="relative w-32 h-32">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                        {/* Verified - 94.2% */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#10B981"
                          strokeWidth="10"
                          fill="transparent"
                          strokeDasharray="235.6 250"
                          strokeDashoffset="0"
                        />
                        {/* Flagged - 4.9% */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#EF4444"
                          strokeWidth="10"
                          fill="transparent"
                          strokeDasharray="12.25 250"
                          strokeDashoffset="-235.6"
                        />
                        {/* Under Review - 0.9% */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#F59E0B"
                          strokeWidth="10"
                          fill="transparent"
                          strokeDasharray="2.25 250"
                          strokeDashoffset="-247.85"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">24,920</div>
                          <div className="text-xs text-gray-500">Total</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Trend Chart */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Monthly Verification Trends</h3>
                <p className="text-sm text-gray-500">Certificate verification trends over last 6 months</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    { month: 'Apr 2025', verified: 18200, flagged: 890, percentage: 95.1 },
                    { month: 'May 2025', verified: 19500, flagged: 1200, percentage: 94.2 },
                    { month: 'Jun 2025', verified: 21000, flagged: 980, percentage: 95.5 },
                    { month: 'Jul 2025', verified: 22300, flagged: 1100, percentage: 95.3 },
                    { month: 'Aug 2025', verified: 23100, flagged: 1350, percentage: 94.5 },
                    { month: 'Sep 2025', verified: 23456, flagged: 1234, percentage: 95.0 }
                  ].map((data, index) => (
                    <div key={data.month} className="flex items-center space-x-4">
                      <div className="w-16 text-xs text-gray-600 font-medium">{data.month}</div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-green-600">✓ {data.verified.toLocaleString()}</span>
                          <span className="text-red-600">⚠ {data.flagged.toLocaleString()}</span>
                          <span className="font-medium">{data.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full relative"
                            style={{ width: `${data.percentage}%` }}
                          >
                            <div
                              className="absolute right-0 top-0 bg-red-500 h-2 rounded-r-full"
                              style={{ width: `${((100 - data.percentage) / data.percentage) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">+12.8%</div>
                      <div className="text-gray-500">Verification Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-600">+38.6%</div>
                      <div className="text-gray-500">Flagged Cases</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">28.9%</div>
                      <div className="text-gray-500">Growth</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Institution Risk Assessment */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Institution Risk Assessment</h3>
              <p className="text-sm text-gray-500">Risk levels based on audit scores and flagged certificates</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Low Risk */}
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 relative">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        stroke="#E5E7EB"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        stroke="#10B981"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray="154 220"
                        strokeDashoffset="0"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-green-600">70%</span>
                    </div>
                  </div>
                  <h4 className="font-semibold text-green-900 mb-2">Low Risk</h4>
                  <p className="text-sm text-gray-600">7 institutions with excellent audit scores (90%+)</p>
                </div>

                {/* Medium Risk */}
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 relative">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        stroke="#E5E7EB"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        stroke="#F59E0B"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray="66 220"
                        strokeDashoffset="0"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-yellow-600">30%</span>
                    </div>
                  </div>
                  <h4 className="font-semibold text-yellow-900 mb-2">Medium Risk</h4>
                  <p className="text-sm text-gray-600">3 institutions need monitoring (70-89% scores)</p>
                </div>

                {/* High Risk */}
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 relative">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        stroke="#E5E7EB"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        stroke="#EF4444"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray="22 220"
                        strokeDashoffset="0"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-red-600">0%</span>
                    </div>
                  </div>
                  <h4 className="font-semibold text-red-900 mb-2">High Risk</h4>
                  <p className="text-sm text-gray-600">0 institutions require immediate action (&lt;70%)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Reports List */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Recent Audit Reports</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Filter by Status
                  </button>
                  <button className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100">
                    Generate Report
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {auditReports.map((report) => (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">{report.institution}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Audit Type</p>
                            <p className="font-medium text-gray-900">{report.type}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Auditor</p>
                            <p className="font-medium text-gray-900">{report.auditor}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Report Date</p>
                            <p className="font-medium text-gray-900">{report.reportDate}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Certificates Reviewed</p>
                            <p className="font-medium text-gray-900">{report.certificatesReviewed}</p>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          {report.score && (
                            <div className={`px-2 py-1 rounded text-sm font-medium ${report.score >= 90 ? 'bg-green-100 text-green-800' :
                                report.score >= 80 ? 'bg-blue-100 text-blue-800' :
                                  report.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                              }`}>
                              Score: {report.score}%
                            </div>
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${report.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : report.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                            {report.status === 'completed' ? 'Completed' :
                              report.status === 'in_progress' ? 'In Progress' : 'Action Required'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Key Findings:</p>
                      <p className="text-sm text-gray-600">{report.findings}</p>
                    </div>

                    <div className="flex space-x-2">
                      <button className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors">
                        <Download className="h-3 w-3 inline mr-1" />
                        Download Report
                      </button>
                      <button className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                        View Details
                      </button>
                      {report.status === 'action_required' && (
                        <button className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors">
                          Take Action
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
};