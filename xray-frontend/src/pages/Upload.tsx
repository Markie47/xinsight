import React, { useState, useCallback } from 'react';
import { Upload as UploadIcon, FileImage, X, Loader, CheckCircle, AlertTriangle } from 'lucide-react';
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
  const statusColor = isAbnormal ? "red" : "green";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            X-Ray Analysis Upload
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your X-ray image for AI-powered analysis. Supports JPG, PNG, and DICOM formats.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ========================================== */}
          {/* LEFT COLUMN: UPLOAD & HEATMAPS             */}
          {/* ========================================== */}
          <div className="bg-white rounded-xl shadow-lg p-8 h-fit">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Upload X-Ray Image</h2>
            
            {!uploadedFile ? (
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors duration-200 ${
                  dragActive 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              >
                <FileImage className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl font-medium text-gray-700 mb-2">Drop your X-ray image here</p>
                <p className="text-gray-500 mb-6">or click to browse files</p>
                <label className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 cursor-pointer inline-flex items-center space-x-2">
                  <UploadIcon className="h-5 w-5" />
                  <span>Choose File</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.dcm"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Original Image Preview */}
                <div className="relative">
                  <img src={previewUrl!} alt="Uploaded X-ray" className="w-full h-80 object-contain bg-black rounded-lg" />
                  <button onClick={clearUpload} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors duration-200">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  
                  {!analysis && !isAnalyzing && (
                    <button
                      onClick={handleAnalysis}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <UploadIcon className="h-5 w-5" />
                      <span>Analyze X-Ray</span>
                    </button>
                  )}
                </div>
                
                {isAnalyzing && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-blue-800 font-medium">Analyzing X-ray image...</p>
                    <p className="text-blue-600 text-sm mt-2">Evaluating multi-label pathologies...</p>
                  </div>
                )}

                {/* --- SHIFTED HEATMAP GALLERY --- */}
                {/* Now renders directly below the uploaded image in the left column */}
                {analysis && Object.keys(analysis.heatmaps).length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Diagnostic Heatmaps</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(analysis.heatmaps).map(([diseaseName, base64String], index) => (
                        <div key={index} className="flex flex-col space-y-2 bg-gray-50 p-3 rounded-lg border">
                          <span className="text-sm font-bold text-gray-800 text-center uppercase tracking-wide">
                            {diseaseName}
                          </span>
                          <img 
                            src={base64String} 
                            alt={`Heatmap for ${diseaseName}`} 
                            className="w-full object-contain bg-black rounded shadow-sm" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* ========================================== */}
          {/* RIGHT COLUMN: CLINICAL REPORT & STATUS     */}
          {/* ========================================== */}
          <div className="bg-white rounded-xl shadow-lg p-8 h-fit">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Analysis Results</h2>
            
            {!analysis && !isAnalyzing && (
              <div className="text-center py-12">
                <FileImage className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Upload and analyze an X-ray to see results</p>
              </div>
            )}

            {analysis && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {isAbnormal ? (
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    ) : (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    )}
                    <span className="font-semibold text-gray-900">Analysis Complete</span>
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    BioBERT Match: {analysis.medical_validation.match_category} ({(analysis.medical_validation.semantic_score * 100).toFixed(1)}%)
                  </div>
                </div>
                
                {/* --- MULTI-LABEL STATUS BANNER --- */}
                <div className={`bg-${statusColor}-50 border border-${statusColor}-200 rounded-lg p-4`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`font-medium text-${statusColor}-800`}>Patient Status</span>
                    <span className={`text-2xl font-bold text-${statusColor}-600 uppercase`}>
                      {analysis.patient_status}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {analysis.flagged_conditions.map((item, idx) => (
                      <span key={idx} className={`px-3 py-1 bg-${statusColor}-100 text-${statusColor}-800 rounded-full text-sm font-medium border border-${statusColor}-300`}>
                        {item.condition} <span className="opacity-75">({item.confidence})</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* --- LLM REPORT --- */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Synthesized Clinical Report</h3>
                  <div className="bg-gray-50 rounded-lg p-5 border text-gray-800 text-sm leading-relaxed shadow-inner">
                    <ReactMarkdown 
                      components={{
                        strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                        h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-4 mb-2 text-gray-900" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-md font-bold mt-3 mb-1" {...props} />,
                        p: ({node, ...props}) => <p className="mb-3" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li {...props} />
                      }}
                    >
                      {analysis.report_text}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mt-6">
                <p className="font-bold flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>An Error Occurred</span>
                </p>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}