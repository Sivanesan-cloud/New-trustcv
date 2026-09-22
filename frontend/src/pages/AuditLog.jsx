import React, { useState, useEffect, useCallback, useRef } from 'react'
import api from '../api/axiosClient'

/* ── Tiny SVG sparkline ───────────────────────────── */
function Sparkline({ points, color = '#2563eb', fill = false }) {
  const w = 80, h = 28
  const max = Math.max(...points), min = Math.min(...points)
  const range = max - min || 1
  const xs = points.map((_, i) => (i / (points.length - 1)) * w)
  const ys = points.map(v => h - ((v - min) / range) * (h - 4) - 2)
  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ')
  const area = `${path} L${w},${h} L0,${h} Z`
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      {fill && <path d={area} fill={color} opacity="0.12" />}
      <path d={path} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}

/* ── Mini bar chart ───────────────────────────────── */
function MiniBarChart({ bars, color = '#2563eb' }) {
  const max = Math.max(...bars)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 24 }}>
      {bars.map((v, i) => (
        <div key={i} style={{ width: 6, height: `${(v / max) * 100}%`, background: color, borderRadius: '1px 1px 0 0', opacity: 0.7 + (i / bars.length) * 0.3 }} />
      ))}
    </div>
  )
}

/* ── User avatar ──────────────────────────────────── */
function Avatar({ initials, color = '#2563eb', size = 28 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: size * 0.28,
      fontWeight: 700, color: '#fff', flexShrink: 0,
      fontFamily: 'Inter, sans-serif',
    }}>
      {initials}
    </div>
  )
}

/* ── Status pill ──────────────────────────────────── */
const STATUS_STYLES = {
  VERIFIED: { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0', icon: '✓', label: 'VERIFIED' },
  APPROVED: { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe', icon: '●', label: 'APPROVED' },
  BLOCKED:  { bg: '#fef2f2', color: '#991b1b', border: '#fecaca', icon: '🛑', label: 'BLOCKED'  },
  WARNING:  { bg: '#fffbeb', color: '#92400e', border: '#fde68a', icon: '⚠', label: 'WARNING'  },
  SEALED:   { bg: '#f3f4f6', color: '#374151', border: '#d1d5db', icon: '🔒', label: 'SEALED'   },
}
function StatusPill({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.VERIFIED
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: s.bg, border: `1px solid ${s.border}`, color: s.color, borderRadius: 4, fontSize: '0.68rem', fontWeight: 700, padding: '3px 8px', whiteSpace: 'nowrap' }}>
      {s.icon} {s.label}
    </span>
  )
}

