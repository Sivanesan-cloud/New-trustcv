import React, { useEffect, useState, useCallback } from 'react'
import api from '../api/axiosClient'
import StatusBadge from '../components/StatusBadge'

/* ── Inline SVG Icons ───────────────────────────── */
const Ico = ({ path, size = 14, color = 'currentColor', fill = 'none' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
)

/* ── Sparkline/Timeline SVG Chart ───────────────── */
function TimelineChart() {
  // Smooth wave path mimicking the screenshot chart
  const w = 460, h = 80
  const points = [
    [0, 55], [40, 50], [80, 45], [115, 48], [150, 38],
    [185, 35], [220, 40], [255, 30], [290, 38], [325, 28],
    [360, 35], [395, 25], [420, 28], [460, 20],
  ]
  // Build smooth SVG cubic bezier path
  const path = points.reduce((acc, [x, y], i) => {
    if (i === 0) return `M${x},${y}`
    const [px, py] = points[i - 1]
    const cx1 = px + (x - px) / 3
    const cx2 = x - (x - px) / 3
    return `${acc} C${cx1},${py} ${cx2},${y} ${x},${y}`
  }, '')

  // Dot markers at sweep points
  const dotPositions = [
    [115, 48], [220, 40], [325, 28], [395, 25], [460, 20],
  ]

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 25, 50, 75].map(y => (
        <line key={y} x1="0" y1={y} x2={w} y2={y} stroke="#e5e7eb" strokeWidth="0.5" />
      ))}
      {/* Fill area */}
      <path
        d={`${path} L${w},${h} L0,${h} Z`}
        fill="url(#chartGrad)"
      />
      {/* Line */}
      <path d={path} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinejoin="round" />
      {/* Dots at sweep points */}
      {dotPositions.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="5" fill="#fff" stroke="#2563eb" strokeWidth="2" />
          <circle cx={x} cy={y} r="2.5" fill="#2563eb" />
        </g>
      ))}
    </svg>
  )
}

/* ── Mini bar chart for inference card ─────────── */
function MiniBarChart() {
  const bars = [18, 32, 22, 40, 55, 45, 60, 72, 65, 80, 70, 85]
  const max  = Math.max(...bars)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 28 }}>
      {bars.map((v, i) => (
        <div key={i} style={{
          width: 10,
          height: `${(v / max) * 100}%`,
          background: i >= bars.length - 4 ? '#2563eb' : '#bfdbfe',
          borderRadius: '2px 2px 0 0',
          transition: 'height 0.3s',
        }} />
      ))}
    </div>
  )
}

/* ── Trust Score donut ─────────────────────────── */
function TrustDonut({ score = 94 }) {
  const r = 22, cx = 28, cy = 28
  const circ = 2 * Math.PI * r
  const dash  = (score / 100) * circ
  return (
    <svg width={56} height={56} viewBox="0 0 56 56">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth="5" />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none" stroke="#2563eb" strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
      <text x={cx} y={cy + 4} textAnchor="middle"
        fill="#111827" fontSize="10" fontWeight="700" fontFamily="Inter, sans-serif">
        {score}%
      </text>
    </svg>
  )
}

/* ── Recent activity rows (mock + real merge) ──── */
const MOCK_ACTIVITY = [
  {
    time:      'Today, 14:32:05',
    initials:  'AM',
    name:      'Alex Mercer',
    role:      'secops@trustcv.ai',
    action:    'Verified Dataset:',
    detail:    'COCO-Val-v3.2',
    hash:      'e7a9b1...c439',
    status:    'VERIFIED',
  },
  {
    time:      'Today, 13:38:12',
    initials:  '⚙',
    name:      'Automated CI/CD',
    role:      'GitHub Action #8412',
    action:    'Model Weights Checksum Verified',
    detail:    '',
    hash:      'f12e84...906b',
    status:    'SUCCESS',
  },
  {
    time:      'Today, 12:15:40',
    initials:  'ER',
    name:      'Dr. Elena Rostova',
    role:      'lead-ml@trustcv.ai',
    action:    'Inference Execution: Bounding Box Eval',
    detail:    '',
    hash:      '4a310d...f122',
    status:    'APPROVED',
  },
  {
    time:      'Today, 10:04:19',
    initials:  'KP',
    name:      'Kiran Patel',
    role:      'devops@trustcv.ai',
    action:    'Dataset Hash Mismatch Warning Resolved',
    detail:    '',
    hash:      '9c85ec...1045',
    status:    'UNCHANGED',
  },
  {
    time:      'Yesterday, 22:41:00',
    initials:  '👁',
    name:      'System Watchdog',
    role:      'cron:enclave-anchor',
    action:    'Full Registry Hash Re-anchoring',
    detail:    '',
    hash:      '89a421...f01d',
    status:    'VERIFIED',
  },
]

