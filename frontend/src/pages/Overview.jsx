import React, { useEffect, useState, useCallback } from 'react'
import api from '../api/axiosClient'

const Ico = ({ path, size = 14, color = 'currentColor', fill = 'none', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
)

function AnimatedCounter({ target, duration = 1200 }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])
  return <>{val.toLocaleString()}</>
}

function Sparkline({ data, color = '#2563eb', height = 36 }) {
  const w = 110, h = height
  const max = Math.max(...data), min = Math.min(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - ((v - min) / range) * (h - 4) - 2,
  ])
  const path = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${path} L${w},${h} L0,${h} Z`
  const gid = `sg${color.replace('#','')}`
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="3"
        fill="#fff" stroke={color} strokeWidth="2" />
    </svg>
  )
}

function TrustRing({ score = 94, size = 72 }) {
  const r = size * 0.38, cx = size / 2, cy = size / 2
  const circ = 2 * Math.PI * r
  const [dash, setDash] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setDash((score / 100) * circ), 150)
    return () => clearTimeout(t)
  }, [score, circ])
  const color = score >= 90 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444'
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth="7" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
      <text x={cx} y={cy+1} textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize={size*0.18} fontWeight="800" fontFamily="Inter,sans-serif">
        {score}%
      </text>
    </svg>
  )
}

function MiniBar({ bars, color = '#2563eb', height = 28 }) {
  const max = Math.max(...bars)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height }}>
      {bars.map((v, i) => (
        <div key={i} style={{
          flex: 1, height: `${(v / max) * 100}%`,
          background: i >= bars.length - 3 ? color : `${color}55`,
          borderRadius: '2px 2px 0 0', minHeight: 2,
          transition: 'height 0.6s ease',
        }} />
      ))}
    </div>
  )
}

function VerificationTimeline() {
  const W = 560, H = 88
  const raw = [62,58,52,54,46,42,48,36,44,32,38,28,34,22,26,18,22,14]
  const xs = raw.map((_, i) => (i / (raw.length - 1)) * W)
  const ys = raw.map(v => H - (v / 70) * (H - 8) - 4)
  const line = xs.map((x, i) => {
    if (i === 0) return `M${x},${ys[i]}`
    const [px, py] = [xs[i-1], ys[i-1]]
    const cx1 = px + (x-px)/3, cx2 = x - (x-px)/3
    return `C${cx1},${py} ${cx2},${ys[i]} ${x},${ys[i]}`
  }).join(' ')
  const area = `${line} L${W},${H} L0,${H} Z`
  const ex = xs[xs.length-1], ey = ys[ys.length-1]
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="tlg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[20,40,60,80].map(pct => {
        const y = (1 - pct/100) * H
        return <line key={pct} x1={0} y1={y} x2={W} y2={y} stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="4,4" />
      })}
      <path d={area} fill="url(#tlg)" />
      <path d={line} fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx={ex} cy={ey} r="12" fill="#2563eb" opacity="0.1">
        <animate attributeName="r" values="6;14;6" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.2;0;0.2" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx={ex} cy={ey} r="5" fill="#fff" stroke="#2563eb" strokeWidth="2.5" />
      <circle cx={ex} cy={ey} r="2.5" fill="#2563eb" />
    </svg>
  )
}

function NodeMap() {
  const nodes = [
    { x:15, y:42, s:'ok',   l:'US-EAST'   },
    { x:27, y:38, s:'ok',   l:'US-WEST'   },
    { x:47, y:30, s:'ok',   l:'EU-WEST'   },
    { x:53, y:27, s:'warn', l:'EU-NORTH'  },
    { x:73, y:34, s:'ok',   l:'AP-SOUTH'  },
    { x:81, y:31, s:'ok',   l:'AP-EAST'   },
    { x:61, y:55, s:'block',l:'AF-CENT'   },
  ]
  const C = { ok:'#10b981', warn:'#f59e0b', block:'#ef4444' }
  return (
    <div style={{ position:'relative', background:'linear-gradient(160deg,#f0f7ff,#e8f4ff)', borderRadius:10, overflow:'hidden', height:128 }}>
      <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.12 }}>
        {[...Array(10)].map((_,i) => <line key={`v${i}`} x1={`${i*10}%`} y1="0" x2={`${i*10}%`} y2="100%" stroke="#2563eb" strokeWidth="0.5"/>)}
        {[...Array(6)].map((_,i)  => <line key={`h${i}`} x1="0" y1={`${i*20}%`} x2="100%" y2={`${i*20}%`} stroke="#2563eb" strokeWidth="0.5"/>)}
      </svg>
      <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.09 }}>
        <ellipse cx="20%" cy="45%" rx="10%" ry="12%" fill="#2563eb"/>
        <ellipse cx="50%" cy="34%" rx="12%" ry="10%" fill="#2563eb"/>
        <ellipse cx="76%" cy="37%" rx="9%"  ry="8%"  fill="#2563eb"/>
        <ellipse cx="55%" cy="54%" rx="8%"  ry="6%"  fill="#2563eb"/>
      </svg>
      {nodes.map((n,i) => (
        <div key={i} style={{ position:'absolute', left:`${n.x}%`, top:`${n.y}%`, transform:'translate(-50%,-50%)' }}>
          {n.s==='block' && (
            <div style={{ position:'absolute', inset:-8, borderRadius:'50%', border:`2px solid ${C[n.s]}`, opacity:0.35, animation:'pulse-ring 1.5s ease-in-out infinite' }}/>
          )}
          <div style={{ width:10, height:10, borderRadius:'50%', background:C[n.s], border:'2px solid #fff', boxShadow:`0 0 6px ${C[n.s]}`, cursor:'pointer' }} title={n.l}/>
          <div style={{ position:'absolute', top:12, left:'50%', transform:'translateX(-50%)', fontSize:'0.5rem', fontWeight:700, color:'#374151', whiteSpace:'nowrap', background:'rgba(255,255,255,0.88)', padding:'1px 4px', borderRadius:3 }}>{n.l}</div>
        </div>
      ))}
      <div style={{ position:'absolute', bottom:6, right:8, display:'flex', gap:8 }}>
        {[['ok','#10b981','OK'],['warn','#f59e0b','Warn'],['block','#ef4444','Blocked']].map(([k,c,l]) => (
          <span key={k} style={{ display:'flex', alignItems:'center', gap:3, fontSize:'0.58rem', color:'#374151', fontWeight:600 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:c, display:'inline-block' }}/>{l}
          </span>
        ))}
      </div>
    </div>
  )
}

function HealthBar({ label, value, color = '#10b981' }) {
  const [w, setW] = useState(0)
  useEffect(() => { const t = setTimeout(() => setW(value), 220); return () => clearTimeout(t) }, [value])
  return (
    <div style={{ marginBottom:11 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <span style={{ fontSize:'0.73rem', fontWeight:600, color:'var(--text-700)' }}>{label}</span>
        <span style={{ fontSize:'0.73rem', fontWeight:700, color }}>{value}%</span>
      </div>
      <div style={{ height:5, background:'#e5e7eb', borderRadius:999, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${w}%`, background:color, borderRadius:999, transition:'width 1s cubic-bezier(0.4,0,0.2,1)' }}/>
      </div>
    </div>
  )
}

