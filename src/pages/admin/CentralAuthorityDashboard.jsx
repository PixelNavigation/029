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
              { id: 'certificates', name: 'Certificate Oversight', icon: FileCheck },
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
              <p className="text-gray-500">Institution management features will be displayed here.</p>
            </div>
          </div>
        )}

        {activeTab === 'certificates' && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Certificate Oversight</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-500">Certificate oversight and verification features will be displayed here.</p>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Audit Reports</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-500">Audit reports and analytics will be displayed here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};