import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  UploadCloud,
  FileCheck2,
  AlertCircle,
  FileQuestion,
  RotateCcw,
  History,
  FileSearch,
} from 'lucide-react';
import { EvidenceRecord, VerificationRecord, ActiveTab } from '../types';
import { calculateSHA256, formatBytes, isCryptoSupported } from '../services/crypto';
import { HashComparator } from '../components/HashComparator';

interface VerifyPageProps {
  evidenceList: EvidenceRecord[];
  initialSelectedEvidenceId?: string;
  onVerificationComplete: (record: VerificationRecord) => Promise<void>;
  onNavigate: (tab: ActiveTab) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

export const VerifyPage: React.FC<VerifyPageProps> = ({
  evidenceList,
  initialSelectedEvidenceId,
  onVerificationComplete,
  onNavigate,
  showToast,
}) => {
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>(
    initialSelectedEvidenceId || (evidenceList.length > 0 ? evidenceList[0].id : '')
  );

  const [verifierNotes, setVerifierNotes] = useState<string>('');
  const [candidateFile, setCandidateFile] = useState<File | null>(null);
  const [computedHash, setComputedHash] = useState<string>('');
  const [isHashing, setIsHashing] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<'MATCH' | 'MISMATCH' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialSelectedEvidenceId) {
      setSelectedEvidenceId(initialSelectedEvidenceId);
    } else if (!selectedEvidenceId && evidenceList.length > 0) {
      setSelectedEvidenceId(evidenceList[0].id);
    }
  }, [initialSelectedEvidenceId, evidenceList]);

  const selectedEvidence = evidenceList.find((e) => e.id === selectedEvidenceId) || null;

  const handleFileChange = async (file: File) => {
    setErrorMessage(null);
    setVerificationResult(null);
    setCandidateFile(file);

    if (!selectedEvidence) {
      setErrorMessage('Please select a registered evidence record first.');
      return;
    }

    if (!isCryptoSupported()) {
      setErrorMessage('Web Crypto API is not supported in this browser.');
      return;
    }

    setIsHashing(true);
    try {
      // Calculate real SHA-256 hash using Web Crypto API
      const hash = await calculateSHA256(file);
      setComputedHash(hash);

      const isMatch =
        hash.trim().toLowerCase() === selectedEvidence.sha256Hash.trim().toLowerCase();
      const outcome = isMatch ? 'MATCH' : 'MISMATCH';
      setVerificationResult(outcome);

      // Save verification log to IndexedDB
      const verRecord: VerificationRecord = {
        id: `ver-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        evidenceId: selectedEvidence.id,
        evidenceName: selectedEvidence.name,
        verifiedAt: new Date().toISOString(),
        testFileName: file.name,
        testFileSize: file.size,
        computedHash: hash,
        originalHash: selectedEvidence.sha256Hash,
        result: outcome,
        notes: verifierNotes.trim() || undefined,
        isDemo: selectedEvidence.isDemo,
      };

      await onVerificationComplete(verRecord);

      if (isMatch) {
        showToast('success', 'Verification MATCH: Cryptographic integrity confirmed!');
      } else {
        showToast('error', 'Verification MISMATCH: File hash does not match original record!');
      }
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Error reading candidate file or computing hash.';
      setErrorMessage(msg);
      showToast('error', msg);
    } finally {
      setIsHashing(false);
    }
  };

  const handleReset = () => {
    setCandidateFile(null);
    setComputedHash('');
    setVerificationResult(null);
    setErrorMessage(null);
    setVerifierNotes('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Cryptographic Evidence Verification</h2>
          <p className="page-subtitle">
            Compare a candidate file against an existing evidence baseline using client-side SHA-256 bitstream validation.
          </p>
        </div>

        <div className="quick-actions-bar">
          <button
            className="btn btn-secondary"
            onClick={() => onNavigate('history')}
          >
            <History size={16} /> Evidence History
          </button>
        </div>
      </div>

      {evidenceList.length === 0 ? (
        <div className="forensic-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <FileQuestion size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
            No Registered Evidence Found
          </h3>
          <p style={{ color: '#64748b', maxWidth: '480px', margin: '0 auto 20px', fontSize: '0.9rem' }}>
            To verify a file, you must first register an evidence baseline or explore sample records in the Demo Lab.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => onNavigate('register')}>
              Register Evidence
            </button>
            <button className="btn btn-secondary" onClick={() => onNavigate('demo')}>
              Explore Demo Lab
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Step 1: Select Registered Evidence Record */}
          <div className="forensic-card">
            <div className="forensic-card-header">
              <h3 className="forensic-card-title">
                <FileSearch size={19} color="#0284c7" />
                1. Select Target Evidence Record to Verify Against
              </h3>
            </div>

            <div className="form-grid">
              <div className="form-group form-full">
                <label htmlFor="evidence-select" className="form-label">
                  Registered Evidence Baseline <span className="form-label-required">*</span>
                </label>
                <select
                  id="evidence-select"
                  className="form-select"
                  value={selectedEvidenceId}
                  onChange={(e) => {
                    setSelectedEvidenceId(e.target.value);
                    setCandidateFile(null);
                    setComputedHash('');
                    setVerificationResult(null);
                  }}
                >
                  {evidenceList.map((item) => (
                    <option key={item.id} value={item.id}>
                      [{item.id}] {item.name} — {item.fileName} ({item.category}) {item.isDemo ? '• [DEMO]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {selectedEvidence && (
                <div
                  className="form-full"
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '16px',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, display: 'block' }}>CASE REFERENCE</span>
                      <strong>{selectedEvidence.caseNumber}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, display: 'block' }}>ORIGINAL FILE NAME</span>
                      <code>{selectedEvidence.fileName}</code> ({formatBytes(selectedEvidence.fileSize)})
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, display: 'block' }}>INTAKE CUSTODIAN</span>
                      <span>{selectedEvidence.custodian || 'Unspecified'}</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, display: 'block' }}>REGISTERED DATE</span>
                      <span>{new Date(selectedEvidence.registeredAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                      REGISTERED MASTER HASH:
                    </div>
                    <code style={{ fontSize: '0.82rem', wordBreak: 'break-all', color: '#0284c7', fontFamily: 'var(--font-mono)' }}>
                      {selectedEvidence.sha256Hash}
                    </code>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Choose File to Verify */}
          <div className="forensic-card">
            <div className="forensic-card-header">
              <h3 className="forensic-card-title">
                <UploadCloud size={19} color="#0284c7" />
                2. Choose Candidate File from Device to Verify
              </h3>
            </div>

            <div
              className="file-dropzone"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
                id="verify-file-input"
              />

              <div className="file-dropzone-icon">
                <ShieldCheck size={28} />
              </div>

              <h4 className="file-dropzone-title">
                {candidateFile ? 'Choose a Different File to Test' : 'Click to Select Candidate File'}
              </h4>
              <p className="file-dropzone-desc">
                Select the physical file to inspect. The browser will instantly compute its SHA-256 fingerprint and compare it byte-for-byte.
              </p>

              <span className="btn btn-primary btn-sm" style={{ pointerEvents: 'none' }}>
                Select File to Verify
              </span>
            </div>

            {/* Optional Verification Notes */}
            <div className="form-group" style={{ marginTop: '20px' }}>
              <label htmlFor="verify-notes" className="form-label">
                Verification Audit Notes (Optional)
              </label>
              <input
                id="verify-notes"
                type="text"
                className="form-input"
                placeholder="e.g. Pre-trial court admission audit, laboratory intake check"
                value={verifierNotes}
                onChange={(e) => setVerifierNotes(e.target.value)}
              />
            </div>

            {candidateFile && (
              <div className="selected-file-banner" style={{ marginTop: '16px' }}>
                <div className="file-meta-item">
                  <FileCheck2 size={24} className="file-meta-icon" />
                  <div>
                    <div className="file-meta-name">{candidateFile.name}</div>
                    <div className="file-meta-size">
                      {formatBytes(candidateFile.size)} • Type: {candidateFile.type || 'Raw Binary'}
                    </div>
                  </div>
                </div>

                <div>
                  {isHashing ? (
                    <span style={{ fontSize: '0.85rem', color: '#0284c7', fontWeight: 600 }}>
                      Computing Candidate Hash...
                    </span>
                  ) : (
                    <button className="btn btn-ghost btn-sm" onClick={handleReset}>
                      <RotateCcw size={14} /> Reset
                    </button>
                  )}
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="alert-box alert-danger" style={{ marginTop: '16px' }} role="alert">
                <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Verification Error:</strong> {errorMessage}
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Visual Comparison & Results */}
          {selectedEvidence && computedHash && (
            <HashComparator
              originalHash={selectedEvidence.sha256Hash}
              computedHash={computedHash}
              originalFileName={selectedEvidence.fileName}
              testFileName={candidateFile?.name}
              evidenceName={selectedEvidence.name}
            />
          )}
        </div>
      )}
    </div>
  );
};
