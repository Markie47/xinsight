import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface ReportProps {
  patientName: string;
  patientGender: string;
  patientId: string;
  reportDate: string;
  scanType: string;
  diagnosisResult: string;
  confidence: string;
  status: string;
  heatmapUrl: string;
  finalDiagnosis: string;
  onDownload?: (pdfBlob: Blob, filename: string) => Promise<void>;
}

export default function ReportDownloader(props: ReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    const element = reportRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.75);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      const fileName = `${props.patientName.replace(/\s+/g, '_')}_XInsight_Report.pdf`;
      const pdfBlob = pdf.output('blob');

      if (props.onDownload) {
        await props.onDownload(pdfBlob, fileName);
      }

      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-blue-600 font-bold">AI Diagnostic Report</p>
          <h2 className="mt-3 text-2xl font-bold text-gray-900">Downloadable Report Preview</h2>
          <p className="mt-2 text-sm text-gray-500 max-w-2xl">This report template can be exported as a PDF after analysis completes.</p>
        </div>
        <button
          onClick={handleDownloadPdf}
          className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700"
        >
          Download AI Diagnostic Report
        </button>
      </div>

      <div ref={reportRef} className="bg-white text-black w-full max-w-5xl mx-auto p-10 border border-gray-200 rounded-3xl shadow-inner">
        <div className="text-center border-b-2 border-gray-800 pb-4 mb-8">
          <h1 className="text-3xl font-bold uppercase tracking-wide text-blue-900">X-Insight</h1>
          <p className="text-gray-600 font-medium text-lg mt-1">AUTOMATED AI DIAGNOSTIC REPORT</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold border-b-2 border-gray-200 mb-4 text-gray-800 pb-1">Patient Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base bg-gray-50 p-4 rounded border">
            <p><span className="font-semibold text-gray-600">Patient Name:</span> {props.patientName}</p>
            <p><span className="font-semibold text-gray-600">Gender:</span> {props.patientGender}</p>
            <p><span className="font-semibold text-gray-600">Patient ID:</span> {props.patientId}</p>
            <p><span className="font-semibold text-gray-600">Date of Analysis:</span> {props.reportDate}</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold border-b-2 border-gray-200 mb-4 text-gray-800 pb-1">Analysis Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base bg-slate-50 p-4 rounded border">
            <p><span className="font-semibold text-gray-600">Scan Type:</span> {props.scanType || 'Unknown'}</p>
            <p><span className="font-semibold text-gray-600">Status:</span> {props.status || 'Unknown'}</p>
            <p><span className="font-semibold text-gray-600">Diagnosis:</span> {props.diagnosisResult || 'Unknown'}</p>
            <p><span className="font-semibold text-gray-600">Confidence:</span> {props.confidence || 'N/A'}</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold border-b-2 border-gray-200 mb-4 text-gray-800 pb-1">Diagnostic Imaging (AI Heatmap)</h2>
          <div className="mt-4 flex justify-center bg-gray-900 p-4 rounded shadow-inner">
            {props.heatmapUrl ? (
              <img
                src={props.heatmapUrl}
                alt="AI Generated Heatmap"
                className="max-w-[450px] max-h-[500px] object-contain rounded"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400 italic">
                No imaging provided for this report.
              </div>
            )}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-bold border-b-2 border-gray-200 mb-4 text-gray-800 pb-1">AI Model Findings</h2>
          <div className="bg-blue-50 border border-blue-100 p-5 rounded">
            <p className="whitespace-pre-wrap text-gray-800 text-base leading-relaxed">
              {props.finalDiagnosis}
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t-2 border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <p className="font-bold text-lg text-gray-800">Generated by X-Insight AI</p>
              <p className="text-gray-500 text-sm mt-1">Model Version: v1.0 (Automated Analysis)</p>
              <p className="text-gray-500 text-sm">Timestamp: {new Date().toLocaleString()}</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-xs text-gray-400 max-w-[250px] italic">
                Disclaimer: This report is generated by an artificial intelligence model and is intended to assist medical professionals. It does not replace professional medical judgment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
