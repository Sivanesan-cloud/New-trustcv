import React, { useEffect, useState, useCallback, useRef } from 'react'
import api from '../api/axiosClient'

/* ─────────────────────────── SVG icon helper ───────────────────────────── */
const Ico = ({ path, size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
)
const ICONS = {
  server:   'M2 2h20v8H2z M2 14h20v8H2z M6 6h.01 M6 18h.01',
  db:       'M12 2C6.48 2 2 4.24 2 7s4.48 5 10 5 10-2.24 10-5-4.48-5-10-5zM2 17c0 2.76 4.48 5 10 5s10-2.24 10-5M2 12c0 2.76 4.48 5 10 5s10-2.24 10-5',
  refresh:  'M1 4v6h6 M23 20v-6h-6 M20.49 9A9 9 0 0 0 5.64 5.64L1 10 M3.51 15a9 9 0 0 0 14.85 3.36L23 14',
  copy:     'M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z',
  check:    'M20 6L9 17l-5-5',
  alert:    'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01',
  users:    'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  shield:   'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  zap:      'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  log:      'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  table:    'M3 3h18v18H3z M3 9h18 M3 15h18 M9 3v18 M15 3v18',
  wifi:     'M5 12.55a11 11 0 0 1 14.08 0 M1.42 9a16 16 0 0 1 21.16 0 M8.53 16.11a6 6 0 0 1 6.95 0 M12 20h.01',
  lock:     'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4',
  eye:      'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0',
}

/* ─────────────────────────── Utility helpers ───────────────────────────── */
function truncateHash(h, n = 12) {
  if (!h) return '—'
  return h.length > n * 2 + 3 ? `${h.slice(0, n)}...${h.slice(-6)}` : h
}

function fmtDate(str) {
  if (!str) return '—'
  try { return new Date(str).toLocaleString('en-IN', { hour12: false }) } catch { return str }
}

function StatusBadge({ status }) {
  const map = {
    APPROVED:  { bg: '#eff6ff', c: '#1e40af', b: '#bfdbfe', dot: '#2563eb' },
    VERIFIED:  { bg: '#ecfdf5', c: '#065f46', b: '#a7f3d0', dot: '#10b981' },
    PENDING:   { bg: '#fffbeb', c: '#92400e', b: '#fde68a', dot: '#f59e0b' },
    WARNING:   { bg: '#fffbeb', c: '#92400e', b: '#fde68a', dot: '#f59e0b' },
    BLOCKED:   { bg: '#fef2f2', c: '#991b1b', b: '#fecaca', dot: '#ef4444' },
    FAILED:    { bg: '#fef2f2', c: '#991b1b', b: '#fecaca', dot: '#ef4444' },
    ADMIN:     { bg: '#f3f4f6', c: '#1f2937', b: '#d1d5db', dot: '#6b7280' },
    OPERATOR:  { bg: '#eff6ff', c: '#1e40af', b: '#bfdbfe', dot: '#2563eb' },
    VIEWER:    { bg: '#f5f3ff', c: '#5b21b6', b: '#ddd6fe', dot: '#7c3aed' },
  }
  const s = map[status?.toUpperCase()] || { bg: '#f3f4f6', c: '#374151', b: '#d1d5db', dot: '#9ca3af' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: s.bg, color: s.c, border: `1px solid ${s.b}`,
      borderRadius: 4, fontSize: '0.68rem', fontWeight: 700, padding: '3px 8px', whiteSpace: 'nowrap'
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
      {status || '—'}
    </span>
  )
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <button onClick={copy} title="Copy" style={{
      background: 'none', border: 'none', cursor: 'pointer',
      color: copied ? '#10b981' : 'var(--text-400)', padding: '2px 4px',
      transition: 'color 0.2s'
    }}>
      <Ico path={copied ? ICONS.check : ICONS.copy} size={11} />
    </button>
  )
}

function HashCell({ value }) {
  if (!value) return <span style={{ color: 'var(--text-300)' }}>—</span>
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <code style={{
        fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace',
        color: 'var(--text-500)', background: 'var(--gray-bg)',
        padding: '2px 5px', borderRadius: 3,
      }}>
        {truncateHash(value, 8)}
      </code>
      <CopyBtn text={value} />
    </div>
  )
}

