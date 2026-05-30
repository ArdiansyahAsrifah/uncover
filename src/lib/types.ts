export interface FlaggedComment {
  id: number;
  commenter: string;
  text: string;
  postUrl: string;      // ← berubah dari video: string
  time: string;
  detectedWords: string[];
  riskLevel: 'Mencurigakan' | 'Berbahaya';
}

export interface ScanData {
  totalScanned: number;
  flaggedCount: number;
  comments: FlaggedComment[];
  lastScan: string;
  overallRisk: 'Tinggi' | 'Sedang' | 'Aman';
}

export interface MonitoredAccount {
  id: string;
  instagram_username: string;
  last_scanned_at: string | null;
  created_at: string;
}