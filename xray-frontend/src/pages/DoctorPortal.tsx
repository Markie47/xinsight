import React, { useState } from 'react';
import { Stethoscope, FileText, Users, TrendingUp, Eye, CreditCard as Edit3, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function DoctorPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock doctor data
  const doctorData = {
    stats: {
      totalPatients: 156,
      pendingReviews: 8,
      analyzedToday: 24,
      accuracy: 97.2
    },
    pendingCases: [
      {
        id: '1',
        patientName: 'John Smith',
        age: 45,
        study: 'Chest X-Ray',
        aiConfidence: 94.2,
        aiFindings: 'Pneumonia detected in right lower lobe',
        uploadDate: '2025-01-15 14:30',
        priority: 'high'
      },
      {
        id: '2',
        patientName: 'Mary Johnson',
        age: 32,
        study: 'Wrist X-Ray',
        aiConfidence: 78.5,
        aiFindings: 'Possible fracture in scaphoid bone',
        uploadDate: '2025-01-15 13:15',
        priority: 'medium'
      },
      {
        id: '3',
        patientName: 'Robert Davis',
        age: 67,
        study: 'Chest X-Ray',
        aiConfidence: 89.3,
        aiFindings: 'Normal chest X-ray, no acute findings',
        uploadDate: '2025-01-15 12:00',
        priority: 'low'
      }
    ],
    recentActivity: [
      {
        id: '1',
        action: 'Reviewed chest X-ray for Sarah Wilson',
        timestamp: '2025-01-15 15:30',
        result: 'Confirmed AI diagnosis'
      },
      {
        id: '2',
        action: 'Modified report for Michael Brown',
        timestamp: '2025-01-15 14:45',
        result: 'Added clinical notes'
      },
      {
        id: '3',
        action: 'Approved AI analysis for Linda Taylor',
        timestamp: '2025-01-15 13:20',
        result: 'Report finalized'
      }
    ]
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'pending', label: 'Pending Reviews', icon: FileText },
    { id: 'patients', label: 'My Patients', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full" />
              ) : (
                <Stethoscope className="h-8 w-8 text-green-600" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h1>
              <p className="text-gray-600">Doctor Portal - Review AI analyses and manage patient cases</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Patients</p>
                    <p className="text-2xl font-bold text-gray-900">{doctorData.stats.totalPatients}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">{doctorData.stats.pendingReviews}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Analyzed Today</p>
                    <p className="text-2xl font-bold text-gray-900">{doctorData.stats.analyzedToday}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">AI Accuracy</p>
                    <p className="text-2xl font-bold text-gray-900">{doctorData.stats.accuracy}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {doctorData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.timestamp}</p>
                    </div>
                    <span className="text-sm font-medium text-green-600">{activity.result}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Pending AI Review Cases</h2>
            <div className="space-y-4">
              {doctorData.pendingCases.map((case_) => (
                <div key={case_.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{case_.patientName}</h3>
                      <p className="text-sm text-gray-600">Age: {case_.age} | {case_.study}</p>
                      <p className="text-sm text-gray-500">{case_.uploadDate}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        case_.priority === 'high' ? 'bg-red-100 text-red-800' :
                        case_.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {case_.priority} priority
                      </span>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">AI Confidence</p>
                        <p className="text-lg font-bold text-blue-600">{case_.aiConfidence}%</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-blue-900">AI Findings:</p>
                    <p className="text-blue-800">{case_.aiFindings}</p>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>Review Image</span>
                    </button>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2">
                      <Edit3 className="h-4 w-4" />
                      <span>Edit Report</span>
                    </button>
                    <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors duration-200">
                      Approve AI Diagnosis
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">My Patients</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Visit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Study
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {doctorData.pendingCases.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{patient.patientName}</div>
                          <div className="text-sm text-gray-500">Age: {patient.age}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.uploadDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.study}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          Pending Review
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-700">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-700">
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}