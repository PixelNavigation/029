import { useState } from 'react';
import { 
  Shield, 
  Users, 
  Building2, 
  FileCheck, 
  AlertTriangle, 
  TrendingUp,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Plus
} from 'lucide-react';
import { useAuthStore } from '../../store/auth';

export const CentralAuthorityDashboard = () => {
  const { user, signOut } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    {
      title: 'Total Institutions',
      value: '1,247',
      change: '+12%',
      trend: 'up',
      icon: Building2,
      color: 'blue'
    },
    {
      title: 'Certificates Verified',
      value: '234,567',
      change: '+8%',
      trend: 'up',
      icon: FileCheck,
      color: 'green'
    },
    {
      title: 'Pending Reviews',
      value: '89',
      change: '-15%',
      trend: 'down',
      icon: Clock,
      color: 'yellow'
    },
    {
      title: 'Flagged Documents',
      value: '23',
      change: '+5%',
      trend: 'up',
      icon: AlertTriangle,
      color: 'red'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'Institution Approved',
      institution: 'Delhi University',
      timestamp: '2 hours ago',
      status: 'completed'
    },
    {
      id: 2,
      action: 'Certificate Flagged',
      institution: 'Mumbai College',
      timestamp: '4 hours ago',
      status: 'pending'
    },
    {
      id: 3,
      action: 'Audit Report Generated',
      institution: 'IIT Bombay',
      timestamp: '1 day ago',
      status: 'completed'
    },
    {
      id: 4,
      action: 'New Institution Request',
      institution: 'Karnataka Institute',
      timestamp: '2 days ago',
      status: 'pending'
    }
  ];

  const pendingInstitutions = [
    {
      id: 1,
      name: 'National Institute of Technology',
      location: 'Bangalore, Karnataka',
      type: 'Engineering College',
      submittedDate: '2025-09-20',
      documents: 12,
      status: 'under_review'
    },
    {
      id: 2,
      name: 'St. Xavier\'s College',
      location: 'Mumbai, Maharashtra',
      type: 'Arts & Science College',
      submittedDate: '2025-09-18',
      documents: 8,
      status: 'documents_pending'
    }
  ];

  const institutions = [
    {
      id: 1,
      name: 'Indian Institute of Technology (ISM) Dhanbad',
      location: 'Dhanbad, Jharkhand',
      type: 'Indian Institute of Technology',
      established: '1926',
      students: '8,500',
      status: 'verified',
      lastAudit: '2025-08-15'
    },
    {
      id: 2,
      name: 'Ranchi University',
      location: 'Ranchi, Jharkhand',
      type: 'State University',
      established: '1960',
      students: '45,000',
      status: 'verified',
      lastAudit: '2025-07-20'
    },
    {
      id: 3,
      name: 'Birla Institute of Technology Mesra',
      location: 'Ranchi, Jharkhand',
      type: 'Private Deemed University',
      established: '1955',
      students: '12,000',
      status: 'verified',
      lastAudit: '2025-09-10'
    },
    {
      id: 4,
      name: 'National Institute of Technology Jamshedpur',
      location: 'Jamshedpur, Jharkhand',
      type: 'National Institute of Technology',
      established: '1960',
      students: '3,200',
      status: 'verified',
      lastAudit: '2025-08-30'
    },
    {
      id: 5,
      name: 'Sido Kanhu Murmu University',
      location: 'Dumka, Jharkhand',
      type: 'State University',
      established: '1992',
      students: '15,000',
      status: 'pending_review',
      lastAudit: '2025-06-15'
    },
    {
      id: 6,
      name: 'Central University of Jharkhand',
      location: 'Ranchi, Jharkhand',
      type: 'Central University',
      established: '2009',
      students: '2,800',
      status: 'verified',
      lastAudit: '2025-08-05'
    },
    {
      id: 7,
      name: 'Jharkhand Rai University',
      location: 'Ranchi, Jharkhand',
      type: 'Private University',
      established: '2008',
      students: '8,500',
      status: 'under_review',
      lastAudit: '2025-05-20'
    },
    {
      id: 8,
      name: 'Dr. Shyama Prasad Mukherjee University',
      location: 'Ranchi, Jharkhand',
      type: 'State University',
      established: '2017',
      students: '5,200',
      status: 'verified',
      lastAudit: '2025-07-10'
    },
    {
      id: 9,
      name: 'Kolhan University',
      location: 'Chaibasa, Jharkhand',
      type: 'State University',
      established: '2009',
      students: '18,000',
      status: 'verified',
      lastAudit: '2025-08-20'
    },
    {
      id: 10,
      name: 'Vinoba Bhave University',
      location: 'Hazaribagh, Jharkhand',
      type: 'State University',
      established: '1992',
      students: '25,000',
      status: 'pending_review',
      lastAudit: '2025-06-25'
    }
  ];

  const flaggedCertificates = [
    {
      id: 1,
      certificateId: 'CERT-2025-001234',
      studentName: 'Amit Kumar Singh',
      institution: 'Birla Institute of Technology Mesra',
      degree: 'B.Tech Computer Science',
      issueDate: '2025-06-15',
      flagReason: 'Suspicious signature verification',
      severity: 'high',
      status: 'investigating',
      location: 'Ranchi, Jharkhand'
    },
    {
      id: 2,
      certificateId: 'CERT-2025-005678',
      studentName: 'Priya Kumari',
      institution: 'Ranchi University',
      degree: 'M.Sc Mathematics',
      issueDate: '2025-07-20',
      flagReason: 'Grade discrepancy with academic records',
      severity: 'medium',
      status: 'investigating',
      location: 'Ranchi, Jharkhand'
    },
    {
      id: 3,
      certificateId: 'CERT-2025-009876',
      studentName: 'Ravi Oraon',
      institution: 'National Institute of Technology Jamshedpur',
      degree: 'B.E Mechanical Engineering',
      issueDate: '2025-08-10',
      flagReason: 'Duplicate certificate number detected',
      severity: 'critical',
      status: 'blocked',
      location: 'Jamshedpur, Jharkhand'
    },
    {
      id: 4,
      certificateId: 'CERT-2025-011223',
      studentName: 'Sneha Mahato',
      institution: 'Central University of Jharkhand',
      degree: 'MBA Finance',
      issueDate: '2025-09-05',
      flagReason: 'Inconsistent enrollment dates',
      severity: 'medium',
      status: 'resolved',
      location: 'Ranchi, Jharkhand'
    },
    {
      id: 5,
      certificateId: 'CERT-2025-013579',
      studentName: 'Deepak Tirkey',
      institution: 'Kolhan University',
      degree: 'B.Com Honours',
      issueDate: '2025-08-30',
      flagReason: 'Missing digital watermark',
      severity: 'high',
      status: 'investigating',
      location: 'Chaibasa, Jharkhand'
    },
    {
      id: 6,
      certificateId: 'CERT-2025-014567',
      studentName: 'Anjali Soren',
      institution: 'Sido Kanhu Murmu University',
      degree: 'B.A Political Science',
      issueDate: '2025-09-12',
      flagReason: 'Unauthorized modification detected',
      severity: 'critical',
      status: 'blocked',
      location: 'Dumka, Jharkhand'
    }
  ];

  const auditReports = [
    {
      id: 1,
      institution: 'Indian Institute of Technology Bombay',
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
      institution: 'University of Delhi',
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
      institution: 'Anna University',
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
      institution: 'Jadavpur University',
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
      institution: 'Vellore Institute of Technology',
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
      institution: 'Pune University',
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
                  className={`flex items-center space-x-2 px-3 py-2 font-medium text-sm rounded-md transition-colors ${
                    activeTab === tab.id
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
                        <div className={`flex items-center text-sm mt-2 ${
                          stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <TrendingUp className={`h-4 w-4 mr-1 ${
                            stat.trend === 'down' ? 'rotate-180' : ''
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
                        <div className={`p-2 rounded-full ${
                          activity.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
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
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            institution.status === 'under_review' 
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
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        institution.status === 'verified' 
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
                      <button className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                        Audit
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-900">Critical Alerts</h4>
                    <p className="text-2xl font-bold text-red-700">2</p>
                    <p className="text-sm text-red-600">Blocked certificates</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-900">Under Investigation</h4>
                    <p className="text-2xl font-bold text-orange-700">3</p>
                    <p className="text-sm text-orange-600">Being reviewed</p>
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
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900">Institutions Affected</h4>
                    <p className="text-2xl font-bold text-blue-700">5</p>
                    <p className="text-sm text-blue-600">Jharkhand universities</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Institution-wise Alert Distribution Chart */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Institution-wise Alert Distribution</h3>
                <p className="text-sm text-gray-600">Flagged certificates by Jharkhand institutions</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    { name: 'Birla Institute of Technology Mesra', alerts: 1, total: 1245, color: 'bg-red-500' },
                    { name: 'Ranchi University', alerts: 1, total: 3890, color: 'bg-orange-500' },
                    { name: 'NIT Jamshedpur', alerts: 1, total: 892, color: 'bg-red-500' },
                    { name: 'Central University of Jharkhand', alerts: 1, total: 567, color: 'bg-green-500' },
                    { name: 'Kolhan University', alerts: 1, total: 1234, color: 'bg-orange-500' },
                    { name: 'Sido Kanhu Murmu University', alerts: 1, total: 987, color: 'bg-red-500' }
                  ].map((institution, index) => {
                    const alertRate = (institution.alerts / institution.total * 100).toFixed(3);
                    const barWidth = Math.max((institution.alerts / institution.total) * 100 * 50, 2); // Scale for visibility
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700 truncate">{institution.name}</span>
                          <span className="text-xs text-gray-500">{institution.alerts}/{institution.total} ({alertRate}%)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${institution.color}`}
                              style={{ width: `${barWidth}px` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 w-12">{alertRate}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Alert Severity Timeline */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Alert Severity Timeline</h3>
                <p className="text-sm text-gray-600">Monthly alert trends in Jharkhand institutions</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Timeline Chart */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Last 6 Months Alert Pattern</h4>
                    <div className="space-y-3">
                      {[
                        { month: 'Apr 2025', critical: 0, high: 1, medium: 2 },
                        { month: 'May 2025', critical: 1, high: 0, medium: 1 },
                        { month: 'Jun 2025', critical: 0, high: 2, medium: 0 },
                        { month: 'Jul 2025', critical: 1, high: 1, medium: 3 },
                        { month: 'Aug 2025', critical: 0, high: 1, medium: 1 },
                        { month: 'Sep 2025', critical: 2, high: 1, medium: 1 }
                      ].map((data, index) => {
                        const total = data.critical + data.high + data.medium;
                        
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-medium text-gray-700">{data.month}</span>
                              <span className="text-gray-500">{total} alerts</span>
                            </div>
                            <div className="flex h-4 bg-gray-200 rounded-full overflow-hidden">
                              {data.critical > 0 && (
                                <div 
                                  className="bg-red-500 flex items-center justify-center text-xs text-white font-medium"
                                  style={{ width: `${(data.critical / total) * 100}%` }}
                                  title={`${data.critical} Critical`}
                                >
                                  {data.critical > 0 ? data.critical : ''}
                                </div>
                              )}
                              {data.high > 0 && (
                                <div 
                                  className="bg-orange-500 flex items-center justify-center text-xs text-white font-medium"
                                  style={{ width: `${(data.high / total) * 100}%` }}
                                  title={`${data.high} High`}
                                >
                                  {data.high > 0 ? data.high : ''}
                                </div>
                              )}
                              {data.medium > 0 && (
                                <div 
                                  className="bg-yellow-500 flex items-center justify-center text-xs text-white font-medium"
                                  style={{ width: `${(data.medium / total) * 100}%` }}
                                  title={`${data.medium} Medium`}
                                >
                                  {data.medium > 0 ? data.medium : ''}
                                </div>
                              )}
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>🔴 {data.critical} Critical</span>
                              <span>🟠 {data.high} High</span>
                              <span>🟡 {data.medium} Medium</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Summary Cards */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Alert Distribution</h4>
                    <div className="space-y-4">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="text-center">
                          <h5 className="font-semibold text-red-900">Critical Severity</h5>
                          <p className="text-xl font-bold text-red-700">4</p>
                          <p className="text-xs text-red-600">Total in 6 months</p>
                        </div>
                      </div>
                      
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="text-center">
                          <h5 className="font-semibold text-orange-900">High Severity</h5>
                          <p className="text-xl font-bold text-orange-700">6</p>
                          <p className="text-xs text-orange-600">Total in 6 months</p>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="text-center">
                          <h5 className="font-semibold text-yellow-900">Medium Severity</h5>
                          <p className="text-xl font-bold text-yellow-700">8</p>
                          <p className="text-xs text-yellow-600">Total in 6 months</p>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-center">
                          <h5 className="font-semibold text-blue-900">Most Affected</h5>
                          <p className="text-sm font-bold text-blue-700">Ranchi Region</p>
                          <p className="text-xs text-blue-600">3 institutions</p>
                        </div>
                      </div>
                    </div>
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
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              cert.severity === 'critical' 
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
                          <p className="text-sm text-gray-600 mb-1">📍 {cert.location}</p>
                          <p className="text-sm text-gray-500">📅 Issued: {cert.issueDate}</p>
                        </div>
                        
                        <div className="text-right">
                          <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${
                            cert.status === 'blocked' 
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
                        <button className="px-3 py-1.5 text-xs font-medium text-green-600 border border-green-600 rounded hover:bg-green-50 transition-colors">
                          Investigate
                        </button>
                        {cert.status !== 'blocked' && (
                          <button className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors">
                            Block Certificate
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

            {/* Verification vs Flagged Certificates Chart */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Certificate Verification Overview</h3>
                <p className="text-sm text-gray-600">Monthly comparison of verified vs flagged certificates</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Chart */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Last 6 Months Trend</h4>
                    <div className="space-y-3">
                      {[
                        { month: 'Apr 2025', verified: 8420, flagged: 23, total: 8443 },
                        { month: 'May 2025', verified: 9150, flagged: 31, total: 9181 },
                        { month: 'Jun 2025', verified: 7890, flagged: 19, total: 7909 },
                        { month: 'Jul 2025', verified: 9840, flagged: 42, total: 9882 },
                        { month: 'Aug 2025', verified: 8765, flagged: 28, total: 8793 },
                        { month: 'Sep 2025', verified: 6234, flagged: 18, total: 6252 }
                      ].map((data, index) => {
                        const verifiedPercentage = (data.verified / data.total) * 100;
                        const flaggedPercentage = (data.flagged / data.total) * 100;
                        
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-medium text-gray-700">{data.month}</span>
                              <span className="text-gray-500">{data.total.toLocaleString()} total</span>
                            </div>
                            <div className="flex h-6 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="bg-green-500 flex items-center justify-center text-xs text-white font-medium"
                                style={{ width: `${verifiedPercentage}%` }}
                              >
                                {verifiedPercentage > 15 ? `${data.verified.toLocaleString()}` : ''}
                              </div>
                              <div 
                                className="bg-red-500 flex items-center justify-center text-xs text-white font-medium"
                                style={{ width: `${flaggedPercentage}%` }}
                              >
                                {flaggedPercentage > 5 ? data.flagged : ''}
                              </div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>✅ {data.verified.toLocaleString()} verified ({verifiedPercentage.toFixed(1)}%)</span>
                              <span>🚩 {data.flagged} flagged ({flaggedPercentage.toFixed(1)}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Summary Stats */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Summary Statistics</h4>
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-900">Total Verified</p>
                            <p className="text-2xl font-bold text-green-700">50,299</p>
                            <p className="text-xs text-green-600">Last 6 months</p>
                          </div>
                          <div className="text-green-600">
                            <CheckCircle className="h-8 w-8" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-red-900">Total Flagged</p>
                            <p className="text-2xl font-bold text-red-700">161</p>
                            <p className="text-xs text-red-600">Last 6 months</p>
                          </div>
                          <div className="text-red-600">
                            <AlertTriangle className="h-8 w-8" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-900">Success Rate</p>
                            <p className="text-2xl font-bold text-blue-700">99.68%</p>
                            <p className="text-xs text-blue-600">Verification accuracy</p>
                          </div>
                          <div className="text-blue-600">
                            <TrendingUp className="h-8 w-8" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700 mb-2">Average Monthly Processing</p>
                          <p className="text-lg font-bold text-gray-900">8,410 certificates</p>
                          <p className="text-xs text-gray-500">27 flagged per month</p>
                        </div>
                      </div>
                    </div>
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
                              <div className={`px-2 py-1 rounded text-sm font-medium ${
                                report.score >= 90 ? 'bg-green-100 text-green-800' :
                                report.score >= 80 ? 'bg-blue-100 text-blue-800' :
                                report.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                Score: {report.score}%
                              </div>
                            )}
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              report.status === 'completed' 
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