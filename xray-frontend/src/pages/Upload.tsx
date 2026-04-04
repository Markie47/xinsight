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
}

type AnalysisMode = 'chest' | 'bone';

export default function Upload() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('chest');

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
    
    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const endpoint = `http://127.0.0.1:8000/${analysisMode}/predict`;
      const response = await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAnalysis(response.data);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(`Analysis failed. Please ensure the ${analysisMode} backend is running.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearUpload = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  };

  const isAbnormal = analysis?.patient_status === "Abnormal";
  const statusColor = isAbnormal ? "red" : "green";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            X-Insight AI Diagnostic Suite
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Diagnostic support for the Class of 2026. Select the scan type to begin.
          </p>
        </div>

        {/* --- Toggle Mode --- */}
        <div className="flex justify-center mb-10">
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border flex space-x-1">
            <button
              onClick={() => { setAnalysisMode('chest'); setAnalysis(null); }}
              className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                analysisMode === 'chest' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>Chest X-Ray</span>
            </button>
            <button
              onClick={() => { setAnalysisMode('bone'); setAnalysis(null); }}
              className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                analysisMode === 'bone' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Bone className="h-4 w-4" />
              <span>Skeletal X-Ray</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT COLUMN */}
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
                    <div className={`p-3 rounded-lg ${analysisMode === 'chest' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}>
                      {analysisMode === 'chest' ? <Activity className="h-6 w-6" /> : <Bone className="h-6 w-6" />}
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase">Target Engine</p>
                      <p className="font-bold text-gray-900">{analysisMode === 'chest' ? 'Chest-Net' : 'Bone-Net'}</p>
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
                    <p className="text-blue-900 font-bold">Processing {analysisMode} findings...</p>
                  </div>
                )}

                {/* Heatmaps */}
                {analysis && Object.keys(analysis.heatmaps).length > 0 && (
                  <div className="pt-8 border-t border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Pathology Heatmaps</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {Object.entries(analysis.heatmaps).map(([name, b64], idx) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-xl border">
                          <span className="block text-center text-xs font-black text-gray-500 mb-3 uppercase tracking-widest">{name}</span>
                          <img src={b64} alt={name} className="w-full rounded-lg shadow-sm bg-black" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
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
                
                <div className={`bg-${statusColor}-50 border-2 border-${statusColor}-100 rounded-2xl p-6`}>
                  <div className="flex items-center justify-between mb-6">
                    <span className={`text-sm font-black text-${statusColor}-800 uppercase tracking-widest`}>Patient Status</span>
                    <span className={`text-3xl font-black text-${statusColor}-600`}>{analysis.patient_status}</span>
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
              </div>
            ) : (
              <div className="text-center py-24 text-gray-400 italic">
                Awaiting {analysisMode} X-ray analysis...
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
    </div>
  );
}