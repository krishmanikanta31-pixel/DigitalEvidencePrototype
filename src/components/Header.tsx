import React from 'react';
import { Menu, ShieldAlert, FlaskConical, FilePlus2 } from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenMobile: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  isDemoActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobile,
  onSelectTab,
  isDemoActive = true,
}) => {
  const getTabInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Executive Forensic Dashboard', category: 'Overview' };
      case 'register':
        return { title: 'Register Digital Evidence', category: 'Intake' };
      case 'verify':
        return { title: 'Cryptographic Hash Verification', category: 'Integrity Check' };
      case 'history':
        return { title: 'Evidence Chain of Custody Log', category: 'Audit Trail' };
      case 'demo':
        return { title: 'Forensic Integrity Demonstration', category: 'Interactive Lab' };
      case 'privacy':
        return { title: 'Privacy Architecture & Limitations', category: 'Security' };
      default:
        return { title: 'Digital Evidence System', category: 'System' };
    }
  };

  const { title, category } = getTabInfo();

  return (
    <header className="app-header">
      <div className="header-title-block">
        <button
          className="mobile-menu-btn"
          onClick={onOpenMobile}
          aria-label="Open navigation menu"
          id="btn-mobile-menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="header-page-title">{title}</h1>
            <span className="header-page-category">{category}</span>
          </div>
        </div>
      </div>

      <div className="header-actions">
        {isDemoActive && activeTab !== 'demo' && (
          <button
            className="demo-mode-pill"
            onClick={() => onSelectTab('demo')}
            style={{ cursor: 'pointer', border: '1px solid #fde68a' }}
            title="Switch to Demo Laboratory"
            id="header-demo-btn"
          >
            <FlaskConical size={14} />
            <span>Demo Mode Available</span>
            <span className="demo-indicator-badge">Lab</span>
          </button>
        )}

        {activeTab !== 'register' && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onSelectTab('register')}
            id="header-quick-register-btn"
          >
            <FilePlus2 size={15} />
            <span>New Evidence</span>
          </button>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            color: '#64748b',
            padding: '5px 10px',
            backgroundColor: '#f8fafc',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
          }}
          title="All files remain strictly on your device. Hashes are calculated in-browser."
        >
          <ShieldAlert size={14} color="#0284c7" />
          <span style={{ fontWeight: 600, color: '#334155' }}>Zero Cloud Upload</span>
        </div>
      </div>
    </header>
  );
};