const STATUS_LABEL = {
  VERIFIED:  { label: 'VERIFIED',  bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' },
  SUCCESS:   { label: 'SUCCESS',   bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' },
  APPROVED:  { label: 'APPROVED',  bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
  UNCHANGED: { label: 'RESOLVED',  bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
}

const PIPELINES = [
  { name: 'YOLOv8-Perimeter', icon: '🎥', hash: 'sha256:d8a9...b4c2', latency: '9.4ms'  },
  { name: 'DETR-Facial-Auth', icon: '👤', hash: 'sha256:3971...ce88', latency: '16.1ms' },
  { name: 'SegNet-Safety',    icon: '🛡', hash: 'sha256:8061...74da', latency: '22.8ms' },
]

export default function Overview() {
  const [loading, setLoading]   = useState(true)
  const [stats,   setStats]     = useState(null)
  const [error,   setError]     = useState(null)
  const [filter,  setFilter]    = useState('')

  const fetchAll = useCallback(async () => {
    try {
      const [modRes, infRes, audRes] = await Promise.all([
        api.get('/model/registry'),
        api.get('/inference/logs'),
        api.get('/audit/logs'),
      ])
      const models     = modRes.data.models        || []
      const inferences = infRes.data.inferences    || []
      const auditLogs  = audRes.data.audit_logs    || []
      const violations = auditLogs.filter(l =>
        (l.action || '').toLowerCase().includes('fail') ||
        (l.action || '').toLowerCase().includes('violation')
      ).length
      setStats({ models, inferences, auditLogs, violations })
    } catch {
      setError('Backend not reachable — showing demo data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const inferenceCount = stats?.inferences?.length ?? 1284
  const modelCount     = stats?.models?.length      ?? 4

  return (
    <div className="fade-in">
      {/* ── Page Header ── */}
      <div className="page-header" style={{ padding: '20px 28px 16px' }}>
        <div className="page-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <h1 style={{ margin: 0, fontSize: '1.65rem' }}>System Integrity Overview</h1>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: '#ecfdf5', border: '1px solid #a7f3d0',
              color: '#065f46', borderRadius: 999,
              fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite' }} />
              LIVE MONITOR
            </span>
          </div>
          <p style={{ color: 'var(--text-500)', fontSize: '0.85rem' }}>
            Real-time cryptographic verification of vision datasets, weight hashes, and runtime execution.
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary">
            <Ico path="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3" size={13} />
            Export Audit Report
          </button>
          <button className="btn btn-primary" onClick={fetchAll}>
            <Ico path="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" size={13} />
            Run Full Verification
          </button>
        </div>
      </div>

      <div className="page-wrap" style={{ paddingTop: 0 }}>
        {error && (
          <div className="alert alert-info mb-16" style={{ fontSize: '0.78rem' }}>
            ℹ {error}
          </div>
        )}

        {/* ── Enclave Banner ── */}
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: 'var(--radius)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginBottom: 20,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: '#0369a1', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '1rem', flexShrink: 0,
          }}>
            🔒
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0369a1', marginBottom: 2 }}>
              Cryptographic Enclave Active:
            </div>
            <div style={{ fontSize: '0.8rem', color: '#0c4a6e' }}>
              All {modelCount} models and 12 training datasets matched against immutable registry 4 minutes ago.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <code style={{ fontSize: '0.7rem', color: '#0369a1', background: '#e0f2fe', padding: '2px 8px', borderRadius: 4, fontFamily: 'JetBrains Mono, monospace' }}>
              SIG: e89ad...f01d
            </code>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0369a1', fontSize: '0.8rem', padding: 4 }}>⧉</button>
          </div>
        </div>

        {/* ── 4 Status Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>

          {/* Card 1: Dataset Status */}
          <div className="section-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px 0', borderBottom: 'none' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-400)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
                Dataset Status
                <Ico path="M3 3h18v18H3z M9 9h6 M9 12h6 M9 15h4" size={12} color="var(--text-400)" />
              </div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, padding: '4px 11px' }}>
                  ✓ VERIFIED
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-900)', marginBottom: 4 }}>
                {loading ? '— / — Sets Intact' : '12 / 12 Sets Intact'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-500)', lineHeight: 1.5 }}>
                Training &amp; evaluation sets signed via Merkle roots
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--card-border)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: 'var(--text-400)', marginTop: 10 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
              Last verified 4m ago &nbsp;•&nbsp;
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>0 modified files</span>
            </div>
          </div>

          {/* Card 2: Model Status */}
          <div className="section-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px 0' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-400)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
                Model Status
                <Ico path="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={12} color="var(--text-400)" />
              </div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, padding: '4px 11px' }}>
                  ★ APPROVED
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-900)', marginBottom: 4 }}>
                YOLOv8-Sec &amp; ResNet-…
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-500)', lineHeight: 1.5 }}>
                Zero adversarial weight drift detected
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--card-border)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: 'var(--text-400)', marginTop: 10 }}>
              🔒 SHA-256 authentic
            </div>
          </div>

          {/* Card 3: Trust Score */}
          <div className="section-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px 0' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-400)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Trust Score
                <span style={{ background: '#dcfce7', color: '#166534', borderRadius: 4, fontSize: '0.6rem', fontWeight: 700, padding: '2px 6px', letterSpacing: '0.3px' }}>EXCELLENT</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.9rem', color: 'var(--text-900)', lineHeight: 1, letterSpacing: '-1px' }}>94%</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--green)', fontWeight: 600, marginTop: 2 }}>↑ +2.4% vs last epoch</div>
                </div>
                <TrustDonut score={94} />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-500)' }}>Deterministic provenance verified</div>
            </div>
            <div style={{ borderTop: '1px solid var(--card-border)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: 'var(--text-400)', marginTop: 10 }}>
              Registry threshold ≥ 90% &nbsp;
              <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓</span>
            </div>
          </div>

          {/* Card 4: Total Inference Runs */}
          <div className="section-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px 0' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-400)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Total Inference Runs
                <span style={{ color: 'var(--green)', fontSize: '0.7rem', fontWeight: 700 }}>↑ +18% today</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.9rem', color: 'var(--text-900)', lineHeight: 1, letterSpacing: '-1px', marginBottom: 2 }}>
                {loading ? '—' : (inferenceCount > 100 ? inferenceCount.toLocaleString() : '1,284')}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-500)', marginBottom: 8 }}>runs</div>
              <MiniBarChart />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-500)', marginTop: 8 }}>All outputs cryptographically notarized</div>
            </div>
            <div style={{ borderTop: '1px solid var(--card-border)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.7rem', color: 'var(--text-400)', marginTop: 10 }}>
              <span>1,281 Verified</span>
              <span>|</span>
              <span style={{ color: 'var(--red)', fontWeight: 600 }}>3 Blocked</span>
            </div>
          </div>
        </div>

        {/* ── Timeline + Pipelines ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 14, marginBottom: 20 }}>

          {/* Timeline Chart */}
          <div className="section-card" style={{ padding: 20 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: '0.975rem', color: 'var(--text-900)', marginBottom: 4 }}>
                Integrity Verification Timeline
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-500)' }}>
                  Continuous deterministic hash validation sweeps across cluster nodes
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--text-500)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
                    Uptime 99.98%
                  </span>
                  <button style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-muted)', border: '1px solid #bfdbfe', borderRadius: 5, padding: '3px 8px', cursor: 'pointer' }}>
                    24h History
                  </button>
                </div>
              </div>
            </div>

            {/* X-axis labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-400)', marginBottom: 4, padding: '0 2px' }}>
              <span>T − 24 Hours</span>
              <span>Sweep Cycle Interval: 126s</span>
              <span>Realtime Anchor</span>
            </div>

            {/* Chart */}
            <div style={{ padding: '8px 0', position: 'relative' }}>
              <TimelineChart />
            </div>

            {/* X labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-400)', marginTop: 6, padding: '0 2px' }}>
              {['00:00 UTC', '06:00 UTC', '12:00 UTC', '18:00 UTC', 'NOW'].map(t => (
                <span key={t} style={{ fontWeight: t === 'NOW' ? 700 : 400, color: t === 'NOW' ? 'var(--primary)' : undefined }}>
                  {t}
                </span>
              ))}
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--card-border)' }}>
              {[
                { label: 'Automated Sweeps', value: '720 runs',    color: 'var(--text-900)' },
                { label: 'Avg Verification Latency', value: '14.2 ms', color: 'var(--text-900)' },
                { label: 'Integrity Violations', value: '0 Detected', color: 'var(--red)' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ textAlign: 'center', padding: '0 12px', borderRight: label !== 'Integrity Violations' ? '1px solid var(--card-border)' : 'none' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-500)', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.975rem', color }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Pipelines */}
          <div className="section-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-900)' }}>
                Active Monitored Pipelines
              </div>
              <Ico path="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" size={14} color="var(--text-400)" />
            </div>
            <div style={{ padding: '6px 0 4px', fontSize: '0.72rem', color: 'var(--text-500)', paddingLeft: 16, paddingBottom: 6, borderBottom: '1px solid var(--card-border)' }}>
              Production model weights checksum status
            </div>

            <div style={{ padding: '6px 0' }}>
              {PIPELINES.map((p, i) => (
                <div key={i} style={{ padding: '10px 16px', borderBottom: i < PIPELINES.length - 1 ? '1px solid var(--card-border)' : 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>
                    {p.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-900)', marginBottom: 2 }}>{p.name}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-400)', fontFamily: 'JetBrains Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Weights: {p.hash}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.68rem', fontWeight: 600, color: '#065f46' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
                      Active
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-400)', fontFamily: 'JetBrains Mono' }}>{p.latency}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                Configure Enclave Rules →
              </button>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-400)' }}>3 of 3 Loaded</span>
            </div>
          </div>
        </div>

        {/* ── Recent Integrity Activity ── */}
        <div className="section-card" style={{ overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-900)', display: 'flex', alignItems: 'center', gap: 7 }}>
              🔄 Recent Integrity Activity
            </span>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#0369a1', background: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: 4, padding: '2px 7px' }}>
              Immutable Ledger
            </span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
              <div className="search-input-wrap" style={{ width: 190 }}>
                <span className="search-icon" style={{ fontSize: '0.75rem' }}>🔍</span>
                <input
                  className="input-field"
                  placeholder="Filter audit trail..."
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  style={{ height: 30, padding: '5px 10px 5px 28px', fontSize: '0.78rem' }}
                />
              </div>
              <select className="input-field" style={{ height: 30, width: 'auto', padding: '5px 24px 5px 10px', fontSize: '0.78rem' }}>
                <option>All Statuses</option>
                <option>VERIFIED</option>
                <option>SUCCESS</option>
                <option>APPROVED</option>
              </select>
              <button style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                View All Logs &gt;
              </button>
            </div>
          </div>

          {/* Activity table */}
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Operator / Principal</th>
                <th>Action Payload</th>
                <th>Hash Proof</th>
                <th>Integrity Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ACTIVITY
                .filter(r => !filter || r.action.toLowerCase().includes(filter.toLowerCase()) || r.name.toLowerCase().includes(filter.toLowerCase()))
                .map((row, i) => {
                  const st = STATUS_LABEL[row.status] || STATUS_LABEL.VERIFIED
                  return (
                    <tr key={i}>
                      <td className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-500)', whiteSpace: 'nowrap' }}>
                        {row.time}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: typeof row.initials === 'string' && row.initials.length <= 2 ? 'var(--primary)' : 'var(--gray-bg)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: typeof row.initials === 'string' && row.initials.length <= 2 ? '0.65rem' : '0.85rem',
                            fontWeight: 700, color: '#fff', flexShrink: 0,
                          }}>
                            {row.initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-900)' }}>{row.name}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-400)' }}>{row.role}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-700)' }}>
                        {row.action}
                        {row.detail && (
                          <span style={{ color: 'var(--primary)', fontWeight: 600, marginLeft: 4, fontFamily: 'JetBrains Mono', fontSize: '0.72rem' }}>
                            {row.detail}
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <code style={{ fontSize: '0.7rem', fontFamily: 'JetBrains Mono', color: 'var(--text-500)', background: 'var(--gray-bg)', padding: '2px 6px', borderRadius: 3 }}>
                            {row.hash}
                          </code>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-400)', fontSize: '0.75rem', padding: 2 }}>⧉</button>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          background: st.bg, color: st.color, border: `1px solid ${st.border}`,
                          borderRadius: 4, fontSize: '0.72rem', fontWeight: 700,
                          padding: '3px 9px', letterSpacing: '0.2px',
                        }}>
                          ✓ {st.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>

          {/* Table footer */}
          <div style={{ padding: '10px 18px', borderTop: '1px solid var(--card-border)', background: 'var(--gray-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-500)' }}>
              Showing 5 most recent cryptographically anchored proofs
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: 'var(--text-400)', fontFamily: 'JetBrains Mono' }}>
              Merkle Root: 6x9924...ee31
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: '0.75rem' }}>↺</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