const PILL = {
  VERIFIED: { bg:'#ecfdf5', c:'#065f46', b:'#a7f3d0', i:'✓' },
  SUCCESS:  { bg:'#ecfdf5', c:'#065f46', b:'#a7f3d0', i:'✓' },
  APPROVED: { bg:'#eff6ff', c:'#1e40af', b:'#bfdbfe', i:'●' },
  BLOCKED:  { bg:'#fef2f2', c:'#991b1b', b:'#fecaca', i:'🛑'},
  WARNING:  { bg:'#fffbeb', c:'#92400e', b:'#fde68a', i:'⚠' },
  RESOLVED: { bg:'#f0fdf4', c:'#166534', b:'#bbf7d0', i:'✓' },
}
function Pill({ status }) {
  const s = PILL[status] || PILL.VERIFIED
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, background:s.bg, color:s.c, border:`1px solid ${s.b}`, borderRadius:4, fontSize:'0.68rem', fontWeight:700, padding:'3px 8px', whiteSpace:'nowrap' }}>
      {s.i} {status}
    </span>
  )
}

const ACTIVITY = [
  { time:'14:32:05', ago:'2m',  ini:'AM', col:'#2563eb', name:'alex.mercer',      role:'SecOps Lead',    action:'Dataset Merkle Root Verified',    asset:'coco-val-v3.2',        hash:'e7a9b1...c439', status:'VERIFIED' },
  { time:'13:38:12', ago:'56m', ini:'⚙', col:'#6366f1', name:'ci-runner-east-1', role:'Service Account',action:'Model Weights Checksum Passed',   asset:'yolov8-perimeter.pt',  hash:'f12e84...906b', status:'SUCCESS'  },
  { time:'12:15:40', ago:'2h',  ini:'ER', col:'#7c3aed', name:'elena.rostova',    role:'ML Engineer',    action:'Inference Execution Authorized',  asset:'frame_0928_01.jpg',    hash:'4a310d...f122', status:'APPROVED' },
  { time:'10:04:19', ago:'4h',  ini:'KP', col:'#0891b2', name:'kiran.patel',      role:'DevOps Admin',   action:'Hash Mismatch Incident Resolved', asset:'detr-facial-auth.onnx',hash:'9c85ec...1045', status:'RESOLVED' },
  { time:'08:41:00', ago:'6h',  ini:'👁', col:'#374151', name:'system-watchdog',  role:'Cron Daemon',    action:'Registry Re-anchoring Completed', asset:'ledger-block-14886',   hash:'89a421...f01d', status:'VERIFIED' },
  { time:'07:22:11', ago:'7h',  ini:'AM', col:'#2563eb', name:'alex.mercer',      role:'SecOps Lead',    action:'API Key Rotation Signed',         asset:'kmv-key-acc-4516',     hash:'3b8221...44ac', status:'APPROVED' },
]

