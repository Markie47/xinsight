import React, { useState } from 'react';
import { Shield, BarChart3, Users, Activity, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAuth } from '../contexts/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock admin data
  const systemStats = {
    totalScans: 15742,
    accuracyRate: 98.5,
    avgProcessingTime: 2.3,
    systemUptime: 99.9,
    activeUsers: 1247,
    totalDoctors: 89,
    totalPatients: 1158
  };

  const usageData = [
    { month: 'Jan', scans: 1200, accuracy: 98.2 },
    { month: 'Feb', scans: 1350, accuracy: 98.4 },
    { month: 'Mar', scans: 1100, accuracy: 98.1 },
    { month: 'Apr', scans: 1400, accuracy: 98.6 },
    { month: 'May', scans: 1600, accuracy: 98.7 },
    { month: 'Jun', scans: 1750, accuracy: 98.5 }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 relative overflow-hidden">
      {/* Background blobs for depth */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-100/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-50/40 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md border border-slate-100 p-8 mb-8 hover:shadow-lg transition-shadow duration-300">
          <div className="flex flex-col sm:flex-row items-center sm:space-x-6 text-center sm:text-left gap-4">
            <div className="w-20 h-20 bg-purple-50 border border-purple-100 rounded-2xl flex flex-shrink-0 items-center justify-center shadow-sm">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-2xl object-cover" />
              ) : (
                <Shield className="h-10 w-10 text-purple-600" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-indigo-900 mb-2">Welcome, {user?.name || 'Admin'}</h1>
              <p className="text-slate-600 font-medium">Platform Administration & System Health</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-md border border-slate-100 mb-8 overflow-hidden">
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-1 sm:space-x-8 px-4 sm:px-8 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-5 px-3 border-b-2 font-bold text-sm transition-all duration-300 whitespace-nowrap focus:outline-none ${
                  activeTab === 'overview'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <BarChart3 className={`h-4 w-4 ${activeTab === 'overview' ? 'text-purple-600' : 'text-slate-400'}`} />
                  <span>System Overview</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in-up">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Total Scans</p>
                    <p className="text-2xl font-extrabold text-indigo-900">{systemStats.totalScans.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center space-x-4">
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                    <TrendingUp className="h-8 w-8 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Avg Accuracy</p>
                    <p className="text-2xl font-extrabold text-indigo-900">{systemStats.accuracyRate}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center space-x-4">
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                    <Clock className="h-8 w-8 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Avg Process Time</p>
                    <p className="text-2xl font-extrabold text-indigo-900">{systemStats.avgProcessingTime}s</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">System Uptime</p>
                    <p className="text-2xl font-extrabold text-indigo-900">{systemStats.systemUptime}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* User Demographics & Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* User Breakdowns */}
              <div className="bg-white rounded-xl shadow-md border border-slate-100 p-8 hover:shadow-lg transition-shadow duration-300 flex flex-col justify-center">
                <h2 className="text-xl font-bold text-indigo-900 mb-6 border-b border-slate-100 pb-4 flex items-center">
                  <Users className="h-5 w-5 mr-3 text-slate-400" />
                  Active Users
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-slate-600">Total Users</span>
                      <span className="text-xl font-extrabold text-indigo-900">{systemStats.activeUsers}</span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-slate-500">Doctors</span>
                      <span className="font-bold text-blue-600">{systemStats.totalDoctors}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mb-4">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${(systemStats.totalDoctors / systemStats.activeUsers) * 100}%` }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-slate-500">Patients</span>
                      <span className="font-bold text-emerald-600">{systemStats.totalPatients}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${(systemStats.totalPatients / systemStats.activeUsers) * 100}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-blue-900">
                      User growth is stable. No active bottlenecks in registration.
                    </p>
                  </div>
                </div>
              </div>

              {/* Usage Analytics */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-slate-100 p-8 hover:shadow-lg transition-shadow duration-300 overflow-x-auto">
                <h2 className="text-xl font-bold text-indigo-900 mb-6 border-b border-slate-100 pb-4">Monthly Scan Volume</h2>
                <div className="h-[300px] w-full min-w-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={usageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dx={-10} />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }} 
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ color: '#312e81', fontWeight: 600 }}
                      />
                      <Bar dataKey="scans" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}