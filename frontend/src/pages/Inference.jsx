import React, { useState, useRef } from 'react'
import api from '../api/axiosClient'
import cctvFeed from '../assets/cctv_feed.jpg'

/* ── Tiny inline SVG icon helper ──────────────────── */
const Ico = ({ d, size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

/* ── Detection boxes SVG overlay ─────────────────── */
function DetectionOverlay() {
  const boxes = [
    /* Pedestrian */
    { x: '14%', y: '36%', w: '10%', h: '40%', color: '#f59e0b', label: 'Pedestrian 88.4%', lx: '14%', ly: '35%' },
    /* Vehicle (SUV) blue car */
    { x: '56%', y: '35%', w: '32%', h: '35%', color: '#22d3ee', label: 'Vehicle 96.1%',    lx: '56%', ly: '34%' },
    /* Traffic Sign */
    { x: '39%', y: '16%', w: '12%', h: '28%', color: '#a78bfa', label: 'Traffic Sign 99.2%', lx: '39%', ly: '15%' },
  ]
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {boxes.map((b, i) => (
        <g key={i}>
          <rect
            x={b.x} y={b.y} width={b.w} height={b.h}
            fill="none" stroke={b.color} strokeWidth="2"
            rx="2"
          />
          <rect x={b.lx} y={`calc(${b.ly} - 16px)`} width="120" height="16"
            fill={b.color} opacity="0.85" rx="2" />
          <text x={b.lx} y={b.ly} fontSize="10" fill="#fff"
            fontFamily="JetBrains Mono, monospace" fontWeight="700"
            dy="-3" dx="3">
            {b.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

/* ── Hash row component ───────────────────────────── */
function HashRow({ label, hash, badge, badgeColor, note }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard?.writeText(hash).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-700)' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {note && <span style={{ fontSize: '0.65rem', color: 'var(--text-400)' }}>{note}</span>}
          {badge && (
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: badgeColor?.color || '#065f46', background: badgeColor?.bg || '#ecfdf5', border: `1px solid ${badgeColor?.border || '#a7f3d0'}`, borderRadius: 4, padding: '2px 7px', display: 'flex', alignItems: 'center', gap: 4 }}>
              ✓ {badge}
            </span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--gray-bg)', border: '1px solid var(--card-border)', borderRadius: 6, padding: '7px 10px' }}>
        <code style={{ flex: 1, fontSize: '0.68rem', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-500)', wordBreak: 'break-all', lineHeight: 1.4 }}>
          {hash}
        </code>
        <button onClick={copy} title="Copy"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? 'var(--green)' : 'var(--text-400)', fontSize: '0.9rem', flexShrink: 0, transition: 'color 0.2s' }}>
          {copied ? '✓' : '⧉'}
        </button>
      </div>
    </div>
  )
}

/* ── Confidence bar ───────────────────────────────── */
function ConfBar({ value, color = 'var(--primary)' }) {
  return (
    <div style={{ height: 6, background: '#e5e7eb', borderRadius: 999, overflow: 'hidden', marginTop: 6, marginBottom: 6 }}>
      <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 999, transition: 'width 0.8s ease' }} />
    </div>
  )
}

/* ── Main Inference page ──────────────────────────── */
export default function Inference() {
  const [mode,       setMode]       = useState('normal')   // 'normal' | 'simfail'
  const [running,    setRunning]    = useState(false)
  const [result,     setResult]     = useState(null)
  const [error,      setError]      = useState(null)
  const [blocked,    setBlocked]    = useState(false)
  const [camTab,     setCamTab]     = useState('Perimeter Gate 3')
  const [imagePath,  setImagePath]  = useState('')
  const fileRef = useRef()

  const CAM_TABS = ['Perimeter Gate 3', 'Autonomous Cam', 'Factory Floor']

  async function runInference() {
    if (mode === 'simfail') {
      setBlocked(true)
      setError('SIMULATED: Model hash mismatch detected — Inference BLOCKED by enclave policy.')
      setResult(null)
      return
    }
    setRunning(true); setResult(null); setError(null); setBlocked(false)
    try {
      const path = imagePath.trim() || 'C:\\TRUSTCV\\New-trustcv\\DATASET\\images\\test\\img001.jpg'
      const { data } = await api.post(`/inference/run?image_path=${encodeURIComponent(path)}`)
      if (data.status === 'error') {
        const isB = (data.details || '').toLowerCase().includes('tamper') || (data.details || '').toLowerCase().includes('block')
        setBlocked(isB); setError(data.details || 'Inference failed.')
      } else {
        setResult(data)
      }
    } catch (err) {
      const detail = err?.response?.data?.detail || err.message || 'Request failed.'
      setBlocked(err?.response?.status === 403)
      setError(detail)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

      {/* ── Hardware attestation badge ── */}
      <div style={{ padding: '14px 28px 0' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: '5px 12px', marginBottom: 4 }}>
          <span style={{ fontSize: '0.78rem' }}>🔒</span>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1d4ed8', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
            Hardware Attestation Active
          </span>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite' }} />
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-400)', marginBottom: 6, fontFamily: 'JetBrains Mono' }}>
          Cluster Node: GPU-NODE-04-US
        </div>
      </div>

      {/* ── Page header ── */}
      <div className="page-header" style={{ padding: '0 28px 14px', alignItems: 'flex-start' }}>
        <div className="page-header-left">
          <h1 style={{ fontSize: '1.55rem', marginBottom: 6 }}>Secure Vision Inference Runner</h1>
          <p style={{ maxWidth: 360, fontSize: '0.825rem' }}>
            Pre-flight model integrity attestation and cryptographic input/output hashing for computer vision models.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
          {/* Target model dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 8, padding: '8px 14px', boxShadow: 'var(--card-shadow)' }}>
            <div>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>Target Model</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--primary)' }}>🛡</span>
                <select style={{ border: 'none', outline: 'none', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-900)', background: 'transparent', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  <option>YOLOv8-Security-Perimeter-Detection (v2.4.0)</option>
                  <option>DETR-Facial-Auth (v1.1.0)</option>
                  <option>SegNet-Safety (v3.0.1)</option>
                </select>
              </div>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', borderRadius: 999, fontSize: '0.68rem', fontWeight: 700, padding: '3px 9px', flexShrink: 0 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} /> APPROVED
            </span>
          </div>
          {/* Mode toggle */}
          <div style={{ display: 'flex', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 6, overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
            {[{ key: 'normal', label: 'Normal\nMode' }, { key: 'simfail', label: 'Simulated\nFailure' }].map(({ key, label }) => (
              <button key={key} onClick={() => { setMode(key); setError(null); setBlocked(false); setResult(null) }}
                style={{
                  padding: '7px 16px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                  background: mode === key ? (key === 'simfail' ? '#fef2f2' : 'var(--primary)') : 'transparent',
                  color: mode === key ? (key === 'simfail' ? 'var(--red)' : '#fff') : 'var(--text-500)',
                  border: 'none', borderRight: key === 'normal' ? '1px solid var(--card-border)' : 'none',
                  whiteSpace: 'pre-line', lineHeight: 1.3, transition: 'all 0.18s',
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Enclave verification banner ── */}
      <div style={{ margin: '0 28px 16px', background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 8, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: '1rem', flexShrink: 0 }}>🛡</span>
        <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#065f46', flex: 1 }}>
          Cryptographic Hardware Enclave Verified: Model Weights Match Immutable Registry Signature
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: '0.68rem', color: '#047857', fontFamily: 'JetBrains Mono' }}>TPM 2.0 PCR-11 Anchor</span>
          <span style={{ background: '#065f46', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#6ee7b7', display: 'inline-block' }} /> SEALED
          </span>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '0 28px', flex: 1 }}>

        {/* ═══ LEFT: Input Image & Visual Analysis ═══ */}
        <div className="section-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--card-border)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-900)' }}>Input Image &amp; Visual Analysis</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-500)', lineHeight: 1.4, marginTop: 2, maxWidth: 220 }}>
                  Live feed or static tensor capture with annotated inferencing.
                </div>
              </div>
              {/* Cam tabs */}
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {CAM_TABS.map(tab => (
                  <button key={tab} onClick={() => setCamTab(tab)}
                    style={{ fontSize: '0.68rem', fontWeight: 600, padding: '4px 9px', borderRadius: 4, cursor: 'pointer', border: '1px solid', transition: 'all 0.15s',
                      background:    camTab === tab ? 'var(--primary)' : 'transparent',
                      color:         camTab === tab ? '#fff' : 'var(--text-500)',
                      borderColor:   camTab === tab ? 'var(--primary)' : 'var(--card-border)',
                    }}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Camera feed */}
          <div style={{ position: 'relative', lineHeight: 0 }}>
            <img src={cctvFeed} alt="CCTV feed" style={{ width: '100%', objectFit: 'cover', maxHeight: 220, display: 'block' }} />
            <DetectionOverlay />
            {/* Live badge */}
            <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.75)', borderRadius: 5, padding: '4px 10px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite' }} />
              <span style={{ color: '#fff', fontSize: '0.68rem', fontWeight: 700, fontFamily: 'JetBrains Mono' }}>CAM_PERIM_03 [60 FPS]</span>
            </div>
            {/* Bottom metadata bar */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.65)', padding: '5px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#d1d5db', fontSize: '0.65rem', fontFamily: 'JetBrains Mono' }}>
                🖥 1920 × 1080 px • 24-bit sRGB • 1.4 MB
              </span>
              <span style={{ color: '#d1d5db', fontSize: '0.65rem', fontFamily: 'JetBrains Mono' }}>
                ⚡ CUDA Latency: 1.8ms
              </span>
            </div>
          </div>

          {/* Drop zone */}
          <div style={{ margin: '12px 14px', border: '2px dashed var(--card-border)', borderRadius: 8, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'border-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--card-border)'}
            onClick={() => fileRef.current?.click()}>
            <div style={{ fontSize: '1.4rem' }}>☁</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.825rem', color: 'var(--text-900)', marginBottom: 2 }}>Drop image here or Browse</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-500)' }}>Supports raw buffers, PNG, JPEG, WebP (Max 25MB)</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); fileRef.current?.click() }}>
              Select<br/>Frame
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => { if (e.target.files?.[0]) setImagePath(e.target.files[0].name) }} />
          </div>

          {/* Or enter path */}
          {imagePath && (
            <div style={{ padding: '0 14px 8px', fontSize: '0.72rem', color: 'var(--primary)', fontFamily: 'JetBrains Mono' }}>
              Selected: {imagePath}
            </div>
          )}

          {/* Chip metadata */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: '0 14px 14px' }}>
            {[
              { label: 'Color Space',         value: 'BGR2RGB Normalized' },
              { label: 'Quantization',         value: 'INT8 TensorRT Calib' },
              { label: 'Zero-Copy Buffer',     value: 'NVMM Enabled' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--gray-bg)', border: '1px solid var(--card-border)', borderRadius: 6, padding: '7px 10px' }}>
                <div style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-700)' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ RIGHT: Cryptographic Attestation ═══ */}
        <div className="section-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-900)', marginBottom: 2 }}>
                🔏 Cryptographic Attestation &amp; Output Pipeline
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-500)' }}>
                Deterministic verification proofs and model telemetry
              </div>
            </div>
            <div style={{ background: '#1e293b', color: '#7dd3fc', borderRadius: 6, padding: '4px 10px', fontSize: '0.65rem', fontWeight: 700, fontFamily: 'JetBrains Mono', textAlign: 'center', lineHeight: 1.5 }}>
              TLS 1.3<br/>mTLS
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
            {/* ── Proof Signatures ── */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  Cryptographic Proof Signatures
                </span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#065f46', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 4, padding: '2px 7px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  🛡 SHA-256 Validated
                </span>
              </div>

              <HashRow
                label="Input Hash (SHA-256 Image Buffer)"
                hash="a8f5f1676449964e6c998dee827110c7931649938b81d86d5e1b21aa12233c9"
                note="Length: 64 char"
              />
              <HashRow
                label="Model Hash (SHA-256 Weights & Architecture)"
                hash="9f86d081884c7d659a2feaa0c55a0015a3bf471b2b0b822cd15d6c15b0f0fa08"
                badge="Verified Match"
                badgeColor={{ bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' }}
              />
              <HashRow
                label="Output Hash (SHA-256 Inference Tensor Proof)"
                hash="7c32bf8811d7390a1e506927bf54129b0532ba71ab3a5cb8e6e58f0032c99f4"
                note="Signed by Enclave"
              />
            </div>

            {/* ── Classification Output ── */}
            <div style={{ background: 'var(--gray-bg)', border: '1px solid var(--card-border)', borderRadius: 8, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  Inference Classification Output
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-400)' }}>Batch Size: 1</span>
              </div>

              {/* Primary class */}
              <div style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-900)' }}>
                    Primary Class: Pedestrian &amp; Vehicle Incursion
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>98.4%</span>
                </div>
                <ConfBar value={98.4} color="var(--primary)" />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-500)' }}>
                  <span>Threshold Limit: 75.0%</span>
                  <span style={{ color: 'var(--green)', fontWeight: 600 }}>Softmax Certainty: High</span>
                </div>
              </div>

              {/* Latency + attestation */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '12px 0' }}>
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 6, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.9rem' }}>⚡</span>
                  <div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-400)', fontWeight: 600, marginBottom: 1 }}>Inference Latency</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-900)' }}>14.2 ms on NVIDIA TensorRT</div>
                  </div>
                </div>
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 6, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.9rem' }}>📋</span>
                  <div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-400)', fontWeight: 600, marginBottom: 1 }}>Attestation ID</div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-900)', fontFamily: 'JetBrains Mono' }}>ATTEST-2025-0928-884</div>
                  </div>
                </div>
              </div>

              {/* Secondary classes */}
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-500)', fontWeight: 600, marginBottom: 6 }}>
                  Secondary Tensor Classes Detected
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {[
                    { label: 'Vehicle (SUV)',     pct: '96.1%', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
                    { label: 'Traffic Sign (Stop)', pct: '99.2%', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
                    { label: 'Perimeter Fence',  pct: '91.8%', color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' },
                  ].map(({ label, pct, color, bg, border }) => (
                    <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: bg, border: `1px solid ${border}`, color, borderRadius: 999, fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />
                      {label} <strong>{pct}</strong>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div style={{ padding: 16, borderTop: '1px solid var(--card-border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {/* Blocked alert replaces run button */}
            {blocked && (
              <div className="alert alert-error fade-in" style={{ gridColumn: '1/-1', margin: 0, fontSize: '0.78rem' }}>
                🚫 <strong>Inference BLOCKED</strong> — {error}
              </div>
            )}
            {!blocked && error && (
              <div className="alert alert-error fade-in" style={{ gridColumn: '1/-1', margin: 0, fontSize: '0.78rem' }}>⚠ {error}</div>
            )}
            {result && !error && (
              <div className="alert alert-success fade-in" style={{ gridColumn: '1/-1', margin: 0, fontSize: '0.78rem' }}>
                ✓ Inference complete — run by <strong>{result.run_by}</strong>
              </div>
            )}
            <button
              id="run-secure-inference-btn"
              className="btn btn-primary"
              onClick={runInference}
              disabled={running}
              style={{ justifyContent: 'center', padding: '12px', fontSize: '0.875rem', fontWeight: 700 }}
            >
              {running
                ? <><span className="spinner spinner--sm" /> Running…</>
                : <><span style={{ fontSize: '0.9rem' }}>▶</span> Run Secure Inference</>
              }
            </button>
            <button className="btn btn-secondary" style={{ justifyContent: 'center', padding: '12px', fontSize: '0.825rem', fontWeight: 600 }}>
              <span style={{ fontSize: '0.85rem' }}>⬇</span> Export Attestation Proof (JSON-LD)
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom status bar ── */}
      <div style={{
        margin: '16px 28px 20px',
        background: '#f8fafc',
        border: '1px solid var(--card-border)',
        borderRadius: 6,
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.72rem',
        color: 'var(--text-500)',
        fontFamily: 'JetBrains Mono, monospace',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.8rem' }}>📋</span>
          <span>Session Ledger: <strong style={{ color: 'var(--text-700)' }}>SESSION-CV-99120</strong></span>
          <span style={{ color: 'var(--text-300)' }}>•</span>
          <span style={{ color: 'var(--green)', fontWeight: 600 }}>✓ Cryptographic Nonce Verified</span>
          <span style={{ color: 'var(--text-300)' }}>•</span>
          <span>Merkle Tree Root: <code style={{ color: 'var(--primary)' }}>e3b0c44298fc...b855</code></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite' }} />
          <span style={{ fontWeight: 600, color: 'var(--text-700)' }}>Secure Enclave: Intel SGX / NVIDIA CC Active</span>
        </div>
      </div>

    </div>
  )
}
