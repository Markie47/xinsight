import React, { useState, useCallback } from 'react';
import { 
  Upload as UploadIcon, 
  FileImage, 
  X, 
  Loader, 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  Bone 
} from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import ReportDownloader from '../components/ReportDownloader';

// --- 1. INTERFACES ---
interface FlaggedCondition {
  condition: string;
  confidence: string;
  probability: number;
}

interface MedicalValidation {
  status: string;
  match_category: string;
  semantic_score: number;
}

interface AnalysisResponse {
  patient_status: string;
  flagged_conditions: FlaggedCondition[];
  medical_validation: MedicalValidation;
  heatmaps: Record<string, string>;
  report_text: string;
  scan_type_detected?: string;
}

export default function Upload() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const [historyStatus, setHistoryStatus] = useState<string | null>(null);
  const [historyRecordId, setHistoryRecordId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileUpload = (file: File) => {
    if (file && (file.type.startsWith('image/') || file.type === 'application/dicom')) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setAnalysis(null);
      setError(null);
    } else {
      setError("Unsupported file type. Please upload an image or DICOM file.");
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleAnalysis = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    setAnalysis(null);
    setError(null);
    setShowReportPreview(false);
    setHistoryStatus(null);
    setDownloadStatus(null);
    
    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const endpoint = `http://127.0.0.1:8000/smart-predict`;
      const response = await axios.post(endpoint, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'user-id': user?.id || '' 
        },
      });
      
      setAnalysis(response.data);
      
      if (user) {
        await saveHistoryDraft(response.data);
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(`Analysis failed. Please ensure the FastAPI backend is running.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getOverallConfidence = (analysisData?: AnalysisResponse) => {
    const data = analysisData || analysis;
    if (!data) return 'N/A';
    const bestProbability = data.flagged_conditions.reduce((max, item) => Math.max(max, item.probability), 0);
    return `${Math.round((bestProbability || data.medical_validation.semantic_score || 0) * 100)}%`;
  };

  const saveHistoryDraft = async (analysisData: AnalysisResponse) => {
    if (!user || !supabase) {
      setHistoryStatus('History draft not saved: missing user or Supabase connection.');
      return null;
    }

    const historyPayload = {
      user_id: user.id,
      image_type: analysisData.scan_type_detected || 'unknown',
      diagnosis_results: {
        status: analysisData.patient_status || 'Unknown',
        findings: analysisData.flagged_conditions,
      },
      overall_confidence: parseFloat(getOverallConfidence(analysisData)) || 0,
      report_path: '',
    };

    const { data, error } = await supabase
      .from('history')
      .insert([historyPayload])
      .select('id')
      .single();

    if (error) {
      console.error('Failed to save history draft', error);
      setHistoryStatus(`History draft failed: ${error.message}`);
      return null;
    }

    setHistoryRecordId(data?.id ?? null);
    setHistoryStatus('History draft saved. Report will update after download.');
    return data?.id ?? null;
  };

  const handleSavedReport = async (pdfBlob: Blob, filename: string) => {
    if (!user || !supabase) {
      const reason = !user ? 'User session not available yet.' : 'Supabase client is not configured.';
      setDownloadStatus(`Report downloaded locally, but cannot persist to history: ${reason}`);
      return;
    }

    setUploadingReport(true);
    setDownloadStatus('Saving report to Supabase...');

    const storagePath = `${user.id}/${Date.now()}_${filename}`;

    if (pdfBlob.size > 50 * 1024 * 1024) {
      setDownloadStatus('Downloaded locally, but failed to save report to Supabase storage: PDF is too large for Supabase upload.');
      setUploadingReport(false);
      return;
    }

    const { error: storageError } = await supabase.storage
      .from('reports')
      .upload(storagePath, pdfBlob, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'application/pdf',
      });

    if (storageError) {
      console.error('Failed to save report in Supabase storage', storageError);
      setDownloadStatus(`Downloaded locally, but failed to save report to Supabase storage: ${storageError.message}`);
      setUploadingReport(false);
      return;
    }

    if (historyRecordId) {
      const { error: updateError } = await supabase
        .from('history')
        .update({ report_path: storagePath })
        .eq('id', historyRecordId);

      if (updateError) {
        console.error('Failed to update history record with storage path', updateError);
        setDownloadStatus(`Report saved to storage, but failed to update history: ${updateError.message}`);
        setUploadingReport(false);
        return;
      }
    } else {
      const { data: insertedData, error: dbError } = await supabase.from('history').insert([{
        user_id: user.id,
        image_type: analysis?.scan_type_detected || 'unknown',
        diagnosis_results: {
          status: analysis?.patient_status || 'Unknown',
          findings: analysis?.flagged_conditions || [],
        },
        overall_confidence: parseFloat(getOverallConfidence()) || 0,
        report_path: storagePath
      }]).select('id').single();

      if (dbError) {
        console.error('Failed to save report record in Supabase database', dbError);
        setDownloadStatus(`Report saved to storage, but failed to record history: ${dbError.message}`);
        setUploadingReport(false);
        return;
      }
      setHistoryRecordId(insertedData?.id ?? null);
    }

    setDownloadStatus('Report saved to Supabase storage and patient history.');
    setHistoryStatus('Report stored in patient history and available on the dashboard.');
    setUploadingReport(false);
  };

  const clearUpload = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
    setError(null);
    setDownloadStatus(null);
    setShowReportPreview(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  };

  const isAbnormal = analysis?.patient_status === 'Abnormal';

  return (
    <div className="min-h-screen bg-gray-50 py-12 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            X-Insight AI Diagnostic Suite
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Diagnostic support for the Class of 2026. Upload your scan to begin.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <UploadIcon className="h-6 w-6 text-blue-600" />
              <span>Image Upload</span>
            </h2>
            
            {!uploadedFile ? (
              <div
                className={`border-2 border-dashed rounded-xl p-16 text-center transition-all duration-300 ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'
                }`}
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              >
                <FileImage className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                <p className="text-xl font-semibold text-gray-700">Drop your X-ray here</p>
                <label className="mt-8 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 cursor-pointer inline-flex items-center space-x-3">
                  <UploadIcon className="h-5 w-5" />
                  <span>Choose File</span>
                  <input type="file" accept=".jpg,.jpeg,.png,.dcm" onChange={handleFileInputChange} className="hidden" />
                </label>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="relative group">
                  <img src={previewUrl!} alt="Preview" className="w-full h-96 object-contain bg-black rounded-xl shadow-inner" />
                  <button onClick={clearUpload} className="absolute top-4 right-4 bg-red-500 text-white p-3 rounded-full hover:bg-red-600 shadow-lg">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${analysis?.scan_type_detected === 'bone' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>
                      {analysis?.scan_type_detected === 'bone' ? <Bone className="h-6 w-6" /> : <Activity className="h-6 w-6" />}
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase">Target Engine</p>
                      <p className="font-bold text-gray-900">
                        {!analysis && !isAnalyzing ? 'Auto-Detect Ready' : 
                         isAnalyzing ? 'Routing Scan...' :
                         analysis?.scan_type_detected === 'chest' ? 'Chest-Net' : 'Bone-Net'}
                      </p>
                    </div>
                  </div>
                  
                  {!analysis && !isAnalyzing && (
                    <button
                      onClick={handleAnalysis}
                      className="bg-green-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-green-700 shadow-lg flex items-center space-x-3"
                    >
                      <Activity className="h-5 w-5" />
                      <span>Analyze Scan</span>
                    </button>
                  )}
                </div>
                
                {isAnalyzing && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 text-center animate-pulse">
                    <Loader className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-blue-900 font-bold">Processing scan and synthesizing findings...</p>
                  </div>
                )}

                {analysis && Object.keys(analysis.heatmaps).length > 0 && (
                  <div className="pt-8 border-t border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Pathology Heatmaps</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {Object.entries(analysis.heatmaps).map(([name, b64], idx) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-xl border">
                          <span className="block text-center text-xs font-black text-gray-500 mb-3 uppercase tracking-widest">{name}</span>
                          <img 
                            src={b64.startsWith('data:') ? b64 : `data:image/png;base64,${b64}`} 
                            alt={name} 
                            className="w-full rounded-lg shadow-sm bg-black" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 h-fit">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span>Results</span>
            </h2>
            
            {analysis ? (
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center space-x-3">
                    {isAbnormal ? <AlertTriangle className="h-6 w-6 text-red-500" /> : <CheckCircle className="h-6 w-6 text-green-500" />}
                    <span className="font-bold text-gray-800">Validation: Complete</span>
                  </div>
                  <div className="text-[10px] font-black bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full uppercase border border-blue-100">
                    {analysis.medical_validation.match_category}
                  </div>
                </div>
                
                <div className={`rounded-2xl p-6 border-2 ${
                  isAbnormal ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'
                }`}>
                  <div className="flex items-center justify-between mb-6">
                    <span className={`text-sm font-black uppercase tracking-widest ${
                      isAbnormal ? 'text-red-800' : 'text-green-800'
                    }`}>Patient Status</span>
                    <span className={`text-3xl font-black ${
                      isAbnormal ? 'text-red-600' : 'text-green-600'
                    }`}>{analysis.patient_status}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.flagged_conditions.map((item, idx) => (
                      <div key={idx} className="px-4 py-2 bg-white text-gray-800 rounded-xl text-sm font-bold shadow-sm border">
                        {item.condition} <span className="text-xs text-gray-400">({item.confidence})</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 text-lg">Radiology Report</h3>
                  <div className="bg-gray-900 text-gray-100 rounded-2xl p-6 text-sm font-mono border-l-4 border-blue-500 overflow-y-auto max-h-[500px]">
                    <ReactMarkdown 
                      components={{
                        h1: ({...props}) => <h1 className="text-xl font-bold text-blue-400 mb-4" {...props} />,
                        h2: ({...props}) => <h2 className="text-lg font-bold text-blue-300 mt-6 mb-3" {...props} />,
                        p: ({...props}) => <p className="mb-4 text-gray-300" {...props} />,
                        ul: ({...props}) => <ul className="list-disc pl-6 mb-4" {...props} />,
                      }}
                    >
                      {analysis.report_text}
                    </ReactMarkdown>
                  </div>
                </div>

                <button
                  onClick={() => setShowReportPreview(true)}
                  className="w-full inline-flex justify-center items-center space-x-2 rounded-2xl bg-indigo-600 px-6 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-indigo-700"
                >
                  <FileImage className="h-5 w-5" />
                  <span>Generate & Preview Report</span>
                </button>
                
                {downloadStatus && (
                  <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                    {uploadingReport ? 'Saving report to Supabase...' : downloadStatus}
                  </div>
                )}
                {historyStatus && (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
                    {historyStatus}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-24 text-gray-400 italic">
                Awaiting X-ray upload and analysis...
              </div>
            )}
            
            {error && (
              <div className="bg-red-600 text-white p-6 rounded-2xl mt-8 shadow-xl flex items-start space-x-4">
                <AlertTriangle className="h-6 w-6 flex-shrink-0" />
                <p className="font-medium text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showReportPreview && analysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6 overflow-hidden">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50/80 rounded-t-3xl">
              <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-3">
                <FileImage className="h-6 w-6 text-indigo-600" />
                <span>Diagnostic Report Preview</span>
              </h3>
              <button 
                onClick={() => setShowReportPreview(false)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Close Preview"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-100">
              <div className="bg-white shadow-sm border border-gray-200 rounded-xl max-w-4xl mx-auto">
                <ReportDownloader
                  patientName={user?.name || user?.email?.split('@')[0] || 'X-Insight Patient'}
                  patientGender="Not specified"
                  patientId={user?.id || 'PID-2026-001'}
                  reportDate={new Date().toLocaleDateString()}
                  scanType={analysis.scan_type_detected || 'Bone / Chest'}
                  status={analysis.patient_status || 'Unknown'}
                  diagnosisResult={
                    analysis.flagged_conditions.length > 0 
                      ? analysis.flagged_conditions.map(c => c.condition).join(', ') 
                      : 'No abnormality detected'
                  }
                  confidence={getOverallConfidence()}
                  originalImage={previewUrl || ''}
                  heatmaps={analysis.heatmaps}
                  finalDiagnosis={analysis.report_text.replace(/##\s+/g, '').trim() || 'No findings available.'}
                  onDownload={async (blob, filename) => {
                    await handleSavedReport(blob, filename);
                    setShowReportPreview(false); 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}