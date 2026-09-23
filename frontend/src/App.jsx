import React from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import Login          from './pages/Login.jsx'
import Overview       from './pages/Overview.jsx'
import DatasetIntegrity from './pages/DatasetIntegrity.jsx'
import ModelIntegrity from './pages/ModelIntegrity.jsx'
import Inference      from './pages/Inference.jsx'
import AuditLog       from './pages/AuditLog.jsx'
import Provenance     from './pages/Provenance.jsx'
import SystemStatus   from './pages/SystemStatus.jsx'

/* ── SVG Icon helper ─────────────────────────────── */
const Ico = ({ d, size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

const NAV = [
  {
    section: 'Core Platform',
    items: [
      { to: '/',           icon: 'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z', label: 'Overview'          },
      { to: '/dataset',    icon: 'M12 2C6.48 2 2 4.24 2 7s4.48 5 10 5 10-2.24 10-5-4.48-5-10-5zM2 17c0 2.76 4.48 5 10 5s10-2.24 10-5M2 12c0 2.76 4.48 5 10 5s10-2.24 10-5', label: 'Dataset Integrity' },
      { to: '/model',      icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', label: 'Model Integrity'   },
      { to: '/inference',  icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', label: 'Inference'         },
      { to: '/audit',      icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8', label: 'Audit Log'         },
      { to: '/provenance', icon: 'M12 5v14 M5 12l7-7 7 7 M3 19h18',              label: 'Provenance'        },
    ]
  },
  {
    section: 'Infrastructure',
    items: [
      { to: '/status', icon: 'M2 2h20v8H2z M2 14h20v8H2z M6 6h.01 M6 18h.01', label: 'System Status' },
    ]
  },
]

/* Derive initials from username */
function initials(name = '') {
  const parts = name.split(/[._\-\s]/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase() || 'U'
}

/* Page title from path */
function usePageTitle() {
  const loc = useLocation()
  const map = {
    '/':           { title: 'Overview',          sub: 'System health at a glance' },
    '/dataset':    { title: 'Dataset Integrity',  sub: 'Cryptographic dataset verification' },
    '/model':      { title: 'Model Integrity',    sub: 'SHA-256 model hash verification' },
    '/inference':  { title: 'Inference',          sub: 'Tamper-evident AI inference' },
    '/audit':      { title: 'Audit Log',          sub: 'Immutable event ledger' },
    '/provenance': { title: 'Provenance',         sub: 'End-to-end pipeline lineage' },
    '/status':     { title: 'System Status',      sub: 'Backend & database health' },
  }
  return map[loc.pathname] || { title: 'TRUSTCV', sub: '' }
}

function AppShell() {
  const { user, logout } = useAuth()
  const { title, sub } = usePageTitle()

  if (!user) return <Login />

  return (
    <div className="app-shell">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-row">
            <div className="sidebar-logo">🛡️</div>
            <div className="sidebar-brand-text">
              <div className="sidebar-brand-name">TRUSTCV</div>
              <div className="sidebar-brand-sub">AI Integrity Suite</div>
            </div>
          </div>
          <span className="sidebar-env-badge">PROD-US-EAST</span>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV.map(({ section, items }) => (
            <React.Fragment key={section}>
              <div className="sidebar-section-label">{section}</div>
              {items.map(({ to, icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}
                >
                  <span className="nav-icon"><Ico d={icon} size={14} /></span>
                  <span className="nav-label">{label}</span>
                </NavLink>
              ))}
            </React.Fragment>
          ))}
        </nav>

        {/* User */}
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials(user.username)}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.username}</div>
            <div className="sidebar-user-role">{user.role}</div>
          </div>
          <button className="sidebar-logout" onClick={logout} title="Logout">
            <Ico d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" size={14} />
          </button>
        </div>
      </aside>

      {/* ── MAIN WRAPPER ── */}
      <div className="main-wrapper">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-title">
            {title}
            {sub && <div className="topbar-title-sub">{sub}</div>}
          </div>

          <div className="topbar-right">
            {/* Live indicator */}
            <span className="health-pill health-pill-ok" style={{ fontSize: '0.7rem', padding: '4px 10px' }}>
              <span className="health-dot health-dot-pulse" />
              Live
            </span>

            {/* User chip */}
            <div className="topbar-user-chip">
              <div className="topbar-avatar">{initials(user.username)}</div>
              <span className="topbar-username">{user.username}</span>
              <span className="topbar-role">{user.role}</span>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="btn btn-secondary btn-sm"
              style={{ padding: '6px 10px' }}
              title="Logout"
            >
              <Ico d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" size={13} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="main-content">
          <Routes>
            <Route path="/"           element={<Overview />} />
            <Route path="/dataset"    element={<DatasetIntegrity />} />
            <Route path="/model"      element={<ModelIntegrity />} />
            <Route path="/inference"  element={
              ['ADMIN', 'OPERATOR'].includes(user.role)
                ? <Inference />
                : <Navigate to="/" replace />
            } />
            <Route path="/audit"      element={<AuditLog />} />
            <Route path="/provenance" element={<Provenance />} />
            <Route path="/status"     element={<SystemStatus />} />
            <Route path="*"           element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  )
}
