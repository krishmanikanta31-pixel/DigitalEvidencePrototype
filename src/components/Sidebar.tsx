import React from 'react';
import {
  Shield,
  LayoutDashboard,
  FilePlus2,
  ShieldCheck,
  History,
  FlaskConical,
  LockKeyhole,
  X,
  Database,
  Cpu,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  evidenceCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  evidenceCount,
  mobileOpen,
  onCloseMobile,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={19} />,
    },
    {
      id: 'register',
      label: 'Register Evidence',
      icon: <FilePlus2 size={19} />,
    },
    {
      id: 'verify',
      label: 'Verify Evidence',
      icon: <ShieldCheck size={19} />,
    },
    {
      id: 'history',
      label: 'Evidence History',
      icon: <History size={19} />,
      badge: evidenceCount > 0 ? evidenceCount : undefined,
    },
    {
      id: 'demo',
      label: 'Demo Mode',
      icon: <FlaskConical size={19} />,
      badge: 'Interactive',
    },
    {
      id: 'privacy',
      label: 'Privacy & Limits',
      icon: <LockKeyhole size={19} />,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && <div className="sidebar-backdrop" onClick={onCloseMobile} />}

      <aside className={`app-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-badge">
            <div className="brand-icon-wrapper">
              <Shield size={22} strokeWidth={2.4} />
            </div>
            <div>
              <div className="brand-title">Evidence Guard</div>
              <div className="brand-subtitle">Forensic Integrity System</div>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            className="mobile-menu-btn"
            style={{ color: '#94a3b8' }}
            onClick={onCloseMobile}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Core Operations</div>

          {navItems.slice(0, 3).map((item) => (
            <button
              key={item.id}
              className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              id={`nav-btn-${item.id}`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge !== undefined && <span className="nav-badge">{item.badge}</span>}
            </button>
          ))}

          <div className="nav-section-title" style={{ marginTop: '16px' }}>
            Audit & Verification
          </div>

          {navItems.slice(3).map((item) => (
            <button
              key={item.id}
              className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              id={`nav-btn-${item.id}`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge !== undefined && <span className="nav-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="crypto-status-pill">
            <div className="status-indicator-dot" />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f8fafc', fontWeight: 600, fontSize: '0.75rem' }}>
                <Cpu size={12} color="#38bdf8" /> Web Crypto API Ready
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.7rem', marginTop: '2px' }}>
                <Database size={11} /> IndexedDB Local
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
