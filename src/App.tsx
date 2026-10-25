import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, EvidenceRecord, VerificationRecord } from './types';
import { evidenceDB } from './services/db';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Toast, ToastMessage } from './components/Toast';
import { DashboardPage } from './pages/DashboardPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyPage } from './pages/VerifyPage';
import { HistoryPage } from './pages/HistoryPage';
import { DemoPage } from './pages/DemoPage';
import { PrivacyPage } from './pages/PrivacyPage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>([]);
  const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedVerifyEvidenceId, setSelectedVerifyEvidenceId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const showToast = useCallback(
    (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadData = useCallback(async () => {
    try {
      let evList = await evidenceDB.getAllEvidence(true);
      let verList = await evidenceDB.getAllVerifications(true);

      // If database is completely empty on first launch, seed demo records
      if (evList.length === 0) {
        await evidenceDB.seedDemoRecords();
        evList = await evidenceDB.getAllEvidence(true);
        verList = await evidenceDB.getAllVerifications(true);
      }

      setEvidenceList(evList);
      setVerifications(verList);
    } catch (err) {
      console.error('Failed to load database records:', err);
      showToast('error', 'Failed to initialize local IndexedDB storage.');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleRegisterSuccess = async (record: EvidenceRecord) => {
    await evidenceDB.saveEvidence(record);
    await loadData();
    setSelectedVerifyEvidenceId(record.id);
  };

  const handleVerificationComplete = async (record: VerificationRecord) => {
    await evidenceDB.saveVerification(record);
    await loadData();
  };

  const handleDeleteEvidence = async (id: string) => {
    await evidenceDB.deleteEvidence(id);
    await loadData();
  };

  const handleVerifyEvidence = (id: string) => {
    setSelectedVerifyEvidenceId(id);
    setActiveTab('verify');
  };

  const handleSeedDemo = async () => {
    await evidenceDB.seedDemoRecords();
    await loadData();
  };

  const handleClearDemo = async () => {
    await evidenceDB.clearDemoRecords();
    await loadData();
  };

  return (
    <div className="app-container">
      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Dark Navy Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        evidenceCount={evidenceList.length}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Workspace */}
      <main className="app-main">
        <Header
          activeTab={activeTab}
          onOpenMobile={() => setMobileOpen(true)}
          onSelectTab={setActiveTab}
          isDemoActive={evidenceList.some((e) => e.isDemo)}
        />

        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#64748b', fontSize: '1rem', fontWeight: 600 }}>
            Initializing Secure Local Forensic Ledger...
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardPage
                evidenceList={evidenceList}
                verifications={verifications}
                onNavigate={setActiveTab}
                onVerifyItem={handleVerifyEvidence}
              />
            )}

            {activeTab === 'register' && (
              <RegisterPage
                existingEvidence={evidenceList}
                onRegisterSuccess={handleRegisterSuccess}
                onNavigate={setActiveTab}
                showToast={showToast}
              />
            )}

            {activeTab === 'verify' && (
              <VerifyPage
                evidenceList={evidenceList}
                initialSelectedEvidenceId={selectedVerifyEvidenceId}
                onVerificationComplete={handleVerificationComplete}
                onNavigate={setActiveTab}
                showToast={showToast}
              />
            )}

            {activeTab === 'history' && (
              <HistoryPage
                evidenceList={evidenceList}
                verifications={verifications}
                onDeleteEvidence={handleDeleteEvidence}
                onVerifyEvidence={handleVerifyEvidence}
                onNavigate={setActiveTab}
                showToast={showToast}
              />
            )}

            {activeTab === 'demo' && (
              <DemoPage
                demoEvidence={evidenceList.filter((e) => e.isDemo)}
                onSeedDemo={handleSeedDemo}
                onClearDemo={handleClearDemo}
                onSaveVerification={handleVerificationComplete}
                onNavigate={setActiveTab}
                showToast={showToast}
              />
            )}

            {activeTab === 'privacy' && (
              <PrivacyPage
                evidenceCount={evidenceList.length}
                verificationCount={verifications.length}
                onRefreshData={loadData}
                showToast={showToast}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
