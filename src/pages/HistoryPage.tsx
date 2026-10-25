import React, { useState } from 'react';
import {
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Trash2,
  ExternalLink,
  Download,
  Calendar,
  User,
  Copy,
  Check,
  CheckCircle,
  XCircle,
  Clock,
  FileSpreadsheet,
} from 'lucide-react';
import { EvidenceRecord, VerificationRecord, ActiveTab } from '../types';
import { formatBytes } from '../services/crypto';
import { ChainOfCustodyModal } from '../components/ChainOfCustodyModal';

interface HistoryPageProps {
  evidenceList: EvidenceRecord[];
  verifications: VerificationRecord[];
  onDeleteEvidence: (id: string) => Promise<void>;
  onVerifyEvidence: (id: string) => void;
  onNavigate: (tab: ActiveTab) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  evidenceList,
  verifications,
  onDeleteEvidence,
  onVerifyEvidence,
  onNavigate,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [dossierEvidence, setDossierEvidence] = useState<EvidenceRecord | null>(null);
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter evidence list
  const filteredList = evidenceList.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sha256Hash.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCopyHash = async (hash: string, id: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      showToast('info', 'Hash copied to clipboard');
    } catch {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidateId) return;
    try {
      await onDeleteEvidence(deleteCandidateId);
      showToast('success', `Deleted evidence record #${deleteCandidateId}`);
      setDeleteCandidateId(null);
    } catch {
      showToast('error', 'Failed to delete record.');
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Evidence ID',
      'Case Number',
      'Evidence Name',
      'Category',
      'Filename',
      'File Size (Bytes)',
      'SHA-256 Hash',
      'Custodian',
      'Registered At',
      'Verification Attempts Count',
    ];

