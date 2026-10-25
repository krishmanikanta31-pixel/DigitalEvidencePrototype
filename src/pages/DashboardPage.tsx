import React from 'react';
import {
  FileCheck2,
  ShieldCheck,
  ShieldAlert,
  FilePlus2,
  ArrowRight,
  Clock,
  FlaskConical,
  Activity,
  Layers,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { EvidenceRecord, VerificationRecord, ActiveTab } from '../types';
import { formatBytes } from '../services/crypto';

interface DashboardPageProps {
  evidenceList: EvidenceRecord[];
  verifications: VerificationRecord[];
  onNavigate: (tab: ActiveTab) => void;
  onVerifyItem: (evidenceId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  evidenceList,
  verifications,
  onNavigate,
  onVerifyItem,
}) => {
  const totalEvidence = evidenceList.length;
  const successfulVerifications = verifications.filter((v) => v.result === 'MATCH').length;
  const failedVerifications = verifications.filter((v) => v.result === 'MISMATCH').length;
  const totalChecks = verifications.length;

  const successRate =
    totalChecks > 0 ? Math.round((successfulVerifications / totalChecks) * 100) : 100;

  // Category breakdown
  const categoryCounts = evidenceList.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  // Recent activity stream (combined latest evidence registrations and verifications, up to 6 items)
  interface ActivityItem {
    id: string;
    type: 'registration' | 'verification';
    timestamp: string;
    title: string;
    subtitle: string;
    status?: 'MATCH' | 'MISMATCH' | 'REGISTERED';
    evidenceId?: string;
  }

  const activities: ActivityItem[] = [
    ...evidenceList.map((e) => ({
      id: `reg-${e.id}`,
      type: 'registration' as const,
      timestamp: e.registeredAt,
      title: `Registered: ${e.name}`,
      subtitle: `${e.fileName} (${formatBytes(e.fileSize)}) • ID: ${e.id}`,
      status: 'REGISTERED' as const,
      evidenceId: e.id,
    })),
    ...verifications.map((v) => ({
      id: `ver-${v.id}`,
      type: 'verification' as const,
      timestamp: v.verifiedAt,
      title: `Verification: ${v.evidenceName || v.evidenceId}`,
      subtitle: `Tested: ${v.testFileName} • Result: ${v.result}`,
      status: v.result,
      evidenceId: v.evidenceId,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 7);

  return (
    <div className="page-container">
      {/* Top Banner & Quick Actions */}
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Digital Evidence Integrity Dashboard</h2>
          <p className="page-subtitle">
            Cryptographic SHA-256 evidence registration, audit trails, and bitstream verification.
          </p>
        </div>

        <div className="quick-actions-bar">
          <button
            className="btn btn-primary"
            onClick={() => onNavigate('register')}
            id="dash-btn-register"
          >
            <FilePlus2 size={18} />
            <span>Register Evidence</span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => onNavigate('verify')}
            id="dash-btn-verify"
          >
            <ShieldCheck size={18} color="#0284c7" />
            <span>Verify File</span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => onNavigate('demo')}
            id="dash-btn-demo"
            title="Open Interactive Demo Lab"
          >
            <FlaskConical size={18} color="#d97706" />
            <span>Demo Lab</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="stat-cards-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Total Registered Files</span>
            <div className="stat-icon-wrapper stat-icon-primary">
              <FileCheck2 size={22} />
            </div>
          </div>
          <div className="stat-value">{totalEvidence}</div>
          <div className="stat-hint">Cryptographically hashed evidence assets in IndexedDB</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Successful Verifications</span>
            <div className="stat-icon-wrapper stat-icon-success">
              <ShieldCheck size={22} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#059669' }}>
            {successfulVerifications}
          </div>
          <div className="stat-hint">
            {totalChecks > 0 ? `${successRate}% verification success rate` : 'No verifications yet'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Failed Verifications</span>
            <div className="stat-icon-wrapper stat-icon-danger">
              <ShieldAlert size={22} />
            </div>
          </div>
          <div className="stat-value" style={{ color: failedVerifications > 0 ? '#dc2626' : '#64748b' }}>
            {failedVerifications}
          </div>
          <div className="stat-hint">
            {failedVerifications > 0 ? 'Bitstream discrepancies detected' : 'Zero tampering detected'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Total Verification Checks</span>
            <div className="stat-icon-wrapper stat-icon-purple">
              <Activity size={22} />
            </div>
          </div>
          <div className="stat-value">{totalChecks}</div>
          <div className="stat-hint">Historical integrity audits performed</div>
        </div>
      </div>

      {/* Main Grid: Activity Timeline and Category Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left: Recent Activity Feed */}
        <div className="forensic-card">
          <div className="forensic-card-header">
            <h3 className="forensic-card-title">
              <Clock size={19} color="#0284c7" />
              Recent Evidence Activity
            </h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onNavigate('history')}
            >
              <span>View All History</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {activities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 20px', color: '#64748b' }}>
              <Activity size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
              <p style={{ fontWeight: 600 }}>No activity records found.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                Register your first evidence file or load demo cases to get started.
              </p>
              <button
                className="btn btn-primary btn-sm"
                style={{ marginTop: '14px' }}
                onClick={() => onNavigate('register')}
              >
                Register Evidence Now
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activities.map((act) => (
                <div
                  key={act.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #f1f5f9',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor:
                          act.status === 'MATCH'
                            ? '#ecfdf5'
                            : act.status === 'MISMATCH'
                            ? '#fef2f2'
                            : '#eff6ff',
                        color:
                          act.status === 'MATCH'
                            ? '#10b981'
                            : act.status === 'MISMATCH'
                            ? '#ef4444'
                            : '#0284c7',
                        flexShrink: 0,
                      }}
                    >
                      {act.status === 'MATCH' && <CheckCircle size={18} />}
                      {act.status === 'MISMATCH' && <XCircle size={18} />}
                      {act.status === 'REGISTERED' && <FileCheck2 size={18} />}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          color: '#0f172a',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {act.title}
                      </div>
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: '#64748b',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {act.subtitle}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                    {act.status === 'MATCH' && (
                      <span className="badge badge-match">MATCH</span>
                    )}
                    {act.status === 'MISMATCH' && (
                      <span className="badge badge-mismatch">MISMATCH</span>
                    )}
                    {act.status === 'REGISTERED' && (
                      <span className="badge badge-category">NEW</span>
                    )}
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Evidence Categories & Quick Inspection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Category distribution */}
          <div className="forensic-card">
            <div className="forensic-card-header">
              <h3 className="forensic-card-title">
                <Layers size={19} color="#0284c7" />
                Evidence by Category
              </h3>
            </div>

            {Object.keys(categoryCounts).length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', padding: '16px 0' }}>
                No registered categories yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(categoryCounts).map(([cat, count]) => {
                  const pct = totalEvidence > 0 ? Math.round((count / totalEvidence) * 100) : 0;
                  return (
                    <div key={cat}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: '#334155' }}>{cat}</span>
                        <span style={{ color: '#64748b' }}>
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            backgroundColor: '#0284c7',
                            borderRadius: '3px',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions & Security Highlights */}
          <div className="forensic-card" style={{ backgroundColor: '#f0f9ff', borderColor: '#bae6fd' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0369a1', marginBottom: '8px' }}>
              Web Crypto Client Architecture
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#0c4a6e', lineHeight: 1.5, marginBottom: '14px' }}>
              This system calculates SHA-256 cryptographic fingerprints strictly inside your browser's Web Crypto engine. File contents are processed locally in RAM and are never uploaded or stored permanently.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onNavigate('privacy')}
              >
                Learn Privacy Model
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigate('demo')}
              >
                Try Avalanche Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
