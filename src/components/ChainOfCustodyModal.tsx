import React from 'react';
import { X, Shield, Calendar, User, FileText, Printer, CheckCircle, XCircle } from 'lucide-react';
import { EvidenceRecord, VerificationRecord } from '../types';
import { formatBytes } from '../services/crypto';
import { HashDisplay } from './HashDisplay';

interface ChainOfCustodyModalProps {
  evidence: EvidenceRecord | null;
  verifications: VerificationRecord[];
  onClose: () => void;
}

export const ChainOfCustodyModal: React.FC<ChainOfCustodyModalProps> = ({
  evidence,
  verifications,
  onClose,
}) => {
  if (!evidence) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" style={{ maxWidth: '750px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={22} color="#0284c7" />
            <div>
              <h3 className="modal-title">Chain of Custody & Verification Dossier</h3>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Evidence Record #{evidence.id} • {evidence.caseNumber}
              </div>
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Evidence Meta Card */}
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Evidence Name</span>
                <strong style={{ color: '#0f172a' }}>{evidence.name}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Category</span>
                <span className="badge badge-category">{evidence.category}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Case Reference</span>
                <code>{evidence.caseNumber}</code>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Custodian / Seized By</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={14} color="#0284c7" /> {evidence.custodian || 'Unspecified'}
                </span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Original File</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FileText size={14} color="#64748b" /> {evidence.fileName} ({formatBytes(evidence.fileSize)})
                </span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Intake Timestamp</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} color="#64748b" /> {new Date(evidence.registeredAt).toLocaleString()}
                </span>
              </div>
            </div>

            {evidence.description && (
              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', fontSize: '0.84rem', color: '#475569' }}>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>Forensic Notes: </span>
                {evidence.description}
              </div>
            )}
          </div>

          {/* Master Hash */}
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
              REGISTERED MASTER CRYPTOGRAPHIC FINGERPRINT (SHA-256)
            </span>
            <HashDisplay hash={evidence.sha256Hash} label="Master Hash" />
          </div>

          {/* Verification Audit Trail */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Verification Audit Trail ({verifications.length} Checks)</span>
              {verifications.length > 0 && (
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                  Latest: {new Date(verifications[0].verifiedAt).toLocaleDateString()}
                </span>
              )}
            </h4>

            {verifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#64748b', fontSize: '0.85rem' }}>
                No verification attempts recorded yet for this evidence item.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="forensic-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Tested File</th>
                      <th>Result</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifications.map((v) => (
                      <tr key={v.id}>
                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                          {new Date(v.verifiedAt).toLocaleString()}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{v.testFileName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatBytes(v.testFileSize)}</div>
                        </td>
                        <td>
                          {v.result === 'MATCH' ? (
                            <span className="badge badge-match">
                              <CheckCircle size={12} /> MATCH
                            </span>
                          ) : (
                            <span className="badge badge-mismatch">
                              <XCircle size={12} /> MISMATCH
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#475569' }}>
                          {v.notes || 'Routine integrity validation check.'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={16} /> Print Dossier
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