/* ─────────────────────── Stat card component ───────────────────────────── */
function StatCard({ icon, label, value, sub, color, pulse }) {
  return (
    <div className="section-card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
          {label}
        </span>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: `${color}18`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <Ico path={icon} size={13} color={color} />
        </div>
      </div>
      <div style={{ fontWeight: 800, fontSize: '1.65rem', color: 'var(--text-900)', letterSpacing: '-1px', lineHeight: 1 }}>
        {value ?? <span style={{ color: 'var(--text-300)' }}>—</span>}
      </div>
      {sub && <div style={{ fontSize: '0.68rem', color: 'var(--text-500)' }}>{sub}</div>}
      {pulse && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: color,
            display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite'
          }} />
          <span style={{ fontSize: '0.65rem', color, fontWeight: 600 }}>{pulse}</span>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────── Generic paginated table ───────────────────────── */
const PAGE_SIZE = 10

function DataTable({ columns, rows, loading, error }) {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')

  useEffect(() => setPage(0), [rows])

  const filtered = rows.filter(row =>
    !search || Object.values(row).some(v =>
      String(v ?? '').toLowerCase().includes(search.toLowerCase())
    )
  )
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const slice = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  if (loading) return (
    <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-400)' }}>
      <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>⏳</div>
      <div style={{ fontSize: '0.82rem' }}>Fetching data…</div>
    </div>
  )
  if (error) return (
    <div style={{ padding: '40px 0', textAlign: 'center', color: '#ef4444' }}>
      <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>⚠️</div>
      <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{error}</div>
    </div>
  )
  if (!rows.length) return (
    <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-300)' }}>
      <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>🗄️</div>
      <div style={{ fontSize: '0.82rem' }}>No records in this table</div>
    </div>
  )

  return (
    <div>
      {/* search */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="search-input-wrap" style={{ width: 240 }}>
          <span className="search-icon" style={{ fontSize: '0.75rem' }}>🔍</span>
          <input
            className="input-field"
            placeholder="Search rows…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            style={{ height: 30, padding: '5px 10px 5px 28px', fontSize: '0.78rem' }}
          />
        </div>
        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-400)' }}>
          {filtered.length} row{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table" style={{ minWidth: 600 }}>
          <thead>
            <tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr>
          </thead>
          <tbody>
            {slice.map((row, i) => (
              <tr key={i}>
                {columns.map(c => (
                  <td key={c.key} style={{ maxWidth: c.maxW || 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.render ? c.render(row[c.key], row) : (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-700)' }}>
                        {row[c.key] != null ? String(row[c.key]) : <span style={{ color: 'var(--text-300)' }}>—</span>}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      {pages > 1 && (
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--card-border)', background: 'var(--gray-bg)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => setPage(0)} disabled={page === 0}
            style={{ fontSize: '0.72rem', padding: '4px 8px', border: '1px solid var(--card-border)', borderRadius: 4, background: 'none', cursor: page === 0 ? 'default' : 'pointer', color: page === 0 ? 'var(--text-300)' : 'var(--text-700)' }}>«</button>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            style={{ fontSize: '0.72rem', padding: '4px 8px', border: '1px solid var(--card-border)', borderRadius: 4, background: 'none', cursor: page === 0 ? 'default' : 'pointer', color: page === 0 ? 'var(--text-300)' : 'var(--text-700)' }}>‹</button>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-500)', margin: '0 4px' }}>
            Page {page + 1} / {pages}
          </span>
          <button onClick={() => setPage(p => Math.min(pages - 1, p + 1))} disabled={page === pages - 1}
            style={{ fontSize: '0.72rem', padding: '4px 8px', border: '1px solid var(--card-border)', borderRadius: 4, background: 'none', cursor: page === pages - 1 ? 'default' : 'pointer', color: page === pages - 1 ? 'var(--text-300)' : 'var(--text-700)' }}>›</button>
          <button onClick={() => setPage(pages - 1)} disabled={page === pages - 1}
            style={{ fontSize: '0.72rem', padding: '4px 8px', border: '1px solid var(--card-border)', borderRadius: 4, background: 'none', cursor: page === pages - 1 ? 'default' : 'pointer', color: page === pages - 1 ? 'var(--text-300)' : 'var(--text-700)' }}>»</button>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────── Table column definitions ───────────────────────── */
const TABLE_CONFIGS = {
  users: {
    label: 'Users',
    icon: ICONS.users,
    color: '#7c3aed',
    endpoint: '/users',
    transform: d => d.users || [],
    columns: [
      { key: 'id',         label: 'ID',         maxW: 50 },
      { key: 'username',   label: 'Username',   render: v => <strong style={{ fontSize: '0.8rem' }}>{v}</strong> },
      { key: 'role',       label: 'Role',       render: v => <StatusBadge status={v} /> },
      { key: 'created_at', label: 'Created At', render: v => <span style={{ fontSize: '0.72rem', color: 'var(--text-500)', fontFamily: 'JetBrains Mono' }}>{fmtDate(v)}</span> },
    ],
    authRequired: true,
  },
  models: {
    label: 'Models',
    icon: ICONS.shield,
    color: '#2563eb',
    endpoint: '/model/registry',
    transform: d => d.models || [],
    columns: [
      { key: 'id',         label: 'ID',        maxW: 50 },
      { key: 'name',       label: 'Name',      render: v => <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{v}</span> },
      { key: 'version',    label: 'Version',   render: v => <code style={{ fontSize: '0.7rem', fontFamily: 'JetBrains Mono', background: 'var(--primary-muted)', color: 'var(--primary)', padding: '2px 6px', borderRadius: 3 }}>{v}</code> },
      { key: 'framework',  label: 'Framework', render: v => <span style={{ fontSize: '0.75rem', color: 'var(--text-600)' }}>{v || '—'}</span> },
      { key: 'sha256',     label: 'SHA-256',   render: v => <HashCell value={v} /> },
      { key: 'status',     label: 'Status',    render: v => <StatusBadge status={v} /> },
      { key: 'created_by', label: 'Created By',render: v => <span style={{ fontSize: '0.72rem', color: 'var(--text-500)' }}>{v || '—'}</span> },
      { key: 'created_at', label: 'Date',      render: v => <span style={{ fontSize: '0.68rem', color: 'var(--text-400)', fontFamily: 'JetBrains Mono' }}>{fmtDate(v)}</span> },
    ],
  },
  dataset_versions: {
    label: 'Datasets',
    icon: ICONS.db,
    color: '#0891b2',
    endpoint: '/dataset/versions',
    transform: d => d.datasets || [],
    columns: [
      { key: 'id',            label: 'ID',       maxW: 50 },
      { key: 'dataset_name',  label: 'Name',     render: v => <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{v}</span> },
      { key: 'version',       label: 'Version',  render: v => <code style={{ fontSize: '0.7rem', fontFamily: 'JetBrains Mono', background: 'var(--primary-muted)', color: 'var(--primary)', padding: '2px 6px', borderRadius: 3 }}>{v}</code> },
      { key: 'total_files',   label: 'Files',    render: v => <span style={{ fontWeight: 700, color: 'var(--text-900)' }}>{v?.toLocaleString() ?? '—'}</span> },
      { key: 'manifest_hash', label: 'Manifest Hash', render: v => <HashCell value={v} /> },
      { key: 'status',        label: 'Status',   render: v => <StatusBadge status={v} /> },
      { key: 'created_by',    label: 'Created By',render: v => <span style={{ fontSize: '0.72rem', color: 'var(--text-500)' }}>{v || '—'}</span> },
      { key: 'created_at',    label: 'Date',     render: v => <span style={{ fontSize: '0.68rem', color: 'var(--text-400)', fontFamily: 'JetBrains Mono' }}>{fmtDate(v)}</span> },
    ],
  },
  inference_runs: {
    label: 'Inference Runs',
    icon: ICONS.zap,
    color: '#f59e0b',
    endpoint: '/inference/logs',
    transform: d => d.inferences || [],
    columns: [
      { key: 'id',           label: 'ID',         maxW: 50 },
      { key: 'inference_id', label: 'Run ID',     render: v => <HashCell value={v} /> },
      { key: 'input_image',  label: 'Image',      render: v => <code style={{ fontSize: '0.65rem', fontFamily: 'JetBrains Mono', color: 'var(--text-600)' }}>{v ? v.split(/[\\/]/).pop() : '—'}</code> },
      { key: 'input_hash',   label: 'Input Hash', render: v => <HashCell value={v} /> },
      { key: 'model_hash',   label: 'Model Hash', render: v => <HashCell value={v} /> },
      { key: 'output_hash',  label: 'Output Hash',render: v => <HashCell value={v} /> },
      { key: 'user',         label: 'Run By',     render: v => <span style={{ fontWeight: 600, fontSize: '0.78rem' }}>{v || '—'}</span> },
      { key: 'timestamp',    label: 'Date',       render: v => <span style={{ fontSize: '0.68rem', color: 'var(--text-400)', fontFamily: 'JetBrains Mono' }}>{fmtDate(v)}</span> },
    ],
  },
  audit_logs: {
    label: 'Audit Logs',
    icon: ICONS.log,
    color: '#10b981',
    endpoint: '/audit/logs',
    transform: d => d.audit_logs || [],
    columns: [
      { key: 'id',         label: 'ID',        maxW: 50 },
      { key: 'username',   label: 'User',      render: v => <span style={{ fontWeight: 600, fontSize: '0.78rem' }}>{v || 'system'}</span> },
      { key: 'action',     label: 'Action',    render: v => {
        const isAlert = /fail|block/i.test(v || '')
        return (
          <span style={{
            fontSize: '0.72rem', fontWeight: 700, padding: '2px 7px', borderRadius: 4,
            background: isAlert ? '#fef2f2' : '#f0fdf4',
            color: isAlert ? '#991b1b' : '#065f46',
            border: `1px solid ${isAlert ? '#fecaca' : '#a7f3d0'}`
          }}>{v}</span>
        )
      }},
      { key: 'asset_type', label: 'Asset Type',render: v => <span style={{ fontSize: '0.72rem', color: 'var(--text-600)' }}>{v || '—'}</span> },
      { key: 'asset_id',   label: 'Asset ID',  render: v => <code style={{ fontSize: '0.65rem', fontFamily: 'JetBrains Mono', color: 'var(--text-500)', background: 'var(--gray-bg)', padding: '2px 5px', borderRadius: 3 }}>{v || '—'}</code> },
      { key: 'entry_hash', label: 'Entry Hash',render: v => <HashCell value={v} /> },
      { key: 'timestamp',  label: 'Date',      render: v => <span style={{ fontSize: '0.68rem', color: 'var(--text-400)', fontFamily: 'JetBrains Mono' }}>{fmtDate(v)}</span> },
    ],
  },
}

const TAB_ORDER = ['users', 'models', 'dataset_versions', 'inference_runs', 'audit_logs']

/* ─────────────────────────── Main Page ─────────────────────────────────── */
export default function SystemStatus() {
  /* ── Backend health ── */
  const [backendStatus, setBackendStatus] = useState(null) // null=checking, true=up, false=down
  const [backendMs, setBackendMs] = useState(null)
  const [backendLastChecked, setBackendLastChecked] = useState(null)
  const [backendMsg, setBackendMsg] = useState('')
  const [upSince, setUpSince] = useState(null)
  const pingInterval = useRef(null)

  /* ── DB stats ── */
  const [dbStats, setDbStats] = useState(null)
  const [summary, setSummary] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)

  /* ── Table browser ── */
  const [activeTab, setActiveTab] = useState('models')
  const [tableData, setTableData] = useState({})  // { [tabKey]: { rows, loading, error } }
  const [autoRefresh, setAutoRefresh] = useState(false)
  const refreshInterval = useRef(null)

  /* ── Ping backend ── */
  const pingBackend = useCallback(async () => {
    const t0 = performance.now()
    try {
      const res = await api.get('/')
      const ms = Math.round(performance.now() - t0)
      setBackendStatus(true)
      setBackendMs(ms)
      setBackendMsg(res.data?.message || 'OK')
      setBackendLastChecked(new Date())
      setUpSince(s => s || new Date())
    } catch {
      try {
        // Fallback fetch
        const res2 = await fetch('http://localhost:8000/', { signal: AbortSignal.timeout(3000) })
        const ms = Math.round(performance.now() - t0)
        const json = await res2.json()
        setBackendStatus(true)
        setBackendMs(ms)
        setBackendMsg(json?.message || 'OK')
        setBackendLastChecked(new Date())
        setUpSince(s => s || new Date())
      } catch {
        setBackendStatus(false)
        setBackendMs(null)
        setBackendLastChecked(new Date())
        setUpSince(null)
      }
    }
  }, [])

  /* ── Fetch DB stats ── */
  const fetchDbStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const [statsRes, sumRes] = await Promise.all([
        api.get('/db/stats').catch(() => null),
        api.get('/dashboard/summary').catch(() => null),
      ])
      if (statsRes) setDbStats(statsRes.data?.db_stats ?? null)
      if (sumRes) setSummary(sumRes.data ?? null)
    } catch {
      // silently fail — stats shown as null
    } finally {
      setStatsLoading(false)
    }
  }, [])

  /* ── Fetch a single table ── */
  const fetchTable = useCallback(async (key) => {
    const cfg = TABLE_CONFIGS[key]
    setTableData(prev => ({ ...prev, [key]: { rows: prev[key]?.rows || [], loading: true, error: null } }))
    try {
      const res = await api.get(cfg.endpoint)
      const rows = cfg.transform(res.data)
      setTableData(prev => ({ ...prev, [key]: { rows, loading: false, error: null } }))
    } catch (e) {
      const is403 = e?.response?.status === 403 || e?.response?.status === 401
      setTableData(prev => ({
        ...prev,
        [key]: { rows: [], loading: false, error: is403 ? '🔒 Access denied — Admin role required' : 'Failed to load data from backend' }
      }))
    }
  }, [])

  /* ── Init ── */
  useEffect(() => {
    pingBackend()
    fetchDbStats()
    fetchTable(activeTab)
    pingInterval.current = setInterval(pingBackend, 10_000)
    return () => clearInterval(pingInterval.current)
  }, []) // eslint-disable-line

  /* ── Tab change: lazy-load ── */
  useEffect(() => {
    if (!tableData[activeTab]?.rows?.length && !tableData[activeTab]?.loading) {
      fetchTable(activeTab)
    }
  }, [activeTab]) // eslint-disable-line

  /* ── Auto-refresh table ── */
  useEffect(() => {
    clearInterval(refreshInterval.current)
    if (autoRefresh) {
      refreshInterval.current = setInterval(() => fetchTable(activeTab), 30_000)
    }
    return () => clearInterval(refreshInterval.current)
  }, [autoRefresh, activeTab]) // eslint-disable-line

  /* ── Derived values ── */
  const stats = dbStats || {}
  const chain = summary?.chain_tip || {}

  const uptime = upSince
    ? (() => {
        const sec = Math.floor((Date.now() - upSince) / 1000)
        const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60
        return `${h}h ${m}m ${s}s`
      })()
    : null

  return (
    <div className="fade-in" style={{ paddingBottom: 40 }}>

      {/* ── PAGE HEADER ── */}
      <div className="page-header" style={{ padding: '20px 28px 14px' }}>
        <div className="page-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <h1 style={{ margin: 0, fontSize: '1.6rem', letterSpacing: '-0.3px' }}>System Status</h1>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: backendStatus === true ? '#ecfdf5' : backendStatus === false ? '#fef2f2' : '#f9fafb',
              border: `1px solid ${backendStatus === true ? '#a7f3d0' : backendStatus === false ? '#fecaca' : '#d1d5db'}`,
              color: backendStatus === true ? '#065f46' : backendStatus === false ? '#991b1b' : '#6b7280',
              borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px'
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: backendStatus === true ? '#10b981' : backendStatus === false ? '#ef4444' : '#9ca3af',
                display: 'inline-block',
                animation: backendStatus === true ? 'pulse-dot 2s ease-in-out infinite' : 'none'
              }} />
              {backendStatus === null ? 'CHECKING…' : backendStatus ? 'BACKEND ONLINE' : 'BACKEND OFFLINE'}
            </span>
          </div>
          <p style={{ color: 'var(--text-500)', fontSize: '0.84rem', margin: 0 }}>
            Live backend health · SQLite database browser · Auto-refreshes every 10s
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={() => { pingBackend(); fetchDbStats(); fetchTable(activeTab) }}>
            <Ico path={ICONS.refresh} size={13} />
            Refresh All
          </button>
        </div>
      </div>

      <div className="page-wrap" style={{ paddingTop: 0 }}>

        {/* ── SECTION A: BACKEND STATUS ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
            Backend Server
          </div>

          <div style={{
            background: backendStatus === true
              ? 'linear-gradient(135deg, #022c22 0%, #064e3b 100%)'
              : backendStatus === false
              ? 'linear-gradient(135deg, #1f1315 0%, #450a0a 100%)'
              : 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
            borderRadius: 12, padding: '18px 22px',
            border: `1px solid ${backendStatus === true ? 'rgba(16,185,129,0.25)' : backendStatus === false ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.08)'}`,
            boxShadow: `0 4px 24px ${backendStatus === true ? 'rgba(16,185,129,0.12)' : backendStatus === false ? 'rgba(239,68,68,0.12)' : 'rgba(0,0,0,0.18)'}`,
            display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap'
          }}>
            {/* Status icon */}
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: backendStatus === true ? 'rgba(16,185,129,0.15)' : backendStatus === false ? 'rgba(239,68,68,0.15)' : 'rgba(156,163,175,0.15)',
              border: `1px solid ${backendStatus === true ? 'rgba(16,185,129,0.3)' : backendStatus === false ? 'rgba(239,68,68,0.3)' : 'rgba(156,163,175,0.3)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem'
            }}>
              {backendStatus === null ? '🔄' : backendStatus ? '✅' : '❌'}
            </div>

            {/* Status details */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{
                fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3,
                color: backendStatus === true ? '#10b981' : backendStatus === false ? '#ef4444' : '#9ca3af'
              }}>
                {backendStatus === null ? 'Checking Connection…' : backendStatus ? 'FastAPI Backend Online' : 'Backend Unreachable'}
              </div>
              <div style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.75)' }}>
                {backendStatus ? (
                  <><strong style={{ color: '#fff' }}>TRUSTCV API</strong> · {backendMsg}</>
                ) : (
                  'Cannot reach http://localhost:8000 — ensure the backend is running'
                )}
              </div>
            </div>

            {/* Metrics */}
            <div style={{ display: 'flex', gap: 28, flexShrink: 0, flexWrap: 'wrap' }}>
              {[
                { label: 'Response Time', value: backendMs != null ? `${backendMs} ms` : '—', color: backendMs < 50 ? '#10b981' : backendMs < 200 ? '#f59e0b' : '#ef4444' },
                { label: 'Ping Interval', value: '10s', color: '#7dd3fc' },
                { label: 'Session Uptime', value: uptime || '—', color: '#a78bfa' },
                { label: 'Last Checked', value: backendLastChecked ? backendLastChecked.toLocaleTimeString('en-US', { hour12: false }) : '—', color: 'rgba(255,255,255,0.4)' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color, fontFamily: 'JetBrains Mono, monospace' }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Endpoint pill */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <code style={{ fontSize: '0.72rem', color: '#7dd3fc', fontFamily: 'JetBrains Mono', background: 'rgba(255,255,255,0.06)', padding: '5px 10px', borderRadius: 6 }}>
                http://localhost:8000
              </code>
            </div>
          </div>
        </div>

        {/* ── SECTION B: DATABASE STATS ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
            Database Overview · <code style={{ fontFamily: 'JetBrains Mono', fontWeight: 400, fontSize: '0.68rem', color: 'var(--text-500)' }}>trustcv.db · SQLite</code>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            <StatCard icon={ICONS.users}  label="Users"          value={statsLoading ? '…' : stats.users ?? '—'}             sub="Registered accounts"    color="#7c3aed" />
            <StatCard icon={ICONS.shield} label="Models"         value={statsLoading ? '…' : stats.models ?? '—'}            sub="In registry"            color="#2563eb" />
            <StatCard icon={ICONS.db}     label="Datasets"       value={statsLoading ? '…' : stats.dataset_versions ?? '—'}  sub="Version snapshots"      color="#0891b2" />
            <StatCard icon={ICONS.zap}    label="Inference Runs" value={statsLoading ? '…' : stats.inference_runs ?? '—'}    sub="Total executions"       color="#f59e0b" />
            <StatCard icon={ICONS.log}    label="Audit Logs"     value={statsLoading ? '…' : stats.audit_logs ?? '—'}        sub="Merkle-chained entries" color="#10b981" pulse={stats.audit_logs ? 'Live chain' : null} />
          </div>

          {/* DB file + chain tip row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
            {/* DB File */}
            <div className="section-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#f5f3ff', border: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                🗄️
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 3 }}>Database File</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-900)' }}>
                  {statsLoading ? '…' : stats.db_size_mb != null ? `${stats.db_size_mb} MB` : '—'}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-400)', fontFamily: 'JetBrains Mono', marginTop: 2 }}>
                  trustcv.db · SQLite3
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-400)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 3 }}>DB Path</div>
                <code style={{ fontSize: '0.6rem', color: 'var(--primary)', fontFamily: 'JetBrains Mono', wordBreak: 'break-all' }}>
                  database/trustcv.db
                </code>
              </div>
            </div>

            {/* Chain tip */}
            <div className="section-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                ⛓️
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 3 }}>Audit Chain Tip</div>
                <code style={{ fontSize: '0.82rem', fontFamily: 'JetBrains Mono', color: '#065f46', fontWeight: 700 }}>
                  {statsLoading ? '…' : chain.hash || '—'}
                </code>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-400)', marginTop: 3 }}>
                  {chain.timestamp ? `Last entry: ${fmtDate(chain.timestamp)}` : 'No audit entries yet'}
                </div>
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4, background: '#ecfdf5',
                border: '1px solid #a7f3d0', color: '#065f46', borderRadius: 6, fontSize: '0.68rem',
                fontWeight: 700, padding: '4px 10px', flexShrink: 0
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite' }} />
                MERKLE
              </span>
            </div>
          </div>
        </div>

        {/* ── SECTION C: LIVE TABLE BROWSER ── */}
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
            Live Table Browser
          </div>

          <div className="section-card" style={{ padding: 0, overflow: 'hidden' }}>

            {/* Tab bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 0,
              borderBottom: '1px solid var(--card-border)',
              background: 'var(--gray-bg)', overflowX: 'auto'
            }}>
              {TAB_ORDER.map(key => {
                const cfg = TABLE_CONFIGS[key]
                const active = activeTab === key
                const count = tableData[key]?.rows?.length
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                      padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer',
                      borderBottom: active ? `2.5px solid ${cfg.color}` : '2.5px solid transparent',
                      color: active ? cfg.color : 'var(--text-500)',
                      fontWeight: active ? 700 : 500, fontSize: '0.8rem', transition: 'all 0.15s'
                    }}
                  >
                    <Ico path={cfg.icon} size={12} color={active ? cfg.color : 'var(--text-400)'} />
                    {cfg.label}
                    {count != null && (
                      <span style={{
                        background: active ? `${cfg.color}20` : 'var(--card-border)',
                        color: active ? cfg.color : 'var(--text-400)',
                        borderRadius: 999, fontSize: '0.6rem', fontWeight: 700,
                        padding: '1px 6px', minWidth: 18, textAlign: 'center'
                      }}>
                        {count}
                      </span>
                    )}
                    {cfg.authRequired && (
                      <Ico path={ICONS.lock} size={10} color={active ? cfg.color : 'var(--text-300)'} />
                    )}
                  </button>
                )
              })}

              {/* Right controls */}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', flexShrink: 0 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontSize: '0.72rem', color: 'var(--text-500)', fontWeight: 500 }}>
                  <div
                    onClick={() => setAutoRefresh(v => !v)}
                    style={{
                      width: 30, height: 16, borderRadius: 8, cursor: 'pointer',
                      background: autoRefresh ? '#10b981' : '#d1d5db',
                      position: 'relative', transition: 'background 0.2s', flexShrink: 0
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 2, left: autoRefresh ? 16 : 2,
                      width: 12, height: 12, borderRadius: '50%', background: '#fff',
                      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }} />
                  </div>
                  Auto-refresh 30s
                </label>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => fetchTable(activeTab)}
                  style={{ height: 28, fontSize: '0.7rem' }}
                >
                  <Ico path={ICONS.refresh} size={11} /> Reload
                </button>
              </div>
            </div>

            {/* Table content */}
            <DataTable
              columns={TABLE_CONFIGS[activeTab].columns}
              rows={tableData[activeTab]?.rows || []}
              loading={tableData[activeTab]?.loading ?? true}
              error={tableData[activeTab]?.error ?? null}
            />
          </div>
        </div>

      </div>
    </div>
  )
}
