export type EvidenceCategory =
  | 'Disk Image'
  | 'Network Capture (PCAP)'
  | 'Mobile Backup'
  | 'System & Event Logs'
  | 'Memory Dump (RAM)'
  | 'Document & Contract'
  | 'Audio / Video'
  | 'Other Digital Asset';

export interface EvidenceRecord {
  id: string; // e.g. "EV-2026-001"
  caseNumber: string; // e.g. "CASE-CR-409"
  name: string; // e.g. "Workstation Primary HDD Image"
  category: EvidenceCategory;
  description: string;
  custodian: string; // Investigator name
  fileName: string;
  fileSize: number; // in bytes
  fileType: string;
  fileLastModified: number; // timestamp
  sha256Hash: string; // 64-char hex
  registeredAt: string; // ISO string
  isDemo?: boolean;
}

export type VerificationResult = 'MATCH' | 'MISMATCH';

export interface VerificationRecord {
  id: string; // unique UUID
  evidenceId: string; // Foreign key to EvidenceRecord.id
  evidenceName: string;
  verifiedAt: string; // ISO string
  testFileName: string;
  testFileSize: number;
  computedHash: string;
  originalHash: string;
  result: VerificationResult;
  notes?: string;
  isDemo?: boolean;
}

export type ActiveTab =
  | 'dashboard'
  | 'register'
  | 'verify'
  | 'history'
  | 'demo'
  | 'privacy';

export interface SystemStats {
  totalEvidence: number;
  totalVerifications: number;
  successfulVerifications: number;
  failedVerifications: number;
}
