export interface ExtractedData {
  vendor: string;
  amount: number;
  date: string;
  currency: string;
}

export interface FraudAnalysis {
  score: number;
  reason: string;
}

export interface ComplianceAnalysis {
  status: 'passed' | 'flagged' | 'compliant' | 'review';
  note: string;
}

export interface AnalysisData {
  category: string; 
  fraud: FraudAnalysis;
  compliance: ComplianceAnalysis;
  summary: string;
}

export interface Invoice {
  _id: string;
  userId: string;
  fileName: string;
  extractedData?: {
    vendor?: string;
    amount?: number;
    date?: string;
    currency?: string;
  };
  analysis?: {
    category?: string;
    fraud?: {
      score: number;
      reason?: string;
    };
    compliance?: {
      status: string;
      note?: string;
    };
    summary?: string;
  };
  createdAt: string;
}