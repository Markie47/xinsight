import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Activity, FileText, AlertTriangle, Loader } from 'lucide-react';

interface HistoryRecord {
  id: string;
  created_at: string;
  image_type: string;
  overall_confidence: number;
  diagnosis_results: { status: string; findings: any[] };
  report_path: string;
}

export default function History() {
  const { user } = useAuth();
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 🟢 TypeScript Fix 1: Ensure supabase is not null before querying
      if (!supabase) {
        throw new Error('Supabase client is not initialized. Check your environment variables.');
      }

      const { data, error } = await supabase
        .from('history')
        .select('id, created_at, image_type, overall_confidence, diagnosis_results, report_path')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (err: any) {
      console.error("Error fetching history:", err);
      setError(err.message || 'Failed to load history.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async (path: string) => {
    if (!path) {
      alert("No PDF report was generated or saved for this scan.");
      return;
    }
    
    try {
      // 🟢 TypeScript Fix 2: Ensure supabase is not null before accessing storage
      if (!supabase) {
        throw new Error('Supabase client is not initialized.');
      }

      // Generate a secure, temporary signed URL valid for 60 seconds
      const { data, error } = await supabase.storage
        .from('reports')
        .createSignedUrl(path, 60);

      if (error) throw error;
      
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (err: any) {
      console.error("Error opening report:", err);
      alert("Unable to open the report. " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="h-10 w-10 text-blue-600 animate-spin" />
          <p className="text-slate-600 font-medium">Loading your diagnostic history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-indigo-900 flex items-center gap-3">
            <Activity className="h-8 w-8 text-blue-600" />
            Patient Diagnostic History
          </h1>
          <p className="text-slate-600 mt-2">View your past X-ray uploads, AI analysis results, and downloadable reports.</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}
        
        <div className="bg-white shadow-md border border-slate-100 rounded-2xl overflow-hidden">
          {records.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <FileText className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <p className="text-lg font-medium text-slate-600">No diagnostic history found.</p>
              <p className="mt-1">Head over to the Dashboard to upload and analyze your first X-ray.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Scan Engine</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Diagnosis</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Confidence</th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Report Document</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {records.map((record) => {
                    const date = new Date(record.created_at).toLocaleDateString(undefined, { 
                      year: 'numeric', month: 'short', day: 'numeric' 
                    });
                    const time = new Date(record.created_at).toLocaleTimeString(undefined, { 
                      hour: '2-digit', minute: '2-digit' 
                    });
                    
                    let diagnosisText = record.diagnosis_results?.status || 'Unknown';
                    if (record.diagnosis_results?.findings && record.diagnosis_results.findings.length > 0) {
                      diagnosisText = record.diagnosis_results.findings[0].condition;
                    }

                    const isNormal = diagnosisText.toLowerCase() === 'normal';

                    return (
                      <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-slate-900">{date}</div>
                          <div className="text-xs text-slate-500">{time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 capitalize">
                            {record.image_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-bold ${isNormal ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {diagnosisText}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                          {record.overall_confidence ? `${Math.round(record.overall_confidence)}%` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {record.report_path ? (
                            <button
                              onClick={() => handleViewReport(record.report_path)}
                              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors font-semibold"
                            >
                              <FileText className="h-4 w-4" />
                              View PDF
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs italic px-4 py-2">
                              PDF Not Generated
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}