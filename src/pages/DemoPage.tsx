import React, { useState } from 'react';
import {
  FlaskConical,
  Play,
  RotateCcw,
  Download,
  ShieldCheck,
  ShieldAlert,
  FileText,
  AlertTriangle,
  ArrowRight,
  Info,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { EvidenceRecord, VerificationRecord, ActiveTab } from '../types';
import {
  AUTHENTIC_DEMO_TEXT,
  TAMPERED_DEMO_TEXT,
  downloadSampleFile,
} from '../services/sampleFiles';
import { calculateTextSHA256 } from '../services/crypto';
import { HashComparator } from '../components/HashComparator';

interface DemoPageProps {
  demoEvidence: EvidenceRecord[];
  onSeedDemo: () => Promise<void>;
  onClearDemo: () => Promise<void>;
  onSaveVerification: (record: VerificationRecord) => Promise<void>;
  onNavigate: (tab: ActiveTab) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

export const DemoPage: React.FC<DemoPageProps> = ({
  demoEvidence,
  onSeedDemo,
  onClearDemo,
  onSaveVerification,
  onNavigate,
  showToast,
}) => {
  const [selectedDemoId, setSelectedDemoId] = useState<string>('DEMO-EV-001');
  const [testMode, setTestMode] = useState<'authentic' | 'tampered' | null>(null);
  const [testedHash, setTestedHash] = useState<string>('');
  const [isComputing, setIsComputing] = useState<boolean>(false);

  const activeDemoRecord = demoEvidence.find((e) => e.id === selectedDemoId) || demoEvidence[0] || null;

  const handleRunInteractiveTest = async (mode: 'authentic' | 'tampered') => {
    if (!activeDemoRecord) {
      showToast('error', 'No demo evidence loaded. Please reset demo data.');
      return;
    }

    setIsComputing(true);
    setTestMode(mode);

    try {
      const textToHash = mode === 'authentic' ? AUTHENTIC_DEMO_TEXT : TAMPERED_DEMO_TEXT;
      // Real Web Crypto calculation
      const calculated = await calculateTextSHA256(textToHash);
      setTestedHash(calculated);

      const isMatch =
        calculated.toLowerCase().trim() === activeDemoRecord.sha256Hash.toLowerCase().trim();
      const outcome = isMatch ? 'MATCH' : 'MISMATCH';

      // Log verification to IndexedDB
      const verRecord: VerificationRecord = {
        id: `demo-sim-${Date.now()}`,
        evidenceId: activeDemoRecord.id,
        evidenceName: activeDemoRecord.name,
        verifiedAt: new Date().toISOString(),
        testFileName:
          mode === 'authentic'
            ? 'authentic_evidence_sample.log'
            : 'tampered_evidence_sample.log',
        testFileSize: new Blob([textToHash]).size,
        computedHash: calculated,
        originalHash: activeDemoRecord.sha256Hash,
        result: outcome,
        notes: `Demo Laboratory interactive simulation test (${mode.toUpperCase()}).`,
        isDemo: true,
      };

      await onSaveVerification(verRecord);

      if (isMatch) {
        showToast('success', 'Demo Test: Authentic file matched registered SHA-256 hash!');
      } else {
        showToast('error', 'Demo Test: Tampered file detected! Mismatch successfully flagged.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Simulation error during cryptographic hashing.');
    } finally {
      setIsComputing(false);
    }
  };

  const handleResetDemo = async () => {
    try {
      await onSeedDemo();
      setTestMode(null);
      setTestedHash('');
      showToast('success', 'Reset and re-seeded demonstration records.');
    } catch {
      showToast('error', 'Failed to reset demo data.');
    }
  };

  return (
    <div className="page-container">
      {/* Page Title & Header */}
      <div className="page-header-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="demo-indicator-badge">Simulated Environment</span>
            <span style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 600 }}>
              Isolated from Actual Registered Evidence
            </span>
          </div>
          <h2 className="page-title">Digital Evidence Integrity Demonstration Lab</h2>
          <p className="page-subtitle">
            Demonstrate how cryptographic SHA-256 hashing detects unauthorized file alterations, proving the mathematical foundation of digital forensic integrity.
          </p>
        </div>

        <div className="quick-actions-bar">
          <button
            className="btn btn-secondary"
            onClick={handleResetDemo}
            title="Reset and reload default demo cases"
            id="demo-reset-records-btn"
          >
            <RotateCcw size={16} /> Reset Demo Data
          </button>
        </div>
      </div>

      {/* Demo Mode Notice Banner */}
      <div className="alert-box alert-warning">
        <AlertTriangle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Demonstration Environment Notice:</strong> All records in this tab are marked with the <code>[DEMO]</code> flag. They are pre-seeded for demonstration and educational purposes. Verification calculations use genuine browser Web Crypto SHA-256 cryptography.
        </div>
      </div>

      {/* Main Demo Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: Sample Records & Test Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Sample Evidence Selector */}
          <div className="forensic-card">
            <div className="forensic-card-header">
              <h3 className="forensic-card-title">
                <FileText size={19} color="#0284c7" />
                1. Select Sample Forensic Case
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {demoEvidence.map((demo) => {
                const isSelected = demo.id === selectedDemoId;
                return (
                  <div
                    key={demo.id}
                    onClick={() => {
                      setSelectedDemoId(demo.id);
                      setTestMode(null);
                      setTestedHash('');
                    }}
                    style={{
                      padding: '14px',
                      borderRadius: '10px',
                      border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                        {demo.name}
                      </span>
                      <span className="badge badge-demo">{demo.id}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Case #{demo.caseNumber} • <code>{demo.fileName}</code>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Download Real Test Files */}
          <div className="forensic-card">
            <div className="forensic-card-header">
              <h3 className="forensic-card-title">
                <Download size={19} color="#0284c7" />
                2. Download Real Files to Your Device
              </h3>
            </div>

            <p style={{ fontSize: '0.86rem', color: '#475569', marginBottom: '14px', lineHeight: 1.5 }}>
              Download these two sample log files to test the physical file picker on the <strong>Verify Evidence</strong> page:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #a7f3d0', backgroundColor: '#ecfdf5', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#065f46' }}>
                    Authentic Sample File
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#047857' }}>
                    <code>authentic_evidence_sample.log</code>
                  </div>
                </div>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => {
                    downloadSampleFile(true);
                    showToast('success', 'Downloaded authentic_evidence_sample.log');
                  }}
                  id="demo-download-authentic-btn"
                >
                  <Download size={14} /> Download
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #fecaca', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#991b1b' }}>
                    Tampered Sample File (1-Word Altered)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#b91c1c' }}>
                    <code>tampered_evidence_sample.log</code>
                  </div>
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    downloadSampleFile(false);
                    showToast('warning', 'Downloaded tampered_evidence_sample.log');
                  }}
                  id="demo-download-tampered-btn"
                >
                  <Download size={14} /> Download
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 1-Click Interactive Verification Lab */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="forensic-card">
            <div className="forensic-card-header">
              <h3 className="forensic-card-title">
                <Sparkles size={19} color="#d97706" />
                3. Interactive Cryptographic Verification Simulation
              </h3>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '18px', lineHeight: 1.5 }}>
              Targeting: <strong>{activeDemoRecord?.name || 'Selected Demo'}</strong>. Execute true Web Crypto SHA-256 calculations directly against the authentic or tampered payload:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <button
                className="btn btn-success"
                onClick={() => handleRunInteractiveTest('authentic')}
                disabled={isComputing}
                id="btn-test-authentic"
                style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                  <ShieldCheck size={20} /> Test Authentic File
                </div>
                <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                  Expected: Strict MATCH
                </span>
              </button>

              <button
                className="btn btn-danger"
                onClick={() => handleRunInteractiveTest('tampered')}
                disabled={isComputing}
                id="btn-test-tampered"
                style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                  <ShieldAlert size={20} /> Test Tampered File
                </div>
                <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                  Expected: MISMATCH
                </span>
              </button>
            </div>

            {/* Cryptographic Educational Explainer */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Info size={16} color="#0284c7" />
                The Cryptographic Avalanche Effect
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
                In SHA-256, changing even a single bit in the source input causes an unpredictable cascade, changing approximately 50% of the output hex characters. This makes covert alteration of evidence mathematically detectable without trusting file metadata or file timestamps.
              </p>
            </div>
          </div>

          {/* Live Verdict & Hash Comparator */}
          {activeDemoRecord && testedHash && (
            <HashComparator
              originalHash={activeDemoRecord.sha256Hash}
              computedHash={testedHash}
              originalFileName={activeDemoRecord.fileName}
              testFileName={
                testMode === 'authentic'
                  ? 'authentic_evidence_sample.log'
                  : 'tampered_evidence_sample.log'
              }
              evidenceName={activeDemoRecord.name}
            />
          )}
        </div>
      </div>
    </div>
  );
};
