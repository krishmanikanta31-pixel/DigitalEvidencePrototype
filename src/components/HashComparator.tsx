import React from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import { HashDisplay } from './HashDisplay';

interface HashComparatorProps {
  originalHash: string;
  computedHash: string;
  originalFileName?: string;
  testFileName?: string;
  evidenceName?: string;
}

export const HashComparator: React.FC<HashComparatorProps> = ({
  originalHash,
  computedHash,
  originalFileName,
  testFileName,
  evidenceName,
}) => {
  const isMatch = originalHash.trim().toLowerCase() === computedHash.trim().toLowerCase();

  // Character-by-character comparison analysis
  const origClean = originalHash.trim().toLowerCase();
  const compClean = computedHash.trim().toLowerCase();
  
  let mismatchCount = 0;
  const maxLen = Math.max(origClean.length, compClean.length);
  for (let i = 0; i < maxLen; i++) {
    if (origClean[i] !== compClean[i]) mismatchCount++;
  }

  return (
    <div className="forensic-card" style={{ marginTop: '24px' }}>
      {/* Visual Verdict Banner */}
      <div
        className={`verification-verdict-card ${isMatch ? 'verdict-match' : 'verdict-mismatch'}`}
        role="alert"
      >
        <div className="verdict-icon-bubble">
          {isMatch ? <ShieldCheck size={40} /> : <ShieldAlert size={40} />}
        </div>

        <div className="verdict-badge">
          {isMatch ? 'MATCH' : 'MISMATCH'}
        </div>

        <h3 className="verdict-title">
          {isMatch
            ? 'Cryptographic Integrity Intact (File Verified)'
            : 'Integrity Compromised: Bitstream Alteration Detected'}
        </h3>

        <p className="verdict-description">
          {isMatch
            ? `The computed SHA-256 hash of the presented file matches the registered master hash exactly. The bitstream is identical, confirming no post-seizure tampering, bit rot, or unintended modification.`
            : `The computed SHA-256 hash does not match the original forensic record (${mismatchCount} differing hex positions). Due to the SHA-256 avalanche effect, even a single modified byte completely transforms the fingerprint.`}
        </p>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '9999px',
            backgroundColor: isMatch ? '#d1fae5' : '#fee2e2',
            color: isMatch ? '#065f46' : '#991b1b',
            fontSize: '0.85rem',
            fontWeight: 700,
          }}
        >
          {isMatch ? (
            <>
              <CheckCircle2 size={16} /> Verified Authentic & Identical
            </>
          ) : (
            <>
              <AlertTriangle size={16} /> Forensic Discrepancy Found
            </>
          )}
        </div>
      </div>

      {/* Side-by-Side or Stacked Hash Comparison */}
      <div style={{ marginTop: '24px' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowRightLeft size={16} color="#0284c7" />
          Side-by-Side Cryptographic Comparison
        </h4>

        <div className="comparison-grid">
          <div className="comparison-column" style={{ borderLeft: '4px solid #0284c7' }}>
            <div className="comparison-column-header">
              <span>REGISTERED MASTER HASH</span>
              <span className="badge badge-category">Baseline</span>
            </div>
            {evidenceName && (
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                Item: {evidenceName}
              </div>
            )}
            {originalFileName && (
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '10px' }}>
                Original File: <code>{originalFileName}</code>
              </div>
            )}
            <HashDisplay hash={originalHash} label="Original Master Hash" showChunkToggle={false} />
          </div>

          <div
            className="comparison-column"
            style={{ borderLeft: isMatch ? '4px solid #10b981' : '4px solid #ef4444' }}
          >
            <div className="comparison-column-header">
              <span>COMPUTED VERIFICATION HASH</span>
              <span
                className={`badge ${isMatch ? 'badge-match' : 'badge-mismatch'}`}
              >
                {isMatch ? 'Exact Match' : 'Mismatch'}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
              Verification Candidate
            </div>
            {testFileName && (
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '10px' }}>
                Tested File: <code>{testFileName}</code>
              </div>
            )}
            <HashDisplay hash={computedHash} label="Computed Hash" showChunkToggle={false} />
          </div>
        </div>
      </div>
    </div>
  );
};
