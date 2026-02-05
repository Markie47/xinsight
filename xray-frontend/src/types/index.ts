interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Finding {
  id: string;
  condition: string;
  probability: number;
  severity: 'low' | 'medium' | 'high';
  region: Region;
  description: string;
}

interface Report {
  findings: string;
  impression: string;
  recommendations: string;
  generatedAt: string;
  status: 'draft' | 'final';
}

export interface XRayAnalysis {
  id: string;
  patientId: string;
  imageUrl: string;
  analysisDate: string;
  status: 'completed' | 'failed' | 'processing';
  confidence: number;
  processingTime: number;
  findings: Finding[];
  report: Report;
}