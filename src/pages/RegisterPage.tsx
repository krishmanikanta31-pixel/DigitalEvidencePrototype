import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileCheck2,
  AlertCircle,
  Hash,
  Shield,
  CheckCircle2,
  RotateCcw,
  Info,
  Calendar,
  Lock,
} from 'lucide-react';
import { EvidenceRecord, EvidenceCategory, ActiveTab } from '../types';
import { calculateSHA256, formatBytes, isCryptoSupported } from '../services/crypto';
import { HashDisplay } from '../components/HashDisplay';

interface RegisterPageProps {
  existingEvidence: EvidenceRecord[];
  onRegisterSuccess: (record: EvidenceRecord) => Promise<void>;
  onNavigate: (tab: ActiveTab) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

const CATEGORIES: EvidenceCategory[] = [
  'Disk Image',
  'Network Capture (PCAP)',
  'Mobile Backup',
  'System & Event Logs',
  'Memory Dump (RAM)',
  'Document & Contract',
  'Audio / Video',
  'Other Digital Asset',
];

export const RegisterPage: React.FC<RegisterPageProps> = ({
  existingEvidence,
  onRegisterSuccess,
  onNavigate,
  showToast,
}) => {
  // Suggest next ID based on existing items
  const generateSuggestedId = () => {
    const realItems = existingEvidence.filter((e) => !e.isDemo);
    const nextNum = realItems.length + 1;
    return `EV-2026-${String(nextNum).padStart(3, '0')}`;
  };

  const [evidenceId, setEvidenceId] = useState(generateSuggestedId());
  const [caseNumber, setCaseNumber] = useState('CASE-CR-2026-');
  const [evidenceName, setEvidenceName] = useState('');
  const [category, setCategory] = useState<EvidenceCategory>('System & Event Logs');
  const [custodian, setCustodian] = useState('');
  const [description, setDescription] = useState('');

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [computedHash, setComputedHash] = useState<string>('');
  const [isHashing, setIsHashing] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successRecord, setSuccessRecord] = useState<EvidenceRecord | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check Web Crypto API
  const cryptoSupported = isCryptoSupported();

  useEffect(() => {
    if (!cryptoSupported) {
      setErrorMsg('Web Crypto API is not supported in this browser. SHA-256 calculation requires window.crypto.subtle.');
    }
  }, [cryptoSupported]);

