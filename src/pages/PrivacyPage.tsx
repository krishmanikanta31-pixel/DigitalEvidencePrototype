import React, { useState } from 'react';
import {
  LockKeyhole,
  AlertTriangle,
  HardDrive,
  Shield,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  Database,
  Cpu,
  Layers,
  FileText,
} from 'lucide-react';
import { evidenceDB } from '../services/db';

interface PrivacyPageProps {
  evidenceCount: number;
  verificationCount: number;
  onRefreshData: () => Promise<void>;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({
  evidenceCount,
  verificationCount,
  onRefreshData,
  showToast,
}) => {
  const [confirmClearModal, setConfirmClearModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const json = await evidenceDB.exportDatabase();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `digital_evidence_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('success', 'Database backup exported as JSON');
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to export database backup.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setIsImporting(true);
        const content = event.target?.result as string;
        const result = await evidenceDB.importDatabase(content);
        await onRefreshData();
        showToast(
          'success',
          `Restored ${result.importedEvidence} evidence items and ${result.importedVerifications} verification logs.`
        );
      } catch (err) {
        console.error(err);
        showToast('error', 'Failed to import backup: invalid format or corrupted JSON.');
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = async () => {
    try {
      await evidenceDB.clearAllData(false);
      await onRefreshData();
      setConfirmClearModal(false);
      showToast('success', 'All local IndexedDB records have been cleared.');
    } catch {
      showToast('error', 'Failed to clear local database.');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Privacy Architecture & Technical Limitations</h2>
          <p className="page-subtitle">
            Transparent disclosure of storage mechanisms, cryptographic boundaries, and academic prototype limitations.
          </p>
        </div>
      </div>

      {/* Critical Forensics Disclaimer Alert */}
      <div className="alert-box alert-warning">
        <AlertTriangle size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ fontSize: '0.98rem', fontWeight: 800, marginBottom: '4px' }}>
            College Project Academic Prototype Disclaimer
          </h4>
          <p style={{ fontSize: '0.86rem', lineHeight: 1.5 }}>
            This application is an educational prototype developed for demonstrative and collegiate evaluation purposes. Browser-local storage (IndexedDB) is <strong>not tamper-proof</strong> against local administrative alteration, and this system is <strong>not a certified production-grade forensic evidence management system (e.g., ISO/IEC 27037 compliant)</strong>. Do not use as sole legal chain-of-custody for judicial proceedings.
          </p>
        </div>
      </div>

      {/* 4 Architectural Pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="forensic-card">
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
            <Cpu size={22} />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
            1. 100% Client-Side Web Crypto
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
            All SHA-256 cryptographic hashes are computed entirely in the browser using the native W3C Web Cryptography API (<code>window.crypto.subtle.digest</code>). No files, chunks, or hashes are transmitted across a network.
          </p>
        </div>

        <div className="forensic-card">
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
            <HardDrive size={22} />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
            2. Zero File Copying
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
            Raw file contents remain exclusively on your computer’s hard drive. The application computes the hash in ephemeral volatile memory (RAM) and stores only the resulting 64-character hex string and metadata.
          </p>
        </div>

        <div className="forensic-card">
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
            <Database size={22} />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
            3. Browser Cache Volatility
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
            All metadata and verification logs reside inside the browser profile’s local IndexedDB. Clearing browser cache, cookies, or website data will wipe local records unless previously exported as a backup.
          </p>
        </div>

        <div className="forensic-card">
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#f3e8ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
            <LockKeyhole size={22} />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
            4. Local Storage Integrity
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
            IndexedDB records are vulnerable to local browser developer tools inspection and manipulation. Production forensic systems use hardware security modules (HSM) and write-once optical media (WORM).
          </p>
        </div>
      </div>

      {/* Storage Management & Backup */}
      <div className="forensic-card">
        <div className="forensic-card-header">
          <h3 className="forensic-card-title">
            <Database size={19} color="#0284c7" />
            Local IndexedDB Ledger Management
          </h3>
          <span className="badge badge-category">Database: DigitalEvidenceDB</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', textTransform: 'uppercase' }}>
              Stored Evidence Records
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
              {evidenceCount}
            </div>
          </div>

          <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', textTransform: 'uppercase' }}>
              Stored Verification Logs
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
              {verificationCount}
            </div>
          </div>

          <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', textTransform: 'uppercase' }}>
              Network Requests Outbound
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
              0 (Offline)
            </div>
          </div>
        </div>

        {/* Database Export & Import Actions */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
          <button
            className="btn btn-primary"
            onClick={handleExportBackup}
            disabled={isExporting}
            id="btn-export-backup"
          >
            <Download size={16} /> Export JSON Ledger Backup
          </button>

          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            <Upload size={16} />
            <span>{isImporting ? 'Importing...' : 'Restore from JSON Backup'}</span>
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleImportBackup}
            />
          </label>

          <button
            className="btn btn-danger"
            style={{ marginLeft: 'auto' }}
            onClick={() => setConfirmClearModal(true)}
            id="btn-clear-all-data"
          >
            <Trash2 size={16} /> Wipe Local Database
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Clearing All */}
      {confirmClearModal && (
        <div className="modal-overlay" onClick={() => setConfirmClearModal(false)} role="dialog">
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: '#dc2626' }}>
                Wipe Local Evidence Database
              </h3>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.5 }}>
                Are you sure you want to completely erase all registered evidence files and verification history records from IndexedDB?
              </p>
              <div style={{ marginTop: '12px', fontSize: '0.82rem', color: '#991b1b', backgroundColor: '#fef2f2', padding: '10px 12px', borderRadius: '6px' }}>
                This will delete both real and demo records from your browser.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirmClearModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleClearAll} id="confirm-wipe-btn">
                Erase Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