/* ── Attestation events (mock data matching screenshot) ── */
const EVENTS = [
  {
    blocked: false,
    time: 'Oct 24, 2025 14:48:32',
    ago: '4 mins ago',
    block: '#14892',
    initials: 'AM', avatarColor: '#2563eb',
    user: 'alex.mercer@trustcv.ai',
    role: 'SecOps Lead',
    action: 'Model Weights Attestation',
    actionSub: null,
    asset: 'yolov8-perimeter.pt',
    assetColor: '#2563eb',
    status: 'VERIFIED',
    hash: '0x31f7a...90a1',
  },
  {
    blocked: false,
    time: 'Oct 24, 2025 14:41:05',
    ago: '11 mins ago',
    block: '#14891',
    initials: '⚙', avatarColor: '#6366f1',
    user: 'ci-runner-us-east-1',
    role: 'Service Account',
    action: 'Inference Request Authorized',
    actionSub: null,
    asset: 'frame_surveillance_091.jpg',
    assetColor: '#2563eb',
    status: 'APPROVED',
    hash: '0x81bd...4421',
  },
  {
    blocked: false,
    time: 'Oct 24, 2025 14:22:30',
    ago: '30 mins ago',
    block: '#14880',
    initials: 'ER', avatarColor: '#7c3aed',
    user: 'elena.rostova@trustcv.ai',
    role: 'ML Engineer',
    action: 'Dataset Manifest Merkle Root Check',
    actionSub: null,
    asset: 'coco-val-v3.2',
    assetColor: '#10b981',
    status: 'VERIFIED',
    hash: '0x62c2...b110',
  },
  {
    blocked: true,
    time: 'Oct 24, 2025 13:38:19',
    ago: '54 mins ago',
    block: '#14880',
    initials: '👁', avatarColor: '#dc2626',
    user: 'system-watchdog',
    role: 'Automated Daemon',
    action: 'Inference Blocked (Hash Mismatch)',
    actionSub: 'Payload digest differed from hardware root',
    asset: 'detr-facial-auth.onnx',
    assetColor: '#dc2626',
    status: 'BLOCKED',
    hash: '0x1e99...0174',
  },
  {
    blocked: false,
    time: 'Oct 24, 2025 13:12:00',
    ago: '1h 40m ago',
    block: '#14888',
    initials: 'KP', avatarColor: '#0891b2',
    user: 'kiran.patel@trustcv.ai',
    role: 'DevOps Admin',
    action: 'API Key Secret Rotation',
    actionSub: null,
    asset: 'kmv-key-acc-4516',
    assetColor: '#6366f1',
    status: 'WARNING',
    hash: '0x04b...d19',
  },
  {
    blocked: false,
    time: 'Oct 24, 2025 12:45:11',
    ago: '2h 07m ago',
    block: '#14887',
    initials: 'AM', avatarColor: '#2563eb',
    user: 'alex.mercer@trustcv.ai',
    role: 'SecOps Lead',
    action: 'Weights Baseline Signed',
    actionSub: null,
    asset: 'resnet50-biometrics.pt',
    assetColor: '#10b981',
    status: 'VERIFIED',
    hash: '0x9ca...33b',
  },
  {
    blocked: false,
    time: 'Oct 24, 2025 11:38:44',
    ago: '3h 22m ago',
    block: '#14886',
    initials: '⚙', avatarColor: '#6366f1',
    user: 'system-watchdog',
    role: 'Automated Daemon',
    action: 'Audit Log Checkpoint Sealed',
    actionSub: null,
    asset: 'ledger-block-14886',
    assetColor: '#6b7280',
    status: 'SEALED',
    hash: '0x22c1...a289',
  },
  {
    blocked: false,
    time: 'Oct 24, 2025 10:15:22',
    ago: '4h 37m ago',
    block: '#14885',
    initials: 'ER', avatarColor: '#7c3aed',
    user: 'elena.rostova@trustcv.ai',
    role: 'ML Engineer',
    action: 'Model Weights Attestation',
    actionSub: null,
    asset: 'yolov8-perimeter.pt',
    assetColor: '#2563eb',
    status: 'VERIFIED',
    hash: '0x55aa...e81',
  },
]