  const handleFileSelect = async (file: File) => {
    setErrorMsg(null);
    setSuccessRecord(null);
    setSelectedFile(file);

    // Auto-fill evidence name if blank
    if (!evidenceName.trim()) {
      setEvidenceName(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }

    // Compute actual SHA-256 hash
    setIsHashing(true);
    try {
      const hash = await calculateSHA256(file);
      setComputedHash(hash);
      showToast('info', `Computed SHA-256 hash for ${file.name}`);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Failed to read file or calculate hash.';
      setErrorMsg(msg);
      showToast('error', msg);
    } finally {
      setIsHashing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Validation: File selected
    if (!selectedFile) {
      setErrorMsg('Please select an evidence file from your device.');
      showToast('warning', 'Please select an evidence file.');
      return;
    }

    // 2. Validation: Hash generated
    if (!computedHash) {
      setErrorMsg('Cryptographic hash computation is pending or failed.');
      return;
    }

    // 3. Validation: Required fields
    if (!evidenceId.trim()) {
      setErrorMsg('Evidence ID is required.');
      return;
    }
    if (!evidenceName.trim()) {
      setErrorMsg('Evidence Title/Name is required.');
      return;
    }

    // 4. Validation: Duplicate Evidence ID check
    const isDuplicate = existingEvidence.some(
      (ev) => ev.id.trim().toUpperCase() === evidenceId.trim().toUpperCase()
    );
    if (isDuplicate) {
      setErrorMsg(`Evidence ID "${evidenceId}" already exists. Please choose a unique Evidence ID.`);
      showToast('error', `Duplicate ID: ${evidenceId} is already in the database.`);
      return;
    }

    const newRecord: EvidenceRecord = {
      id: evidenceId.trim(),
      caseNumber: caseNumber.trim() || 'CASE-GENERAL',
      name: evidenceName.trim(),
      category,
      description: description.trim(),
      custodian: custodian.trim() || 'Primary Investigator',
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileType: selectedFile.type || 'application/octet-stream',
      fileLastModified: selectedFile.lastModified,
      sha256Hash: computedHash,
      registeredAt: new Date().toISOString(),
      isDemo: false,
    };

    try {
      await onRegisterSuccess(newRecord);
      setSuccessRecord(newRecord);
      showToast('success', `Registered evidence "${newRecord.name}" successfully!`);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to save evidence to local IndexedDB.');
      showToast('error', 'Database write error.');
    }
  };

  const resetForm = () => {
    setEvidenceId(generateSuggestedId());
    setCaseNumber('CASE-CR-2026-');
    setEvidenceName('');
    setCustodian('');
    setDescription('');
    setSelectedFile(null);
    setComputedHash('');
    setErrorMsg(null);
    setSuccessRecord(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Register Digital Evidence Asset</h2>
          <p className="page-subtitle">
            Upload any file from your computer to calculate its cryptographic SHA-256 fingerprint and establish a chain-of-custody entry.
          </p>
        </div>
      </div>

      {/* Zero Cloud Upload Disclaimer Alert */}
      <div className="alert-box alert-info">
        <Lock size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Local Cryptographic Intake:</strong> The file is read entirely client-side using the browser’s Web Crypto API (<code>crypto.subtle.digest</code>). File bytes are never uploaded to any remote server or stored permanently in browser cache.
        </div>
      </div>

      {errorMsg && (
        <div className="alert-box alert-danger" role="alert">
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>{errorMsg}</div>
        </div>
      )}

      {/* Success Banner if just registered */}
      {successRecord && (
        <div className="forensic-card" style={{ borderColor: '#10b981', backgroundColor: '#ecfdf5', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <CheckCircle2 size={24} color="#10b981" />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#065f46' }}>
                Evidence Record Successfully Registered
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#047857' }}>
                Assigned ID <strong>{successRecord.id}</strong> • Case #{successRecord.caseNumber}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <HashDisplay hash={successRecord.sha256Hash} label="Registered Master Fingerprint (SHA-256)" />
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={() => onNavigate('verify')}
              id="success-btn-verify"
            >
              <Shield size={16} /> Verify This File Now
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => onNavigate('history')}
            >
              View in Evidence History
            </button>
            <button
              className="btn btn-ghost"
              onClick={resetForm}
            >
              <RotateCcw size={16} /> Register Another Item
            </button>
          </div>
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="forensic-card">
        {/* Step 1: File Selection Dropzone */}
        <div style={{ marginBottom: '28px' }}>
          <label className="form-label" style={{ fontSize: '0.95rem', marginBottom: '10px' }}>
            <span>1. Select Evidence File from Device</span>
            <span className="form-label-required">*</span>
          </label>

          <div
            className={`file-dropzone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              id="evidence-file-input"
            />

            <div className="file-dropzone-icon">
              <UploadCloud size={28} />
            </div>

            <h4 className="file-dropzone-title">
              {selectedFile ? 'Change Selected File' : 'Click to Browse or Drag & Drop File'}
            </h4>
            <p className="file-dropzone-desc">
              Supports any file format: Disk images (.dd, .raw), network dumps (.pcap), logs (.log), documents (.pdf), archives (.zip)
            </p>

            <span className="btn btn-secondary btn-sm" style={{ pointerEvents: 'none' }}>
              Select File from Computer
            </span>
          </div>

          {/* Selected File Details & Real-time Hash */}
          {selectedFile && (
            <div className="selected-file-banner">
              <div className="file-meta-item">
                <FileCheck2 size={24} className="file-meta-icon" />
                <div>
                  <div className="file-meta-name">{selectedFile.name}</div>
                  <div className="file-meta-size">
                    Size: {formatBytes(selectedFile.size)} • Type: {selectedFile.type || 'Raw Binary'} • Last Modified: {new Date(selectedFile.lastModified).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div>
                {isHashing ? (
                  <span style={{ fontSize: '0.85rem', color: '#0284c7', fontWeight: 600 }}>
                    Computing SHA-256...
                  </span>
                ) : (
                  <span className="badge badge-match">
                    <CheckCircle2 size={12} /> Fingerprinted
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Display Generated Hash */}
          {computedHash && (
            <div style={{ marginTop: '14px' }}>
              <HashDisplay hash={computedHash} label="Generated SHA-256 Hash (Web Crypto API)" />
            </div>
          )}
        </div>

        {/* Step 2: Metadata Fields */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCheck2 size={18} color="#0284c7" />
            2. Evidence Chain-of-Custody Metadata
          </h3>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="evidence-id" className="form-label">
                Evidence ID <span className="form-label-required">*</span>
              </label>
              <input
                id="evidence-id"
                type="text"
                className="form-input"
                value={evidenceId}
                onChange={(e) => setEvidenceId(e.target.value)}
                placeholder="e.g. EV-2026-001"
                required
              />
              <span className="form-help">Unique identifier for forensic inventory tracking.</span>
            </div>

            <div className="form-group">
              <label htmlFor="case-number" className="form-label">
                Case Reference Number <span className="form-label-required">*</span>
              </label>
              <input
                id="case-number"
                type="text"
                className="form-input"
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                placeholder="e.g. CASE-CR-2026-409"
                required
              />
              <span className="form-help">Associated investigative case or court docket.</span>
            </div>

            <div className="form-group">
              <label htmlFor="evidence-name" className="form-label">
                Evidence Name / Label <span className="form-label-required">*</span>
              </label>
              <input
                id="evidence-name"
                type="text"
                className="form-input"
                value={evidenceName}
                onChange={(e) => setEvidenceName(e.target.value)}
                placeholder="e.g. Primary Server Access Log Dump"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="evidence-category" className="form-label">
                Evidence Category <span className="form-label-required">*</span>
              </label>
              <select
                id="evidence-category"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as EvidenceCategory)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="custodian-name" className="form-label">
                Lead Custodian / Investigator
              </label>
              <input
                id="custodian-name"
                type="text"
                className="form-input"
                value={custodian}
                onChange={(e) => setCustodian(e.target.value)}
                placeholder="e.g. Det. Vamsi Krishna"
              />
              <span className="form-help">Officer responsible for seizing or securing this file.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Intake Date & Time</label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  color: '#475569',
                }}
              >
                <Calendar size={16} color="#0284c7" />
                <span>{new Date().toLocaleString()} (Current Timestamp)</span>
              </div>
            </div>

            <div className="form-group form-full">
              <label htmlFor="evidence-desc" className="form-label">
                Forensic Notes & Seizure Description
              </label>
              <textarea
                id="evidence-desc"
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Document device hardware serial numbers, storage location, extraction conditions, or source URL..."
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', borderTop: '1px solid #f1f5f9', paddingTop: '18px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={resetForm}
          >
            Clear Fields
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!selectedFile || !computedHash || isHashing}
            id="register-submit-btn"
          >
            <Shield size={18} />
            <span>Confirm & Register Evidence</span>
          </button>
        </div>
      </form>
    </div>
  );
};