    const rows = filteredList.map((item) => {
      const attempts = verifications.filter((v) => v.evidenceId === item.id).length;
      return [
        `"${item.id}"`,
        `"${item.caseNumber}"`,
        `"${item.name.replace(/"/g, '""')}"`,
        `"${item.category}"`,
        `"${item.fileName}"`,
        item.fileSize,
        `"${item.sha256Hash}"`,
        `"${item.custodian || ''}"`,
        `"${item.registeredAt}"`,
        attempts,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `evidence_audit_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('success', 'Exported evidence history to CSV');
  };

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Digital Evidence Master Ledger & History</h2>
          <p className="page-subtitle">
            Comprehensive forensic audit log of all registered digital artifacts, timestamps, cryptographic fingerprints, and verification outcomes.
          </p>
        </div>

        <div className="quick-actions-bar">
          <button
            className="btn btn-secondary"
            onClick={handleExportCSV}
            disabled={filteredList.length === 0}
            title="Export filtered records to CSV"
          >
            <FileSpreadsheet size={16} /> Export CSV Audit
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onNavigate('register')}
          >
            Register New Evidence
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-input-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by Evidence ID, file name, case number, or SHA-256 hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '180px' }}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="ALL">All Categories</option>
          <option value="Disk Image">Disk Image</option>
          <option value="Network Capture (PCAP)">Network Capture</option>
          <option value="Mobile Backup">Mobile Backup</option>
          <option value="System & Event Logs">System & Event Logs</option>
          <option value="Memory Dump (RAM)">Memory Dump</option>
          <option value="Document & Contract">Document & Contract</option>
          <option value="Audio / Video">Audio / Video</option>
          <option value="Other Digital Asset">Other Asset</option>
        </select>
      </div>

      {/* Evidence Table */}
      {filteredList.length === 0 ? (
        <div className="forensic-card" style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
          <FileText size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
            No Matching Evidence Records
          </h3>
          <p style={{ fontSize: '0.88rem' }}>
            Try modifying your search criteria or register a new evidence item.
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="forensic-table">
            <thead>
              <tr>
                <th>ID & Case #</th>
                <th>Evidence Label & File</th>
                <th>Category</th>
                <th>SHA-256 Hash Fingerprint</th>
                <th>Registration Date</th>
                <th>Verifications</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item) => {
                const itemVerifications = verifications.filter((v) => v.evidenceId === item.id);
                const matchCount = itemVerifications.filter((v) => v.result === 'MATCH').length;
                const mismatchCount = itemVerifications.filter((v) => v.result === 'MISMATCH').length;
                const latest = itemVerifications[0];

                return (
                  <tr key={item.id}>
                    {/* ID & Case */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ color: '#0284c7' }}>{item.id}</strong>
                        {item.isDemo && <span className="badge badge-demo">DEMO</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                        {item.caseNumber}
                      </div>
                    </td>

                    {/* Name & File */}
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <code>{item.fileName}</code>
                        <span>({formatBytes(item.fileSize)})</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      <span className="badge badge-category">{item.category}</span>
                    </td>

                    {/* SHA-256 Fingerprint */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <code
                          style={{
                            fontSize: '0.78rem',
                            fontFamily: 'var(--font-mono)',
                            backgroundColor: '#0f172a',
                            color: '#38bdf8',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            maxWidth: '180px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'inline-block',
                          }}
                          title={item.sha256Hash}
                        >
                          {item.sha256Hash.slice(0, 10)}...{item.sha256Hash.slice(-8)}
                        </code>
                        <button
                          className="btn-ghost"
                          style={{ padding: '3px' }}
                          onClick={() => handleCopyHash(item.sha256Hash, item.id)}
                          title="Copy full 64-char SHA-256 hash"
                        >
                          {copiedId === item.id ? (
                            <Check size={14} color="#10b981" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Registration Date */}
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#475569' }}>
                      <div>{new Date(item.registeredAt).toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        {new Date(item.registeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Verifications Count & Badges */}
                    <td>
                      {itemVerifications.length === 0 ? (
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>0 checks</span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {matchCount > 0 && (
                              <span className="badge badge-match" title="Matching verifications">
                                <CheckCircle size={11} /> {matchCount}
                              </span>
                            )}
                            {mismatchCount > 0 && (
                              <span className="badge badge-mismatch" title="Mismatched verifications">
                                <XCircle size={11} /> {mismatchCount}
                              </span>
                            )}
                          </div>
                          {latest && (
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                              Latest: {latest.result} ({new Date(latest.verifiedAt).toLocaleDateString()})
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ marginRight: '6px' }}
                        onClick={() => onVerifyEvidence(item.id)}
                        title="Verify this evidence record against candidate file"
                      >
                        <ShieldCheck size={14} color="#0284c7" /> Verify
                      </button>

                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ marginRight: '6px' }}
                        onClick={() => setDossierEvidence(item)}
                        title="View Full Chain-of-Custody Dossier"
                      >
                        <ExternalLink size={14} /> Dossier
                      </button>

                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#ef4444' }}
                        onClick={() => setDeleteCandidateId(item.id)}
                        title="Delete Evidence Record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Chain-of-Custody Modal */}
      {dossierEvidence && (
        <ChainOfCustodyModal
          evidence={dossierEvidence}
          verifications={verifications.filter((v) => v.evidenceId === dossierEvidence.id)}
          onClose={() => setDossierEvidence(null)}
        />
      )}

      {/* Confirmation Dialog for Deletion */}
      {deleteCandidateId && (
        <div className="modal-overlay" onClick={() => setDeleteCandidateId(null)} role="dialog">
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: '#dc2626' }}>
                Confirm Record Deletion
              </h3>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.5 }}>
                Are you sure you want to permanently delete evidence record{' '}
                <strong>#{deleteCandidateId}</strong> and all associated verification logs from your local IndexedDB?
              </p>
              <div style={{ marginTop: '12px', fontSize: '0.82rem', color: '#991b1b', backgroundColor: '#fef2f2', padding: '10px 12px', borderRadius: '6px' }}>
                This action cannot be undone.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteCandidateId(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleConfirmDelete} id="confirm-delete-btn">
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
