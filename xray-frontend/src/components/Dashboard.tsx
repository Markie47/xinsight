import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, ChevronRight, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface HistoryRecord {
  id: string;
  user_id: string;
  image_type: string;
  diagnosis_results?: { status?: string; findings?: unknown };
  overall_confidence?: number | string;
  report_path: string;
  extra_metadata: string | null;
  created_at: string;
}

interface DisplayRecord extends HistoryRecord {
  patientId?: string;
  patientName?: string;
  diagnosis_result?: string;
  overall_confidence?: string;
  isDraft?: boolean;
}

function parseExtraMetadata(extraMetadata?: string | null) {
  if (!extraMetadata) return {};
  try {
    return typeof extraMetadata === 'string' ? JSON.parse(extraMetadata) : extraMetadata;
  } catch {
    return {};
  }
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [records, setRecords] = useState<DisplayRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleOpenReport = async (reportPath: string) => {
    if (!reportPath || !supabase) return;
    const { data, error } = await supabase.storage
      .from('reports')
      .createSignedUrl(reportPath, 60);

    if (error || !data?.signedUrl) {
      console.error('Unable to open report', error?.message || 'No signed URL');
      return;
    }

    window.open(data.signedUrl, '_blank');
  };

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      if (!supabase) {
        console.warn('Supabase client is not initialized. Unable to load history.');
        setRecords([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      let query = supabase
        .from('history')
        .select('*')
        .order('created_at', { ascending: false });

      if (user.id) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Unable to load history', error);
        setRecords([]);
      } else {
        const mapped = (data || []).map((record) => {
          const extra = parseExtraMetadata(record.extra_metadata);
          return {
            ...record,
            patientId: extra.patientId,
            patientName: extra.patientName,
            diagnosis_result: record.diagnosis_results?.status || extra.status || 'Unknown',
            overall_confidence: record.overall_confidence != null ? `${record.overall_confidence}%` : extra.confidence || 'N/A',
            isDraft: Boolean(extra.isDraft),
          };
        });
        setRecords(mapped);
      }
      setIsLoading(false);
    };

    if (!loading) {
      fetchHistory();
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-3xl border border-gray-200 p-10 bg-white shadow-sm text-center text-gray-500">Loading history...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-3xl border border-gray-200 p-10 bg-white shadow-sm text-center">
          <p className="text-lg font-semibold text-gray-900">Sign in to see your patient history.</p>
          <p className="mt-2 text-gray-500">Secure retention of previous X-ray reports, diagnoses, and export links.</p>
        </div>
      </div>
    );
  }

  const filteredRecords = records.filter((record) => {
    const extra = parseExtraMetadata(record.extra_metadata);
    const query = searchTerm.toLowerCase();
    const diagnosisValue = (record.diagnosis_result || extra.status || 'Unknown').toLowerCase();
    return (
      (record.patientName || record.patientId || extra.patientName || '').toLowerCase().includes(query) ||
      record.image_type.toLowerCase().includes(query) ||
      diagnosisValue.includes(query)
    );
  });

  const totalScans = records.length;
  const abnormalCount = records.filter((record) => {
    const extra = parseExtraMetadata(record.extra_metadata);
    const diagnosisValue = (record.diagnosis_result || extra.status || '').toLowerCase();
    return diagnosisValue.includes('abnormal');
  }).length;
  const normalCount = totalScans - abnormalCount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-blue-600 font-bold">Persistent Dashboard</p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">Patient History & Reports</h1>
          <p className="mt-2 text-gray-500 max-w-2xl">Your generated X-ray reports are now stored securely. Search, open patient profiles, download summaries, and resume drafts.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient, scan type, or diagnosis"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-blue-50 p-4 text-blue-600">
              <User className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Total scans</p>
              <p className="mt-3 text-3xl font-bold text-gray-900">{totalScans}</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-rose-50 p-4 text-rose-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Abnormal flags</p>
              <p className="mt-3 text-3xl font-bold text-gray-900">{abnormalCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Normal results</p>
              <p className="mt-3 text-3xl font-bold text-gray-900">{normalCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Patient</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Scan type</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Diagnosis</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Confidence</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Report</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 5 }, (_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-6 bg-gray-50" />
                  </tr>
                ))
              ) : filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-sm font-bold uppercase">
                          {(record.patientName || record.patientId || 'NA')
                            .split(' ')
                            .map((part) => part[0])
                            .join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{record.patientName || `Patient ${record.patientId || 'Unknown'}`}</p>
                          <p className="text-xs text-gray-500">ID: {record.patientId || 'Not assigned'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.image_type || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.diagnosis_result || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.overall_confidence || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {record.report_path ? (
                        <button
                          onClick={() => handleOpenReport(record.report_path)}
                          className="text-blue-600 font-semibold hover:text-blue-800"
                        >
                          View report
                        </button>
                      ) : (
                        <span className="text-gray-400">No report</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => navigate(record.patientId ? `/patient/${record.patientId}` : '/history')}
                        className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:text-blue-800"
                      >
                        View profile
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                    <div className="max-w-md mx-auto">
                      <p className="text-lg font-semibold">No stored reports matched your query.</p>
                      <p className="mt-2 text-sm text-gray-500">Upload a new X-ray to generate a report and keep it in the dashboard for future review.</p>
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
