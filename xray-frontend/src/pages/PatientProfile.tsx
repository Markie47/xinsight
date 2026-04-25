import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Calendar, FileText, Bookmark, Download, ChevronRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface HistoryRecord {
  id: string;
  user_id: string;
  image_type: string;
  diagnosis_results?: { status?: string; findings?: unknown };
  diagnosis_result?: string;
  overall_confidence?: string;
  report_path: string;
  extra_metadata: string | null;
  created_at: string;
}

interface ParsedExtraMetadata {
  isDraft?: boolean;
  patientId?: string;
  patientName?: string;
  reportText?: string;
  status?: string;
  confidence?: string;
}

function parseExtraMetadata(extraMetadata?: string | null): ParsedExtraMetadata {
  if (!extraMetadata) return {};
  try {
    return typeof extraMetadata === 'string' ? JSON.parse(extraMetadata) : extraMetadata;
  } catch {
    return {};
  }
}

export default function PatientProfile() {
  const { patientId } = useParams<{ patientId: string }>();
  const { user } = useAuth();
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !patientId) return;

    const fetchPatientHistory = async () => {
      setIsLoading(true);
      if (!supabase) {
        console.warn('Supabase client is not initialized. Patient history cannot be loaded.');
        setRecords([]);
        setIsLoading(false);
        return;
      }

      let query = supabase
        .from('history')
        .select('*')
        .order('created_at', { ascending: false });

      if (user.id) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to load patient history', error);
        setRecords([]);
        setIsLoading(false);
        return;
      }

      const filtered = (data ?? []).filter((row) => {
        const parsed = parseExtraMetadata(row.extra_metadata);
        return parsed.patientId === patientId;
      });

      const normalized = filtered.map((row) => {
        const extra = parseExtraMetadata(row.extra_metadata);
        return {
          ...row,
          diagnosis_result: row.diagnosis_results?.status || extra.status || 'Unknown',
          overall_confidence: row.overall_confidence || extra.confidence || 'N/A',
        };
      });
      setRecords(normalized as HistoryRecord[]);
      setIsLoading(false);
    };

    fetchPatientHistory();
  }, [user, patientId]);

  const patientName = records.find(Boolean) ? (parseExtraMetadata(records[0].extra_metadata).patientName || '') : '';
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </button>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 mb-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-blue-600 font-bold">Patient profile</p>
            <h1 className="mt-3 text-3xl font-bold text-gray-900">{patientName || `Patient ${patientId}`}</h1>
            <p className="mt-2 text-gray-500 max-w-2xl">Review longitudinal visits and see whether flagged conditions are improving, stable, or worsening.</p>
          </div>
          <div className="rounded-3xl bg-blue-50 px-5 py-4 border border-blue-100 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-blue-500 font-black">Patient ID</p>
            <p className="mt-2 text-xl font-bold text-blue-900">{patientId}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm">
          <p className="text-sm text-gray-500 uppercase tracking-[0.2em] font-semibold">Total visits</p>
          <p className="mt-4 text-4xl font-bold text-gray-900">{records.length}</p>
        </div>
        <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm">
          <p className="text-sm text-gray-500 uppercase tracking-[0.2em] font-semibold">Last diagnosis</p>
          <p className="mt-4 text-2xl font-bold text-gray-900">{records[0]?.diagnosis_result || 'N/A'}</p>
        </div>
        <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm">
          <p className="text-sm text-gray-500 uppercase tracking-[0.2em] font-semibold">Latest confidence</p>
          <p className="mt-4 text-2xl font-bold text-gray-900">{records[0]?.overall_confidence || 'N/A'}</p>
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="rounded-3xl border border-gray-200 p-8 bg-gray-50 text-center">
            <p className="text-gray-500">Loading patient timeline...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 p-10 text-center bg-white">
            <Bookmark className="mx-auto h-10 w-10 text-blue-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-900">No patient records found</h2>
            <p className="mt-2 text-gray-500">This patient profile has no saved reports yet. Generate a report from Upload and assign the patient ID.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => {
              const extra = parseExtraMetadata(record.extra_metadata);
              return (
                <div key={record.id} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 uppercase tracking-[0.2em] font-semibold">Visit</p>
                      <p className="mt-2 text-xl font-bold text-gray-900">{new Date(record.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className={`inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold px-3 py-2 rounded-full ${
                        (record.diagnosis_result || 'Unknown').toLowerCase().includes('abnormal')
                          ? 'border-rose-200 text-rose-700 bg-rose-50'
                          : 'border-emerald-200 text-emerald-700 bg-emerald-50'
                      }`}>
                      {record.diagnosis_result || 'Unknown'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">Scan type</p>
                        <p className="mt-3 text-lg font-bold text-gray-900">{record.image_type || 'Unknown'}</p>
                      </div>
                      <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">Confidence</p>
                        <p className="mt-3 text-lg font-bold text-gray-900">{record.overall_confidence || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">Extra analysis</p>
                      <p className="mt-3 text-sm text-gray-700 whitespace-pre-line">{extra.reportText || 'None available'}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3 items-center">
                    <button
                      onClick={() => navigate(`/upload?draftId=${record.id}`)}
                      className="inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                      <ArrowRight className="h-4 w-4" /> {extra.isDraft ? 'Continue draft' : 'Review report'}
                    </button>
                    <button
                      onClick={() => {
                        const content = [
                          `Patient ID: ${extra.patientId || 'N/A'}`,
                          `Patient name: ${extra.patientName || 'N/A'}`,
                          `Diagnosis: ${record.diagnosis_result}`,
                          `Confidence: ${record.overall_confidence}`,
                          `Notes: ${extra.reportText || 'No additional notes.'}`,
                        ].join('\n\n');
                        const blob = new Blob([content], { type: 'text/plain' });
                        const href = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = href;
                        link.download = `report-${record.id}.txt`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(href);
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-100 text-slate-900 px-4 py-2 text-sm font-semibold hover:bg-slate-200 transition-colors"
                    >
                      <Download className="h-4 w-4" /> Download notes
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
