import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, FileText, ChevronRight, User, AlertCircle, CheckCircle } from 'lucide-react';

interface PatientRecord {
  id: string;
  name: string;
  date: string;
  status: 'Normal' | 'Abnormal';
  pathology: string;
  confidence: string;
}

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulated data for demonstration - in a real app, this would fetch from your SQLite/Backend
  useEffect(() => {
    const timer = setTimeout(() => {
      setRecords([
        { id: '1', name: 'John Doe', date: '2026-03-28', status: 'Abnormal', pathology: 'Pneumonia', confidence: '98.5%' },
        { id: '2', name: 'Jane Smith', date: '2026-03-27', status: 'Normal', pathology: 'None', confidence: '99.2%' },
        { id: '3', name: 'Robert Brown', date: '2026-03-25', status: 'Abnormal', pathology: 'Cardiomegaly', confidence: '94.1%' },
        { id: '4', name: 'Emily Davis', date: '2026-03-24', status: 'Normal', pathology: 'None', confidence: '99.8%' },
        { id: '5', name: 'Michael Wilson', date: '2026-03-22', status: 'Abnormal', pathology: 'Effusion', confidence: '87.4%' },
      ]);
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredRecords = records.filter(record => 
    record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.pathology.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient History</h1>
          <p className="text-gray-500">Manage and review previous AI radiological analyses.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by name or pathology..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4 transition-transform hover:scale-105">
          <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
            <User className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Scans</p>
            <p className="text-2xl font-bold text-gray-900">{records.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4 transition-transform hover:scale-105">
          <div className="bg-rose-50 p-3 rounded-lg text-rose-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Flagged Abnormal</p>
            <p className="text-2xl font-bold text-gray-900">{records.filter(r => r.status === 'Abnormal').length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4 transition-transform hover:scale-105">
          <div className="bg-emerald-50 p-3 rounded-lg text-emerald-600">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Normal Results</p>
            <p className="text-2xl font-bold text-gray-900">{records.filter(r => r.status === 'Normal').length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-sm font-bold text-gray-700">Patient</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700">Date</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700">Status</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700">Pathology</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4 bg-gray-50/50 h-16"></td>
                  </tr>
                ))
              ) : filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                          {record.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-gray-900">{record.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {record.date}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        record.status === 'Abnormal' 
                          ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{record.pathology}</span>
                        <span className="text-xs text-gray-500">Confidence: {record.confidence}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="inline-flex items-center text-blue-600 hover:text-blue-800 font-bold text-sm transition-colors uppercase tracking-wider">
                        View Report
                        <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-500 font-medium">
                    <div className="max-w-xs mx-auto">
                      <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p>No health records found matching "{searchTerm}"</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