/* ── Main AuditLog page ───────────────────────────── */
export default function AuditLog() {
  const [search,      setSearch]      = useState('')
  const [dateFilter,  setDateFilter]  = useState('Last 7 Days')
  const [actionFilter,setActionFilter]= useState('All Actions')
  const [statusFilter,setStatusFilter]= useState('All Statuses')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [pulse,       setPulse]       = useState(false)
  const [apiLogs,     setApiLogs]     = useState([])
  const [page,        setPage]        = useState(1)

  /* pulse the live indicator every 5s */
  useEffect(() => {
    if (!autoRefresh) return
    const id = setInterval(() => setPulse(p => !p), 5000)
    return () => clearInterval(id)
  }, [autoRefresh])

  /* fetch real logs (merged with mock for demo) */
  useEffect(() => {
    api.get('/audit/logs').then(({ data }) => setApiLogs(data.audit_logs || [])).catch(() => {})
  }, [])

  /* filter events */
  const filtered = EVENTS.filter(e => {
    if (!search) return true
    const q = search.toLowerCase()
    return e.user.includes(q) || e.action.toLowerCase().includes(q) || e.asset.toLowerCase().includes(q) || e.hash.includes(q)
  }).filter(e => {
    if (statusFilter === 'All Statuses') return true
    return e.status === statusFilter.toUpperCase()
  })

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column' }}>

      {/* ── Breadcrumb badges ── */}
      <div style={{ padding: '14px 28px 0', display: 'flex', gap: 8 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 4, padding: '3px 10px', fontSize: '0.68rem', fontWeight: 700, color: '#1d4ed8' }}>
          🔒 IMMUTABLE LEDGER v4.1
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 4, padding: '3px 10px', fontSize: '0.68rem', fontWeight: 700, color: '#065f46' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          ED25519 HARDWARE ENCLAVE
        </span>
      </div>

      {/* ── Page header ── */}
      <div className="page-header" style={{ padding: '10px 28px 12px' }}>
        <div className="page-header-left">
          <h1 style={{ fontSize: '1.55rem', marginBottom: 6 }}>Cryptographic Audit Log</h1>
          <p style={{ fontSize: '0.825rem', maxWidth: 520 }}>
            Append-only, tamper-evident immutable log of all model verifications, dataset checks, and inference requests.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" style={{ gap: 6 }}>🛡 Verify Chain Integrity</button>
            <button className="btn btn-secondary" style={{ gap: 6 }}>⬇ Export Signed Log ▼</button>
          </div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-500)', display: 'flex', alignItems: 'center', gap: 5 }}>
            ↻ Key Rotation Info
          </button>
        </div>
      </div>

      <div className="page-wrap" style={{ paddingTop: 0 }}>

        {/* ── Merkle hash chain banner ── */}
        <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
              🔗
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-900)' }}>
                  Merkle Hash Chain Intact: 14,892 verified blocks
                </span>
                <span style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: 4 }}>
                  No breaks detected
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem', color: 'var(--text-500)' }}>
                <span>Current Root Hash:</span>
                <code style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem', color: 'var(--primary)' }}>
                  9e8a1b7e030da409bac183fb584c120f97091843...
                </code>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-400)', fontSize: '0.8rem' }}>📋 Copy</button>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>Sync Frequency</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-900)' }}>Sub-Second (126ms)</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>Attestation Anchor</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-900)' }}>SGX Enclave: Node #64</div>
            </div>
          </div>
        </div>

        {/* ── 4 Stat cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
          {[
            {
              label: '24H Validations', trend: '+14.2%', trendColor: '#10b981',
              value: '3,491', sub: '100% Cryptographic Consensus',
              sparkPoints: [180, 210, 195, 230, 215, 260, 245, 280, 260, 295, 310, 340],
              sparkColor: '#2563eb', spark: 'line',
            },
            {
              label: 'Blocked Hash Mismatches', trend: null, badge: '3 Critical', badgeColor: '#dc2626',
              value: '7', sub: 'Zero unauthorized payloads executed',
              sparkPoints: [2, 5, 3, 8, 4, 6, 7, 3, 9, 5, 4, 7],
              sparkColor: '#ef4444', spark: 'line',
            },
            {
              label: 'Signed Model Weights', trend: '99.99%', trendColor: '#10b981',
              value: '412 Active', sub: 'Certified SHA-256 + Ed25519',
              sparkPoints: [380, 390, 385, 395, 400, 398, 405, 408, 412, 411, 412, 412],
              sparkColor: '#10b981', spark: 'line',
            },
            {
              label: 'Ledger Proof Latency', trend: 'P99 84ms', trendColor: '#6b7280',
              value: '32 ms', sub: 'Proof generation on GPU enclave',
              bars: [3, 5, 4, 6, 7, 5, 8, 6, 7, 9, 8, 10], spark: 'bar',
            },
          ].map(({ label, trend, trendColor, badge, badgeColor, value, sub, sparkPoints, sparkColor, bars, spark }) => (
            <div key={label} className="section-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</span>
                  {trend && <span style={{ fontSize: '0.68rem', fontWeight: 700, color: trendColor }}>{trend}</span>}
                  {badge && <span style={{ background: badgeColor, color: '#fff', fontSize: '0.62rem', fontWeight: 700, padding: '1px 6px', borderRadius: 3 }}>{badge}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-900)', letterSpacing: '-0.5px', lineHeight: 1 }}>{value}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-500)', marginTop: 4 }}>{sub}</div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {spark === 'line' && <Sparkline points={sparkPoints} color={sparkColor} fill />}
                    {spark === 'bar'  && <MiniBarChart bars={bars} color="#2563eb" />}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Search + filter bar ── */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
          <div className="search-input-wrap" style={{ flex: 1, minWidth: 240 }}>
            <span className="search-icon">🔍</span>
            <input className="input-field" placeholder="Search by User, Action, Asset, or Transaction Hash..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 30, height: 34, fontSize: '0.8rem' }} />
          </div>
          {[
            { value: dateFilter,   options: ['Last 7 Days','Last 30 Days','Last 90 Days','All Time'], set: setDateFilter },
            { value: actionFilter, options: ['All Actions','Attestation','Inference','Dataset Check','Key Rotation'], set: setActionFilter },
            { value: statusFilter, options: ['All Statuses','VERIFIED','APPROVED','BLOCKED','WARNING','SEALED'], set: setStatusFilter },
          ].map(({ value, options, set }, i) => (
            <select key={i} className="input-field" style={{ width: 'auto', height: 34, fontSize: '0.78rem', padding: '0 28px 0 10px' }}
              value={value} onChange={e => set(e.target.value)}>
              {options.map(o => <option key={o}>{o}</option>)}
            </select>
          ))}
          <button onClick={() => setAutoRefresh(r => !r)}
            style={{ width: 34, height: 34, borderRadius: 6, border: '1px solid var(--card-border)', background: '#fff', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: autoRefresh ? 'var(--primary)' : 'var(--text-400)' }}>
            ↻
          </button>
        </div>

        {/* ── Active filters ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, fontSize: '0.72rem', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--text-400)', fontWeight: 600 }}>ACTIVE FILTERS:</span>
          {[`Time: ${dateFilter}`, 'Enclave: All Nodes'].map(f => (
            <span key={f} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 4, padding: '2px 8px', color: 'var(--text-700)', fontWeight: 500 }}>
              {f}
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-400)', fontSize: '0.75rem', lineHeight: 1, padding: 0 }}>✕</button>
            </span>
          ))}
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, fontSize: '0.72rem' }}>Clear all</button>
        </div>

        {/* ── Attestation Events table ── */}
        <div className="section-card" style={{ overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafafa' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-900)' }}>Attestation Events</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 4, fontSize: '0.65rem', fontWeight: 600, color: '#1e40af', padding: '2px 8px' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: autoRefresh ? '#10b981' : '#9ca3af', display: 'inline-block', animation: autoRefresh ? 'pulse-dot 2s ease-in-out infinite' : 'none' }} />
                Auto-refreshing (5s)
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-500)', fontFamily: 'JetBrains Mono' }}>
                Live Hash Stream: <span style={{ color: 'var(--primary)', fontWeight: 700 }}>#14892 → #14891</span>
              </span>
              <button style={{ background: 'none', border: '1px solid var(--card-border)', borderRadius: 4, cursor: 'pointer', padding: '3px 6px', fontSize: '0.75rem', color: 'var(--text-400)' }}>⊞</button>
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 28 }}></th>
                <th>Timestamp (UTC)</th>
                <th>User / Identity</th>
                <th>Action</th>
                <th>Asset / Target</th>
                <th>Status</th>
                <th>Hash &amp; Proof</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev, i) => (
                <tr key={i} style={{ background: ev.blocked ? '#fff8f8' : undefined }}>
                  {/* Lock icon */}
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: ev.blocked ? '#dc2626' : 'var(--text-300)' }}>
                      {ev.blocked ? '🛡' : '🔒'}
                    </span>
                  </td>

                  {/* Timestamp */}
                  <td style={{ minWidth: 140 }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: 'var(--text-700)', marginBottom: 2 }}>{ev.time}</div>
                    <div style={{ fontSize: '0.65rem', color: ev.blocked ? '#dc2626' : 'var(--text-400)', fontWeight: ev.blocked ? 600 : 400 }}>
                      {ev.ago} • Block <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{ev.block}</span>
                    </div>
                  </td>

                  {/* User */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar initials={ev.initials} color={ev.avatarColor} size={26} />
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-900)' }}>{ev.user}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-400)' }}>({ev.role})</div>
                      </div>
                    </div>
                  </td>

                  {/* Action */}
                  <td style={{ minWidth: 160 }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: ev.blocked ? '#dc2626' : 'var(--text-900)', lineHeight: 1.3 }}>
                      {ev.action}
                    </div>
                    {ev.actionSub && (
                      <div style={{ fontSize: '0.68rem', color: '#dc2626', fontStyle: 'italic', marginTop: 2, lineHeight: 1.3 }}>{ev.actionSub}</div>
                    )}
                  </td>

                  {/* Asset */}
                  <td>
                    <code style={{ fontSize: '0.68rem', fontFamily: 'JetBrains Mono', color: ev.assetColor, background: `${ev.assetColor}14`, padding: '2px 6px', borderRadius: 3, wordBreak: 'break-all' }}>
                      {ev.asset}
                    </code>
                  </td>

                  {/* Status */}
                  <td><StatusPill status={ev.status} /></td>

                  {/* Hash & proof */}
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <code style={{ fontSize: '0.68rem', fontFamily: 'JetBrains Mono', color: 'var(--text-500)', background: 'var(--gray-bg)', padding: '2px 6px', borderRadius: 3 }}>
                        {ev.hash}
                      </code>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 2 }}>
                        Proof ↗
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination footer */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--card-border)', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-500)' }}>
              Showing 1–8 of <strong style={{ color: 'var(--text-900)' }}>14,892</strong> verified transactions
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {['<', '1', '2', '3', '…', '1,862', '>'].map((p, i) => (
                <button key={i}
                  style={{
                    width: p === '…' ? 'auto' : 28, height: 28, borderRadius: 5,
                    border: '1px solid var(--card-border)',
                    background: p === '1' ? 'var(--primary)' : '#fff',
                    color: p === '1' ? '#fff' : p === '<' || p === '>' ? 'var(--text-400)' : 'var(--text-700)',
                    fontSize: '0.72rem', fontWeight: p === '1' ? 700 : 500,
                    cursor: 'pointer', padding: p === '…' ? '0 4px' : 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  onClick={() => p === '2' ? setPage(2) : p === '3' ? setPage(3) : null}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Cryptographic attestation footer ── */}
        <div style={{ marginTop: 16, background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
            🛡
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-900)' }}>
                Cryptographic Signature &amp; Enclave Attestation
              </span>
              <span style={{ background: '#1e40af', color: '#fff', fontSize: '0.62rem', fontWeight: 700, padding: '2px 7px', borderRadius: 3, letterSpacing: '0.3px' }}>
                FIPS 140-3 LEVEL 4
              </span>
            </div>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-500)', lineHeight: 1.6, maxWidth: 560 }}>
              Current Enclave Block <strong style={{ color: 'var(--text-700)' }}>#14892</strong> signed with Ed25519 hardware key{' '}
              <code style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem', color: 'var(--primary)' }}>0x77e4...b991</code>.
              Every entry is chained to the preceding cryptographic hash. In the event of byte alteration, Merkle root
              recomputation mathematically invalidates subsequent blocks.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>
                Master Key Fingerprint
              </div>
              <code style={{ fontSize: '0.68rem', fontFamily: 'JetBrains Mono', color: 'var(--text-700)' }}>
                SHA256:4a99e1...99be
              </code>
            </div>
            <button className="btn btn-primary btn-sm" style={{ gap: 5 }}>
              🛡 Audit Certificate
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