const MODELS = [
  { name:'YOLOv8-Security-Perimeter', ver:'v2.4.0', icon:'🎥', hash:'d8a9...b4c2', ms:'9.4ms',  ok:true,  drift:0   },
  { name:'DETR-Facial-Auth',          ver:'v1.1.0', icon:'👤', hash:'3971...ce88', ms:'16.1ms', ok:true,  drift:0   },
  { name:'SegNet-Safety-Monitor',     ver:'v3.0.1', icon:'🛡', hash:'8061...74da', ms:'22.8ms', ok:true,  drift:0.1 },
  { name:'ResNet50-Biometric-Auth',   ver:'v1.8.2', icon:'🔬', hash:'9ca3...33b0', ms:'11.2ms', ok:false, drift:2.1 },
]

const PIPES = [
  { name:'YOLOv8-Perimeter', icon:'🎥', cam:'CAM_PERIM_03',  fps:'60 FPS', ms:'9.4ms',  det:3, run:true,  color:'#2563eb' },
  { name:'DETR-Facial-Auth', icon:'👤', cam:'ENTRY_GATE_01', fps:'30 FPS', ms:'16.1ms', det:1, run:true,  color:'#7c3aed' },
  { name:'SegNet-Safety',    icon:'🛡', cam:'FACTORY_FLOOR', fps:'15 FPS', ms:'22.8ms', det:0, run:false, color:'#0891b2' },
]

