import React, { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import Login           from './pages/Login.jsx'
import Overview        from './pages/Overview.jsx'
import DatasetIntegrity from './pages/DatasetIntegrity.jsx'
import ModelIntegrity  from './pages/ModelIntegrity.jsx'
import Inference       from './pages/Inference.jsx'
import AuditLog        from './pages/AuditLog.jsx'

/* ── SVG Icons ──────────────────────────────────────── */
const Icon = ({ d, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)
const Icons = {
  grid:    'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z',
  db:      'M12 2C6.48 2 2 4.24 2 7s4.48 5 10 5 10-2.24 10-5-4.48-5-10-5zM2 17c0 2.76 4.48 5 10 5s10-2.24 10-5M2 12c0 2.76 4.48 5 10 5s10-2.24 10-5',
  shield:  'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  zap:     'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  log:     'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  server:  'M2 2h20v8H2z M2 14h20v8H2z M6 6h.01 M6 18h.01',
  book:    'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
  key:     'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4',
  settings:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
  logout:  'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
  search:  'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
  user:    'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
}

const CORE_NAV = [
  { to: '/',         icon: Icons.grid,    label: 'Overview'          },
  { to: '/dataset',  icon: Icons.db,      label: 'Dataset Integrity' },
  { to: '/model',    icon: Icons.shield,  label: 'Model Integrity'   },
  { to: '/inference',icon: Icons.zap,     label: 'Inference'         },
  { to: '/audit',    icon: Icons.log,     label: 'Audit Log'         },
]
const INFRA_NAV = [
  { to: '/docs',     icon: Icons.book,    label: 'Documentation' },
  { to: '/keys',     icon: Icons.key,     label: 'API Keys'      },
  { to: '/settings', icon: Icons.settings,label: 'Settings'      },
]

/* ── Derive initials & avatar color from username ── */
function getInitials(username = '') {
  const parts = username.split(/[._\-\s]/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return username.slice(0, 2).toUpperCase()
}
function getRoleLabel(role = '') {
  const map = { ADMIN: 'SecOps Admin', OPERATOR: 'Operator', VIEWER: 'Viewer' }
  return map[role] || role
}

/* ── Main App ──────────────────────────────────────── */
export default function App() {
  const [authUser, setAuthUser] = useState(() => {
    try {
      const stored = localStorage.getItem('trustcv_user')
      const token  = localStorage.getItem('trustcv_token')
      return stored && token ? JSON.parse(stored) : null
    } catch { return null }
  })

  function handleLogin(user) {
    setAuthUser(user)
  }

  function handleLogout() {
    localStorage.removeItem('trustcv_token')
    localStorage.removeItem('trustcv_user')
    setAuthUser(null)
  }

  /* ── Show login if not authenticated ── */
  if (!authUser) {
    return <Login onLogin={handleLogin} />
  }

  const initials = getInitials(authUser.username)
  const roleLabel = getRoleLabel(authUser.role)

  return (
    <BrowserRouter>
      <div className="app-shell">

        {/* ══════ SIDEBAR ══════ */}
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

          {/* Navigation */}
          <nav className="sidebar-nav">
            <div className="sidebar-section-label">Core Platform</div>
            {CORE_NAV.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => 'nav-item' + (isActive ? ' nav-item--active' : '')}
              >
                <span className="nav-icon"><Icon d={icon} size={13} /></span>
                {label}
              </NavLink>
            ))}

            <div className="sidebar-section-label" style={{ marginTop: 8 }}>Infrastructure</div>
            <div className="nav-node-status">
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite' }} />
              Nodes Normal
            </div>
            {INFRA_NAV.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => 'nav-item' + (isActive ? ' nav-item--active' : '')}
              >
                <span className="nav-icon"><Icon d={icon} size={13} /></span>
                {label}
              </NavLink>
            ))}
          </nav>

          {/* User panel — shows real logged-in user */}
          <div className="sidebar-user">
            <div className="sidebar-avatar" title={authUser.username}>{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{authUser.username}</div>
              <div className="sidebar-user-role">{roleLabel}</div>
            </div>
            <button
              onClick={handleLogout}
              className="sidebar-logout"
              title="Logout"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 4 }}
            >
              <Icon d={Icons.logout} size={14} />
            </button>
          </div>
        </aside>

        {/* ══════ MAIN WRAPPER ══════ */}
        <div className="main-wrapper">

          {/* Top Bar */}
          <header className="topbar">
            <div className="topbar-brand">
              <div className="topbar-logo">🛡️</div>
              <div className="topbar-brand-text">
                <div className="topbar-brand-name">TRUSTCV</div>
                <div className="topbar-brand-sub">Console</div>
              </div>
            </div>

            <div className="topbar-search">
              <span className="topbar-search-icon"><Icon d={Icons.search} size={13} /></span>
              <input placeholder="Search hashes, models, datasets, or logs (Cmd+K)" />
            </div>

            <div className="topbar-spacer" />

            <div className="topbar-chip">
              Production
              <strong style={{ fontSize: '0.7rem' }}>v2.4.1</strong>
            </div>

            <div className="topbar-chip topbar-chip-live">
              <span className="topbar-dot" />
              Live Verification: Active
            </div>

            <button className="topbar-icon-btn" aria-label="Notifications">
              🔔
              <span className="topbar-notif-dot" />
            </button>

            {/* Avatar with logout on click */}
            <div
              className="topbar-avatar"
              title={`${authUser.username} (${authUser.role}) — click to logout`}
              onClick={handleLogout}
              style={{ cursor: 'pointer' }}
            >
              {initials}
            </div>
          </header>

          {/* Page Content */}
          <main className="main-content">
            <Routes>
              <Route path="/"          element={<Overview />} />
              <Route path="/dataset"   element={<DatasetIntegrity />} />
              <Route path="/model"     element={<ModelIntegrity />} />
              <Route path="/inference" element={
                /* Only ADMIN and OPERATOR can run inference */
                ['ADMIN', 'OPERATOR'].includes(authUser.role)
                  ? <Inference user={authUser} />
                  : <Navigate to="/" replace />
              } />
              <Route path="/audit"     element={<AuditLog />} />
              <Route path="*"          element={<Overview />} />
            </Routes>
          </main>
        </div>

      </div>
    </BrowserRouter>
  )
}
