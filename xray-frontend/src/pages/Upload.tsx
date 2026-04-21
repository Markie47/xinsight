import React, { useState, useCallback } from 'react';
import { Upload as UploadIcon, FileImage, X, Loader, CheckCircle, AlertTriangle, Quote } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
// --- 1. UPDATED INTERFACES ---
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
  heatmaps: Record<string, string>; // Maps a disease string to a Base64 string
  report_text: string;
}

export default function Upload() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Drag and drop handlers
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
      const response = await axios.post('http://127.0.0.1:8000/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setAnalysis(response.data);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Analysis failed. Please ensure the backend server is running and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearUpload = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
    setError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  // Helper variables for styling based on patient status
  const isAbnormal = analysis?.patient_status === "Abnormal";
  const statusColor = isAbnormal ? "red" : "emerald";

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Premium Gradient Overlays */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-600/[0.05] to-transparent pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-200/20 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-200/20 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12">
        <header className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-blue-100 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span>Intelligent Diagnostic System</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-indigo-950 mb-6 tracking-tight">
            X-Ray <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Intelligence</span> Portal
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Instantaneous, multi-label pathology detection powered by proprietary neural networks and BioBERT medical validation.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* ========================================== */}
          {/* LEFT COLUMN: UPLOAD & HEATMAPS             */}
          {/* ========================================== */}
          <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-8 sm:p-10 relative overflow-hidden group transition-all duration-500 hover:shadow-[0_30px_60px_rgba(59,130,246,0.1)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -z-10 transition-all duration-500 group-hover:w-40 group-hover:h-40" />
              
              <h2 className="text-2xl font-bold text-indigo-950 mb-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <UploadIcon className="h-5 w-5 text-white" />
                </div>
                Scan Submission
              </h2>
              
              {!uploadedFile ? (
                <div
                  className={`relative border-2 border-dashed rounded-3xl p-16 text-center transition-all duration-500 overflow-hidden ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50/50 shadow-inner' 
                      : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/50 bg-slate-50/20'
                  }`}
                  onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                >
                  <div className="bg-white w-24 h-24 rounded-3xl shadow-xl border border-slate-50 flex items-center justify-center mx-auto mb-8 transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <FileImage className="h-12 w-12 text-blue-500" />
                  </div>
                  <p className="text-2xl font-black text-indigo-950 mb-3">Drop file here</p>
                  <p className="text-slate-400 font-medium mb-10 text-lg">or browse from your device</p>
                  
                  <label className="group/btn relative inline-flex items-center justify-center px-10 py-4 text-base font-black text-white bg-indigo-950 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                    <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                    <UploadIcon className="h-5 w-5 mr-3 relative z-10" />
                    <span className="relative z-10 tracking-widest uppercase text-sm">Select Scan</span>
                    <input type="file" accept=".jpg,.jpeg,.png,.dcm" onChange={handleFileInputChange} className="hidden" />
                  </label>
                  
                  <div className="mt-8 flex justify-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>DICOM</span>
                    <span>•</span>
                    <span>JPEG</span>
                    <span>•</span>
                    <span>PNG</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Original Image Preview */}
                  <div className="relative group/preview overflow-hidden rounded-3xl border border-slate-200 shadow-2xl bg-indigo-950">
                    <img src={previewUrl!} alt="X-ray preview" className="w-full h-96 object-contain transition-transform duration-700 group-hover/preview:scale-110 opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/80 via-transparent to-transparent pointer-events-none" />
                    <button onClick={clearUpload} className="absolute top-6 right-6 bg-white/10 backdrop-blur-md text-white p-3 rounded-2xl shadow-lg border border-white/20 hover:bg-rose-500 hover:border-rose-400 transition-all duration-300 z-10 hover:scale-110">
                      <X className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between pointer-events-none">
                      <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-4 rounded-2xl shadow-2xl">
                        <p className="font-black text-white truncate max-w-[200px] mb-1">{uploadedFile.name}</p>
                        <p className="text-xs font-bold text-blue-300 uppercase tracking-widest">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • {uploadedFile.type || 'RAW'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {!analysis && !isAnalyzing && (
                    <button
                      onClick={handleAnalysis}
                      className="group/run relative w-full flex items-center justify-center px-8 py-6 text-base font-black text-white bg-blue-600 rounded-2xl shadow-xl shadow-blue-200 hover:shadow-2xl hover:shadow-blue-300 hover:bg-blue-700 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 group-hover/run:scale-110" />
                      <UploadIcon className="h-6 w-6 mr-3 relative z-10 group-hover/run:animate-bounce" />
                      <span className="relative z-10 tracking-widest uppercase">Start Neural Analysis</span>
                    </button>
                  )}
                  
                  {isAnalyzing && (
                    <div className="bg-white border border-blue-100 rounded-3xl p-12 text-center shadow-xl shadow-blue-50/50 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 overflow-hidden">
                        <div className="h-full bg-blue-600 w-1/3 animate-[progress_2s_infinite_linear]" style={{ backgroundSize: '200% 100%' }} />
                      </div>
                      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                        <Loader className="h-10 w-10 animate-spin text-blue-600" />
                      </div>
                      <p className="text-2xl font-black text-indigo-950 mb-3 tracking-tight">Processing Matrix</p>
                      <p className="text-blue-600 font-black text-xs uppercase tracking-widest animate-pulse">Running Multi-Label Pathway Inference</p>
                    </div>
                  )}

                  {/* --- HEATMAP GALLERY --- */}
                  {analysis && Object.keys(analysis.heatmaps).length > 0 && (
                    <div className="pt-10 space-y-6">
                      <h3 className="text-xl font-black text-indigo-950 flex items-center gap-3">
                        <div className="w-2 h-8 bg-blue-600 rounded-full" />
                        Pathological Focus Maps
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {Object.entries(analysis.heatmaps).map(([diseaseName, base64String], index) => (
                          <div key={index} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 hover:shadow-2xl transition-all duration-500 group/item">
                            <p className="text-[10px] font-black text-slate-400 mb-4 uppercase tracking-[0.2em] group-hover/item:text-blue-600 transition-colors">
                              {diseaseName} Focal Analysis
                            </p>
                            <div className="overflow-hidden rounded-2xl bg-indigo-950 aspect-square flex items-center shadow-inner ring-1 ring-slate-100">
                              <img src={base64String} alt={diseaseName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ========================================== */}
          {/* RIGHT COLUMN: CLINICAL REPORT & STATUS     */}
          {/* ========================================== */}
          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-8 sm:p-10 h-full min-h-[600px] hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] transition-shadow duration-500">
              <h2 className="text-2xl font-bold text-indigo-950 mb-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-950 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                Clinical Summary
              </h2>
              
              {!analysis && !isAnalyzing && (
                <div className="flex flex-col items-center justify-center h-full py-20 bg-slate-50/50 rounded-3xl border border-slate-100 border-dashed">
                  <div className="w-24 h-24 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-8 transform rotate-6 border border-slate-50">
                    <FileImage className="h-10 w-10 text-slate-200" />
                  </div>
                  <p className="text-xl font-bold text-slate-400 max-w-[280px] text-center leading-relaxed">
                    Submit binary data for comprehensive model synthesis.
                  </p>
                </div>
              )}

              {analysis && (
                <div className="space-y-10">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-3 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-black text-emerald-900 text-xs uppercase tracking-widest leading-none mt-0.5">Verification Confirmed</span>
                    </div>
                    <div className="px-5 py-3 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-3">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mt-0.5">Semantic Score</span>
                      <span className="text-sm font-black text-indigo-950">{(analysis.medical_validation.semantic_score * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  {/* --- STATUS BANNER --- */}
                  <div className={`relative rounded-3xl p-10 shadow-2xl overflow-hidden transition-all duration-500 ${isAbnormal ? 'bg-rose-600 shadow-rose-200' : 'bg-emerald-600 shadow-emerald-200'}`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                    
                    <p className="text-[11px] font-black text-white/70 uppercase tracking-[0.3em] mb-4">Diagnostic Priority</p>
                    <h3 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter mb-10 drop-shadow-lg">
                      {analysis.patient_status}
                    </h3>
                    
                    <div className="space-y-4">
                      <p className="text-[11px] font-black text-white/70 uppercase tracking-[0.3em]">Flagged Pathologies</p>
                      <div className="flex flex-wrap gap-3">
                        {analysis.flagged_conditions.map((item, idx) => (
                          <div key={idx} className="px-5 py-3 bg-black/20 backdrop-blur-md rounded-2xl text-sm font-black text-white border border-white/20 shadow-md flex items-center gap-3">
                            <span>{item.condition}</span> 
                            <div className="w-px h-3 bg-white/30" />
                            <span className="text-[10px] opacity-70 font-mono tracking-widest">{item.confidence}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* --- REPORT --- */}
                  <section className="space-y-6 pt-4">
                    <h3 className="text-xl font-black text-indigo-950 flex items-center gap-3">
                      <div className="w-2 h-8 bg-indigo-950 rounded-full" />
                      Detailed Model Synthesis
                    </h3>
                    <div className="bg-white text-slate-700 rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] prose prose-slate max-w-none prose-sm sm:prose-base leading-relaxed hover:border-blue-100 transition-colors">
                      <div className="absolute top-8 right-10">
                        <Quote className="h-10 w-10 text-slate-50" />
                      </div>
                      <ReactMarkdown 
                        components={{
                          strong: ({node, ...props}) => <strong className="font-black text-indigo-950" {...props} />,
                          h1: ({node, ...props}) => <h1 className="text-2xl font-black mt-8 mb-4 text-indigo-950 border-b-2 border-slate-50 pb-4 tracking-tight" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-xl font-black mt-8 mb-4 text-indigo-950 tracking-tight" {...props} />,
                          p: ({node, ...props}) => <p className="mb-6 text-slate-600 font-medium" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-none pl-0 mb-8 space-y-4" {...props} />,
                          li: ({node, ...props}) => (
                            <li className="flex items-start">
                              <span className="w-2 h-2 rounded-full bg-blue-500 mt-2.5 mr-4 flex-shrink-0" />
                              <span className="font-medium">{props.children}</span>
                            </li>
                          )
                        }}
                      >
                        {analysis.report_text}
                      </ReactMarkdown>
                    </div>
                  </section>
                </div>
              )}
              
              {error && (
                <div className="bg-rose-50 border border-rose-100 p-8 rounded-3xl mt-8 shadow-xl shadow-rose-100/50">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200">
                      <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-black text-rose-900 tracking-tight">System Exception</span>
                  </div>
                  <p className="text-sm text-rose-700 font-medium leading-relaxed pl-14">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
        .animate-fade-in-up { opacity: 0; animation: fade-in-up 0.8s ease-out forwards; }
      `}} />
    </div>
  );
}