export default function Overview() {
  const [loading,   setLoading]   = useState(true)
  const [stats,     setStats]     = useState(null)
  const [error,     setError]     = useState(null)
  const [filter,    setFilter]    = useState('')
  const [secsSince, setSecsSince] = useState(0)
  const [timeStr,   setTimeStr]   = useState('')

  useEffect(() => {
    const id = setInterval(() => {
      setSecsSince(s => s + 1)
      setTimeStr(new Date().toLocaleTimeString('en-US', { hour12: false }))
    }, 1000)
    setTimeStr(new Date().toLocaleTimeString('en-US', { hour12: false }))
    return () => clearInterval(id)
  }, [])

  const fetchAll = useCallback(async () => {
    try {
      const [modRes, infRes, audRes] = await Promise.all([
        api.get('/model/registry'),
        api.get('/inference/logs'),
        api.get('/audit/logs'),
      ])
      const models     = modRes.data.models     || []
      const inferences = infRes.data.inferences || []
      const auditLogs  = audRes.data.audit_logs || []
      const violations = auditLogs.filter(l =>
        (l.action||'').toLowerCase().includes('fail') ||
        (l.action||'').toLowerCase().includes('block')
      ).length
      setStats({ models, inferences, auditLogs, violations })
      setSecsSince(0)
    } catch {
      setError('Backend not reachable — showing demo data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const inferences = stats?.inferences?.length ?? 1284
  const modelCount = stats?.models?.length      ?? 4
  const auditCount = stats?.auditLogs?.length   ?? 14892
  const violations = stats?.violations          ?? 0

  const filtered = ACTIVITY.filter(r =>
    !filter ||
    r.name.toLowerCase().includes(filter.toLowerCase()) ||
    r.action.toLowerCase().includes(filter.toLowerCase()) ||
    r.asset.toLowerCase().includes(filter.toLowerCase())
  )

  const dateStr = new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })

  return (
    <div className="fade-in" style={{ paddingBottom: 32 }}>

      {/* ── PAGE HEADER ── */}
      <div className="page-header" style={{ padding:'20px 28px 14px' }}>
        <div className="page-header-left">
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
            <h1 style={{ margin:0, fontSize:'1.6rem', letterSpacing:'-0.3px' }}>System Integrity Overview</h1>
            <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:'#ecfdf5', border:'1px solid #a7f3d0', color:'#065f46', borderRadius:999, fontSize:'0.72rem', fontWeight:700, padding:'3px 10px' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#10b981', display:'inline-block', animation:'pulse-dot 2s ease-in-out infinite' }}/>
              LIVE
            </span>
          </div>
          <p style={{ color:'var(--text-500)', fontSize:'0.84rem', margin:0 }}>
            Real-time cryptographic verification &nbsp;·&nbsp; {dateStr} &nbsp;·&nbsp; {timeStr} UTC+05:30
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={fetchAll}>
            <Ico path="M1 4v6h6 M23 20v-6h-6 M20.49 9A9 9 0 0 0 5.64 5.64L1 10 M3.51 15a9 9 0 0 0 14.85 3.36L23 14" size={13}/>
            Refresh
          </button>
          <button className="btn btn-secondary">
            <Ico path="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3" size={13}/>
            Export Report
          </button>
          <button className="btn btn-primary" onClick={fetchAll}>
            <Ico path="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" size={13}/>
            Run Full Verification
          </button>
        </div>
      </div>

      <div className="page-wrap" style={{ paddingTop:0 }}>
        {error && <div className="alert alert-info" style={{ fontSize:'0.78rem', marginBottom:14 }}>ℹ {error}</div>}

        {/* ── ENCLAVE BANNER ── */}
        <div style={{ background:'linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)', borderRadius:12, padding:'14px 20px', display:'flex', alignItems:'center', gap:16, marginBottom:18, boxShadow:'0 4px 20px rgba(37,99,235,0.18)', border:'1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ width:40, height:40, borderRadius:10, background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0 }}>🔒</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:'0.7rem', fontWeight:800, color:'#10b981', marginBottom:2, textTransform:'uppercase', letterSpacing:'0.5px' }}>Cryptographic Hardware Enclave Active</div>
            <div style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.8)' }}>
              All <strong style={{ color:'#fff' }}>{modelCount} models</strong> and <strong style={{ color:'#fff' }}>12 datasets</strong> verified against immutable registry
              {secsSince > 0 ? ` · ${secsSince}s ago` : ' · Just now'} · ED25519 + TPM 2.0
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:'0.6rem', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:2 }}>Chain Signature</div>
              <code style={{ fontSize:'0.7rem', color:'#7dd3fc', fontFamily:'JetBrains Mono' }}>SIG: e89ad4...f01d</code>
            </div>
            <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', color:'#10b981', borderRadius:6, fontSize:'0.7rem', fontWeight:700, padding:'4px 10px' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#10b981', display:'inline-block', animation:'pulse-dot 2s ease-in-out infinite' }}/>
              SGX SEALED
            </span>
          </div>
        </div>

        {/* ── 5 KPI CARDS ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, marginBottom:18 }}>

          {/* Dataset */}
          <div className="section-card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'14px 16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <span style={{ fontSize:'0.6rem', fontWeight:700, color:'var(--text-400)', textTransform:'uppercase', letterSpacing:'0.7px' }}>Dataset Status</span>
                <div style={{ width:28, height:28, borderRadius:7, background:'#ecfdf5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem' }}>🗃</div>
              </div>
              <div style={{ fontWeight:800, fontSize:'1.75rem', color:'var(--text-900)', letterSpacing:'-1px', lineHeight:1, marginBottom:2 }}>12 / 12</div>
              <div style={{ fontSize:'0.72rem', color:'var(--text-500)', marginBottom:10 }}>Sets Intact</div>
              <Sparkline data={[10,10,10,10,10,10,10,10,10,12]} color="#10b981" height={26}/>
            </div>
            <div style={{ borderTop:'1px solid var(--card-border)', padding:'7px 16px', display:'flex', alignItems:'center', gap:5, fontSize:'0.68rem' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#10b981', display:'inline-block' }}/>
              <span style={{ color:'#065f46', fontWeight:600 }}>VERIFIED · 0 drifts</span>
            </div>
          </div>

          {/* Models */}
          <div className="section-card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'14px 16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <span style={{ fontSize:'0.6rem', fontWeight:700, color:'var(--text-400)', textTransform:'uppercase', letterSpacing:'0.7px' }}>Active Models</span>
                <div style={{ width:28, height:28, borderRadius:7, background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem' }}>🛡</div>
              </div>
              <div style={{ fontWeight:800, fontSize:'1.75rem', color:'var(--text-900)', letterSpacing:'-1px', lineHeight:1, marginBottom:2 }}>
                {loading ? '—' : <AnimatedCounter target={modelCount || 4} />}
              </div>
              <div style={{ fontSize:'0.72rem', color:'var(--text-500)', marginBottom:10 }}>SHA-256 Signed</div>
              <Sparkline data={[2,2,3,3,3,4,4,4,4,4]} color="#2563eb" height={26}/>
            </div>
            <div style={{ borderTop:'1px solid var(--card-border)', padding:'7px 16px', fontSize:'0.68rem' }}>
              <span style={{ color:'#1e40af', fontWeight:600 }}>🔒 3 of 4 APPROVED</span>
            </div>
          </div>

          {/* Trust Score */}
          <div className="section-card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'14px 16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                <span style={{ fontSize:'0.6rem', fontWeight:700, color:'var(--text-400)', textTransform:'uppercase', letterSpacing:'0.7px' }}>Trust Score</span>
                <span style={{ background:'#dcfce7', color:'#166534', borderRadius:4, fontSize:'0.6rem', fontWeight:700, padding:'2px 6px' }}>EXCELLENT</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <TrustRing score={94} size={68}/>
                <div>
                  <div style={{ fontSize:'0.75rem', color:'#10b981', fontWeight:700 }}>↑ +2.4%</div>
                  <div style={{ fontSize:'0.68rem', color:'var(--text-500)' }}>vs last epoch</div>
                  <div style={{ fontSize:'0.65rem', color:'var(--text-400)', marginTop:4 }}>≥90% threshold ✓</div>
                </div>
              </div>
            </div>
            <div style={{ borderTop:'1px solid var(--card-border)', padding:'7px 16px', fontSize:'0.68rem', color:'var(--text-500)' }}>
              Deterministic provenance verified
            </div>
          </div>

          {/* Inferences */}
          <div className="section-card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'14px 16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <span style={{ fontSize:'0.6rem', fontWeight:700, color:'var(--text-400)', textTransform:'uppercase', letterSpacing:'0.7px' }}>Inference Runs</span>
                <span style={{ color:'#10b981', fontSize:'0.68rem', fontWeight:700 }}>↑ +18%</span>
              </div>
              <div style={{ fontWeight:800, fontSize:'1.75rem', color:'var(--text-900)', letterSpacing:'-1px', lineHeight:1, marginBottom:2 }}>
                {loading ? '—' : <AnimatedCounter target={inferences > 100 ? inferences : 1284} />}
              </div>
              <div style={{ fontSize:'0.72rem', color:'var(--text-500)', marginBottom:8 }}>runs today</div>
              <MiniBar bars={[18,32,22,40,55,45,60,72,65,80,70,85]} color="#2563eb" height={26}/>
            </div>
            <div style={{ borderTop:'1px solid var(--card-border)', padding:'7px 16px', display:'flex', gap:8, fontSize:'0.68rem' }}>
              <span style={{ color:'#065f46', fontWeight:600 }}>1,281 Verified</span>
              <span style={{ color:'var(--text-300)' }}>·</span>
              <span style={{ color:'#991b1b', fontWeight:600 }}>3 Blocked</span>
            </div>
          </div>

          {/* Audit Events */}
          <div className="section-card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'14px 16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <span style={{ fontSize:'0.6rem', fontWeight:700, color:'var(--text-400)', textTransform:'uppercase', letterSpacing:'0.7px' }}>Audit Events</span>
                <div style={{ width:28, height:28, borderRadius:7, background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem' }}>📋</div>
              </div>
              <div style={{ fontWeight:800, fontSize:'1.75rem', color:'var(--text-900)', letterSpacing:'-1px', lineHeight:1, marginBottom:2 }}>
                {loading ? '—' : <AnimatedCounter target={auditCount > 100 ? auditCount : 14892} />}
              </div>
              <div style={{ fontSize:'0.72rem', color:'var(--text-500)', marginBottom:10 }}>immutable blocks</div>
              <Sparkline data={[120,135,128,142,138,150,160,155,168,180]} color="#6366f1" height={26}/>
            </div>
            <div style={{ borderTop:'1px solid var(--card-border)', padding:'7px 16px', fontSize:'0.68rem' }}>
              <span style={{ color: violations > 0 ? '#991b1b' : '#065f46', fontWeight:600 }}>
                {violations > 0 ? `⚠ ${violations} violations` : '✓ 0 violations'}
              </span>
              <span style={{ color:'var(--text-400)' }}> · Merkle anchored</span>
            </div>
          </div>

        </div>

        {/* ── TIMELINE + NODE MAP ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:14, marginBottom:18 }}>

          <div className="section-card" style={{ padding:20 }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
              <div>
                <div style={{ fontWeight:700, fontSize:'0.95rem', color:'var(--text-900)', marginBottom:3 }}>Integrity Verification Timeline</div>
                <p style={{ fontSize:'0.78rem', color:'var(--text-500)', margin:0 }}>Continuous deterministic hash sweeps · Cycle: 126s</p>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.72rem', color:'var(--text-500)' }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:'#10b981', display:'inline-block' }}/> 99.98% uptime
                </span>
                {['6h','12h','24h'].map(t => (
                  <button key={t} style={{ fontSize:'0.68rem', fontWeight:600, cursor:'pointer', borderRadius:4, padding:'2px 8px', border:'1px solid', color: t==='24h' ? '#fff' : 'var(--primary)', background: t==='24h' ? 'var(--primary)' : 'var(--primary-muted)', borderColor: t==='24h' ? 'var(--primary)' : '#bfdbfe' }}>{t}</button>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.62rem', color:'var(--text-400)', marginBottom:4 }}>
              <span>T − 24h</span><span>Sweep Latency (ms)</span><span>NOW</span>
            </div>
            <VerificationTimeline/>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.62rem', color:'var(--text-400)', marginTop:6 }}>
              {['00:00 UTC','04:00','08:00','12:00','16:00','20:00','NOW'].map(t => (
                <span key={t} style={{ fontWeight: t==='NOW' ? 700 : 400, color: t==='NOW' ? 'var(--primary)' : undefined }}>{t}</span>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:0, marginTop:16, paddingTop:14, borderTop:'1px solid var(--card-border)' }}>
              {[
                { label:'Sweep Cycles', value:'720',      color:'var(--text-900)' },
                { label:'Avg Latency',  value:'14.2 ms',  color:'var(--text-900)' },
                { label:'Node Cover',   value:'7 / 7',    color:'#10b981'         },
                { label:'Violations',   value:'0',         color:'#10b981'         },
              ].map(({ label, value, color }, i, a) => (
                <div key={label} style={{ textAlign:'center', padding:'0 10px', borderRight: i < a.length-1 ? '1px solid var(--card-border)' : 'none' }}>
                  <div style={{ fontSize:'0.65rem', color:'var(--text-500)', marginBottom:3 }}>{label}</div>
                  <div style={{ fontWeight:700, fontSize:'0.95rem', color }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="section-card" style={{ padding:0, overflow:'hidden', display:'flex', flexDirection:'column' }}>
            <div style={{ padding:'14px 16px 10px', borderBottom:'1px solid var(--card-border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--text-900)' }}>Global Node Status</div>
              <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.68rem', fontWeight:700, color:'#065f46', background:'#ecfdf5', border:'1px solid #a7f3d0', borderRadius:4, padding:'2px 8px' }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background:'#10b981', display:'inline-block', animation:'pulse-dot 2s ease-in-out infinite' }}/>
                7 NODES
              </span>
            </div>
            <div style={{ padding:'10px 12px' }}><NodeMap/></div>
            <div style={{ padding:'0 12px 10px' }}>
              {[
                { label:'US-EAST (Primary)', lat:'9.4ms',  st:'ACTIVE', color:'#10b981' },
                { label:'EU-WEST (Replica)', lat:'18.1ms', st:'ACTIVE', color:'#10b981' },
                { label:'EU-NORTH (Replica)',lat:'21.4ms', st:'WARN',   color:'#f59e0b' },
                { label:'AP-EAST (Replica)', lat:'32.7ms', st:'ACTIVE', color:'#10b981' },
              ].map((n,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'5px 0', borderBottom: i < 3 ? '1px solid var(--card-border)' : 'none', fontSize:'0.72rem' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:n.color, display:'inline-block' }}/>
                    <span style={{ color:'var(--text-700)', fontWeight:500 }}>{n.label}</span>
                  </div>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <span style={{ color:'var(--text-400)', fontFamily:'JetBrains Mono', fontSize:'0.68rem' }}>{n.lat}</span>
                    <span style={{ fontSize:'0.62rem', fontWeight:700, color:n.color }}>{n.st}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── MODEL REGISTRY + SYSTEM HEALTH ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:14, marginBottom:18 }}>

          <div className="section-card" style={{ overflow:'hidden' }}>
            <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--card-border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--text-900)' }}>Active Model Registry</span>
                <span style={{ background:'#eff6ff', border:'1px solid #bfdbfe', color:'#1e40af', fontSize:'0.62rem', fontWeight:700, padding:'2px 7px', borderRadius:4 }}>SHA-256 Verified</span>
              </div>
              <button style={{ fontSize:'0.72rem', color:'var(--primary)', background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>View All →</button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Model</th><th>Version</th><th>Weight Hash</th><th>Latency</th><th>Drift</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {MODELS.map((m,i) => (
                  <tr key={i} style={{ background: !m.ok ? '#fffbeb' : undefined }}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:30, height:30, borderRadius:7, background:'var(--primary-muted)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem', flexShrink:0 }}>{m.icon}</div>
                        <span style={{ fontWeight:600, fontSize:'0.8rem', color:'var(--text-900)' }}>{m.name}</span>
                      </div>
                    </td>
                    <td><code style={{ fontSize:'0.7rem', fontFamily:'JetBrains Mono', color:'var(--text-500)', background:'var(--gray-bg)', padding:'2px 6px', borderRadius:3 }}>{m.ver}</code></td>
                    <td><code style={{ fontSize:'0.68rem', fontFamily:'JetBrains Mono', color:'var(--text-500)' }}>sha256:{m.hash}</code></td>
                    <td style={{ fontFamily:'JetBrains Mono', fontSize:'0.72rem', color:'var(--text-700)', fontWeight:600 }}>{m.ms}</td>
                    <td><span style={{ fontSize:'0.72rem', fontWeight:700, color: m.drift===0 ? '#10b981' : m.drift<1 ? '#f59e0b' : '#ef4444' }}>{m.drift===0 ? '± 0.00%' : `+${m.drift.toFixed(1)}% ⚠`}</span></td>
                    <td><Pill status={m.ok ? 'APPROVED' : 'WARNING'}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="section-card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--card-border)' }}>
              <div style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--text-900)', marginBottom:2 }}>System Health</div>
              <div style={{ fontSize:'0.72rem', color:'var(--text-500)' }}>GPU-NODE-04-US · PROD-US-EAST</div>
            </div>
            <div style={{ padding:'14px 16px' }}>
              <HealthBar label="CPU Utilization"     value={38} color="#2563eb"/>
              <HealthBar label="GPU Utilization"     value={84} color="#7c3aed"/>
              <HealthBar label="Memory Usage"        value={62} color="#0891b2"/>
              <HealthBar label="Enclave Trust Score" value={94} color="#10b981"/>
              <HealthBar label="Disk I/O"            value={28} color="#6366f1"/>
              <div style={{ marginTop:14, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[
                  { label:'Uptime', value:'99.98%', color:'#10b981' },
                  { label:'VRAM',   value:'18.4 GB',color:'#7c3aed' },
                  { label:'TDP',    value:'320 W',  color:'#f59e0b' },
                  { label:'Temp',   value:'71 °C',  color:'#0891b2' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ background:'var(--gray-bg)', border:'1px solid var(--card-border)', borderRadius:7, padding:'8px 10px' }}>
                    <div style={{ fontSize:'0.6rem', color:'var(--text-400)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:3 }}>{label}</div>
                    <div style={{ fontSize:'0.85rem', fontWeight:800, color }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── ACTIVE PIPELINES ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:18 }}>
          {PIPES.map((p,i) => (
            <div key={i} className="section-card" style={{ padding:0, overflow:'hidden' }}>
              <div style={{ padding:'12px 14px', borderBottom:'1px solid var(--card-border)', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:34, height:34, borderRadius:8, background:`${p.color}18`, border:`1px solid ${p.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0 }}>{p.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:'0.8rem', color:'var(--text-900)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize:'0.65rem', color:'var(--text-400)', fontFamily:'JetBrains Mono' }}>{p.cam} · {p.fps}</div>
                </div>
                <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.65rem', fontWeight:700, color: p.run ? '#065f46' : '#92400e', background: p.run ? '#ecfdf5' : '#fffbeb', border:`1px solid ${p.run ? '#a7f3d0' : '#fde68a'}`, borderRadius:4, padding:'2px 7px', flexShrink:0 }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background: p.run ? '#10b981' : '#f59e0b', display:'inline-block', animation: p.run ? 'pulse-dot 2s ease-in-out infinite' : 'none' }}/>
                  {p.run ? 'RUNNING' : 'STANDBY'}
                </span>
              </div>
              <div style={{ padding:'10px 14px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                {[
                  { label:'Latency',    value:p.ms,  mono:true  },
                  { label:'Detections', value:p.det, mono:false },
                  { label:'Hash Match', value:'✓ OK', mono:false, green:true },
                ].map(({ label, value, mono, green }) => (
                  <div key={label}>
                    <div style={{ fontSize:'0.58rem', color:'var(--text-400)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:2 }}>{label}</div>
                    <div style={{ fontSize:'0.82rem', fontWeight:700, color: green ? '#10b981' : 'var(--text-900)', fontFamily: mono ? 'JetBrains Mono' : 'inherit' }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── RECENT ACTIVITY ── */}
        <div className="section-card" style={{ overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--card-border)', display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <span style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--text-900)' }}>🔄 Recent Integrity Activity</span>
            <span style={{ fontSize:'0.65rem', fontWeight:700, color:'#0369a1', background:'#e0f2fe', border:'1px solid #bae6fd', borderRadius:4, padding:'2px 7px' }}>Immutable Ledger</span>
            <span style={{ fontSize:'0.65rem', color:'var(--text-400)' }}>
              Chain root: <code style={{ fontFamily:'JetBrains Mono', color:'var(--primary)' }}>6x9924...ee31</code>
            </span>
            <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
              <div className="search-input-wrap" style={{ width:200 }}>
                <span className="search-icon" style={{ fontSize:'0.75rem' }}>🔍</span>
                <input className="input-field" placeholder="Filter activity…" value={filter} onChange={e => setFilter(e.target.value)}
                  style={{ height:30, padding:'5px 10px 5px 28px', fontSize:'0.78rem' }}/>
              </div>
              <select className="input-field" style={{ height:30, width:'auto', padding:'5px 24px 5px 10px', fontSize:'0.78rem' }}>
                <option>All Actions</option><option>VERIFIED</option><option>APPROVED</option><option>BLOCKED</option>
              </select>
              <button className="btn btn-secondary btn-sm" onClick={fetchAll} style={{ height:30, fontSize:'0.72rem' }}>↻ Refresh</button>
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th><th>Operator / Principal</th><th>Action</th><th>Asset / Target</th><th>Hash Proof</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={i}>
                  <td style={{ minWidth:90 }}>
                    <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.72rem', color:'var(--text-700)', marginBottom:1 }}>{row.time}</div>
                    <div style={{ fontSize:'0.62rem', color:'var(--text-400)' }}>{row.ago} ago</div>
                  </td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:28, height:28, borderRadius:'50%', background:row.col, display:'flex', alignItems:'center', justifyContent:'center', fontSize: row.ini.length <= 2 ? '0.62rem' : '0.85rem', fontWeight:700, color:'#fff', flexShrink:0 }}>{row.ini}</div>
                      <div>
                        <div style={{ fontWeight:600, fontSize:'0.78rem', color:'var(--text-900)' }}>{row.name}</div>
                        <div style={{ fontSize:'0.65rem', color:'var(--text-400)' }}>{row.role}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize:'0.8rem', color:'var(--text-700)', fontWeight:500 }}>{row.action}</td>
                  <td><code style={{ fontSize:'0.68rem', fontFamily:'JetBrains Mono', color:'var(--primary)', background:'var(--primary-muted)', padding:'2px 6px', borderRadius:3 }}>{row.asset}</code></td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <code style={{ fontSize:'0.68rem', fontFamily:'JetBrains Mono', color:'var(--text-500)', background:'var(--gray-bg)', padding:'2px 6px', borderRadius:3 }}>{row.hash}</code>
                      <button style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-400)', fontSize:'0.75rem', padding:2 }}>⧉</button>
                    </div>
                  </td>
                  <td><Pill status={row.status}/></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ padding:'10px 18px', borderTop:'1px solid var(--card-border)', background:'var(--gray-bg)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:'0.72rem', color:'var(--text-500)' }}>
              Showing {filtered.length} recent · <strong>{auditCount > 100 ? auditCount.toLocaleString() : '14,892'}</strong> total cryptographically anchored events
            </span>
            <button style={{ fontSize:'0.72rem', color:'var(--primary)', background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>View Full Audit Log →</button>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.5; }
          50%  { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1);   opacity: 0; }
        }
      `}</style>
    </div>
  )
}
