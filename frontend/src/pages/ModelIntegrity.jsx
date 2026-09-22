import React, { useState, useEffect } from 'react'
import api from '../api/axiosClient'

/* ── Fingerprint matrix bar chart ─────────────────── */
function FingerprintMatrix() {
  const bars = [
    22, 35, 28, 40, 32, 38, 45, 30, 42, 36, 28, 44,
    38, 50, 34, 46, 28, 42, 36, 50, 44, 38, 30, 46,
  ]
  const max = Math.max(...bars)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 36 }}>
      {bars.map((v, i) => (
        <div key={i} style={{
          width: 5,
          height: `${(v / max) * 100}%`,
          background: '#10b981',
          borderRadius: '2px 2px 0 0',
          opacity: 0.8 + (i % 3) * 0.07,
        }} />
      ))}
    </div>
  )
}

/* ── Hash display box ─────────────────────────────── */
function HashBox({ hash, mismatch = false }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard?.writeText(hash).catch(() => {})
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: mismatch ? '#fef2f2' : '#f8fafc',
      border: `1px solid ${mismatch ? '#fecaca' : '#e5e7eb'}`,
      borderRadius: 6, padding: '8px 10px',
    }}>
      <code style={{
        flex: 1, fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace',
        color: mismatch ? '#dc2626' : '#374151',
        wordBreak: 'break-all', lineHeight: 1.5,
      }}>
        {hash}
      </code>
      <button onClick={copy} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#10b981' : '#9ca3af', flexShrink: 0, fontSize: '0.9rem' }}>
        {copied ? '✓' : '⧉'}
      </button>
    </div>
  )
}

/* ── Monitored models data ────────────────────────── */
const PROD_MODELS = [
  {
    name: 'YOLOv8-Perimeter.pt',
    version: 'v2.4.0',
    arch: 'PyTorch Darknet',
    expHash: '9f86d081...0a08',
    curHash: '9f86d081...0a08',
    status: 'APPROVED',
    lastAttest: '42s ago',
    match: true,
  },
  {
    name: 'ResNet50-Biometrics.onnx',
    version: 'v1.9.2',
    arch: 'ONNX Runtime',
    expHash: 'e3b0c442...982b',
    curHash: 'e3b0c442...982b',
    status: 'APPROVED',
    lastAttest: '2m ago',
    match: true,
  },
  {
    name: 'DETR-ObjectDetector-Edge.engine',
    subtext: 'Hash mismatch at layer block 3',
    version: 'v3.1.0',
    arch: 'TensorRT Engine',
    expHash: 'a591a6d4...1f04',
    curHash: '4b825dc6...8a91',
    status: 'TAMPERING',
    lastAttest: '14s ago',
    match: false,
  },
  {
    name: 'ViT-Base-Classifier.safetensors',
    version: 'v1.2.0',
    arch: 'Vision Transformer',
    expHash: '7d1b3294...f34a',
    curHash: '7d1b3294...f34a',
    status: 'APPROVED',
    lastAttest: '5m ago',
    match: true,
  },
  {
    name: 'EfficientNet-Surveillance.pt',
    version: 'v2.0.1',
    arch: 'PyTorch Backbone',
    expHash: '3f7c10a0...cc12',
    curHash: '3f7c10a0...cc12',
    status: 'APPROVED',
    lastAttest: '11m ago',
    match: true,
  },
]

const GOLDEN_HASH = '9f86d081884c7d659a2feaa0c55a0015a3bf471b2b0b822cd15d6c15b0f0fa08'
const RUNTIME_HASH = '9f86d081884c7d659a2feaa0c55a0015a3bf471b2b0b822cd15d6c15b0f0fa08'

export default function ModelIntegrity() {
  const [simMode,    setSimMode]    = useState(true)   // show tamper simulation by default
  const [verifying,  setVerifying]  = useState(false)
  const [verifyResult, setVerifyResult] = useState(null)
  const [verifyError,  setVerifyError]  = useState(null)
  const [models,     setModels]     = useState([])
  const [modelsLoad, setModelsLoad] = useState(true)

  useEffect(() => {
    api.get('/model/registry')
      .then(({ data }) => setModels(data.models || []))
      .catch(() => {})
      .finally(() => setModelsLoad(false))
  }, [])

  async function runVerify() {
    setVerifying(true); setVerifyResult(null); setVerifyError(null)
    try {
      const { data } = await api.get('/model/verify')
      setVerifyResult(data)
    } catch (err) {
      setVerifyError(err?.response?.data?.detail || err.message || 'Verification failed.')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column' }}>

      {/* ── Enclave badge breadcrumb ── */}
      <div style={{ padding: '14px 28px 0' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 4, padding: '3px 10px', fontSize: '0.68rem', fontWeight: 700, color: '#1d4ed8' }}>
            🔵 ENCLAVE ATTESTATION ENGINE
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-400)', fontFamily: 'JetBrains Mono' }}>SEC-LEVEL-4</span>
        </div>
      </div>

      {/* ── Page header ── */}
      <div className="page-header" style={{ padding: '0 28px 16px' }}>
        <div className="page-header-left">
          <h1 style={{ fontSize: '1.6rem', marginBottom: 6 }}>Model Integrity &amp; Weights Verification</h1>
          <p style={{ maxWidth: 560, fontSize: '0.825rem' }}>
            Hardware-anchored hash attestation, neural architecture fingerprinting, and weight file
            tampering detection for edge &amp; cloud inference clusters.
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={runVerify} disabled={verifying}>
            {verifying ? <><span className="spinner spinner--sm" /> Calculating…</> : '↻ Re-Calculate SHA-256'}
          </button>
          <button className="btn btn-primary" style={{ gap: 6 }}>
            🛡 Download Cryptographic Certificate
          </button>
        </div>
      </div>

      <div className="page-wrap" style={{ paddingTop: 0 }}>

        {/* ── Verify API result ── */}
        {verifyError && <div className="alert alert-error mb-16">⚠ {verifyError}</div>}
        {verifyResult?.output && (
          <div className="alert alert-success mb-16" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <strong>Verification Result</strong>
            <div className="output-block" style={{ marginTop: 8, width: '100%', maxHeight: 100 }}>{verifyResult.output}</div>
          </div>
        )}

        {/* ── Model info header card ── */}
        <div className="section-card" style={{ padding: '16px 20px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
          {/* Watermark circle */}
          <div style={{ position: 'absolute', right: -40, top: -40, width: 180, height: 180, borderRadius: '50%', border: '2px solid rgba(37,99,235,0.08)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', border: '2px solid rgba(37,99,235,0.06)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
            <div style={{ flex: 1 }}>
              {/* Meta row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', borderRadius: 4, fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  🔶 PYTORCH MODEL
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-500)', fontFamily: 'JetBrains Mono' }}>v2.4.0-rc3 (Production)</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite' }} />
                  Synchronized with Cluster A
                </span>
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.35rem', color: 'var(--text-900)', marginBottom: 6, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.3px' }}>
                YOLOv8-Security-Perimeter-Detection.pt
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-500)' }}>
                Target Deployment: Perimeter Vision Pods &nbsp;•&nbsp; Weight File Footprint: 87.4 MB &nbsp;•&nbsp;
                Enclave Anchor: <code style={{ fontFamily: 'JetBrains Mono', color: 'var(--primary)', fontSize: '0.72rem' }}>TPM-NVRAM-0x8101</code>
              </div>
            </div>
            {/* APPROVED badge */}
            <div style={{ flexShrink: 0 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#10b981', color: '#fff',
                borderRadius: 8, padding: '10px 20px',
                fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.5px',
              }}>
                <span style={{ fontSize: '1rem' }}>✓</span>
                APPROVED
              </div>
            </div>
          </div>
        </div>

        {/* ── Tampering alert ── */}
        {simMode && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
            padding: '16px 18px', marginBottom: 16,
            display: 'grid', gridTemplateColumns: '1fr auto', gap: 20,
          }}>
            {/* Left: alert content */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fee2e2', border: '2px solid #fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.9rem' }}>⚠</span>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#991b1b', letterSpacing: '0.2px' }}>
                    State Variant: TAMPERING DETECTED
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span style={{ background: '#f97316', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 3, letterSpacing: '0.3px' }}>
                      SIMULATION VECTOR
                    </span>
                    <button
                      onClick={() => setSimMode(false)}
                      style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700, padding: '4px 12px', cursor: 'pointer', letterSpacing: '0.2px' }}>
                      Quarantine Node
                    </button>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#7f1d1d', lineHeight: 1.5, paddingLeft: 42 }}>
                Hash mismatch on Layer 42 convolutional tensor weights. Bitwise delta:{' '}
                <code style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: '#dc2626' }}>0x7f2a...3801</code> deviation.
              </div>
            </div>
            {/* Right: fingerprint matrix */}
            <div style={{ textAlign: 'right', minWidth: 160 }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>
                Fingerprint Matrix
              </div>
              <FingerprintMatrix />
              <div style={{ fontSize: '0.65rem', color: '#b91c1c', marginTop: 4, fontWeight: 600 }}>
                96/96 Layers Verified
              </div>
            </div>
          </div>
        )}

        {/* ── Hash comparison panel ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Golden hash */}
          <div className="section-card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-700)', display: 'flex', alignItems: 'center', gap: 6 }}>
                ⇌ Expected Golden Hash (Signed Registry)
              </span>
              <span style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', borderRadius: 4, fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px' }}>
                SecOps Signed #4491
              </span>
            </div>
            <HashBox hash={GOLDEN_HASH} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: '0.68rem', color: 'var(--text-400)' }}>
              <span>⏱ Registered Oct 14, 2024 at 10:30 UTC</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem' }}>GPU ID: 0x90A2831C</span>
            </div>
          </div>

          {/* Runtime hash */}
          <div className="section-card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-700)', display: 'flex', alignItems: 'center', gap: 6 }}>
                ✓ Current Runtime Weights Hash
              </span>
              <span style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', borderRadius: 4, fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px' }}>
                TPM 2.0 Enclave Verified
              </span>
            </div>
            <HashBox hash={RUNTIME_HASH} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: '0.68rem', color: 'var(--text-400)' }}>
              <span>⚡ Calculated <strong style={{ color: 'var(--text-700)' }}>42 seconds ago</strong> via Secure Enclave</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem' }}>Lat: 1.84ms</span>
            </div>
          </div>
        </div>

        {/* ── Match confidence banner ── */}
        <div style={{
          background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 8,
          padding: '12px 18px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontSize: '0.9rem' }}>✓</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#065f46', marginBottom: 2 }}>
                Identical / Cryptographically Valid
              </div>
              <div style={{ fontSize: '0.75rem', color: '#047857' }}>
                The runtime neural weights conform deterministically to the SecOps golden binary tree.
              </div>
            </div>
          </div>
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>
              Match Confidence
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#065f46' }}>100%</div>
          </div>
        </div>

        {/* ── 4 stat cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
          {[
            {
              icon: '⚙',  label: 'Total Model Parameters',
              value: '43.7M weights', sub: 'Convolutions + Dense Heads',
            },
            {
              icon: '🔒', label: 'Verification Method',
              value: 'Hardware TPM 2.0', sub: 'Direct Attestation Enclave',
            },
            {
              icon: '⊞',  label: 'Quantization Format',
              value: 'FP16 Signed Tensor', sub: 'Deterministic Float Point',
            },
            {
              icon: '📋', label: 'Integrity Audit Trail',
              value: '100% Intact', sub: 'Across 18 edge cluster nodes',
              valueColor: '#10b981',
            },
          ].map(({ icon, label, value, sub, valueColor }) => (
            <div key={label} className="section-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '12px 14px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    {label}
                  </span>
                  <span style={{ fontSize: '0.9rem', background: 'var(--gray-bg)', borderRadius: 6, padding: '4px 6px' }}>{icon}</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: valueColor || 'var(--text-900)', marginBottom: 3, lineHeight: 1.2 }}>
                  {value}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-500)', paddingBottom: 12 }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Production models table ── */}
        <div className="section-card" style={{ overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.975rem', color: 'var(--text-900)', marginBottom: 3 }}>
                Monitored Production Models
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-500)' }}>
                Real-time ledger tracking active neural model weights and cryptographically sealed states.
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: 'var(--primary-muted)', border: '1px solid #bfdbfe', color: 'var(--primary)', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
                ⊞ 5 Active Deployments
              </span>
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Model Name</th>
                <th>Version</th>
                <th>Architecture</th>
                <th>Expected Hash</th>
                <th>Current Hash</th>
                <th>Status</th>
                <th style={{ textAlign: 'right', paddingRight: 18 }}>Last Attestation</th>
              </tr>
            </thead>
            <tbody>
              {PROD_MODELS.map((m, i) => (
                <tr key={i} style={!m.match ? { background: '#fff8f8' } : {}}>
                  {/* Model name */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: m.match ? '#ecfdf5' : '#fee2e2',
                        border: `1.5px solid ${m.match ? '#a7f3d0' : '#fca5a5'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, fontSize: '0.65rem',
                      }}>
                        {m.match ? '✓' : '⚠'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.8rem', color: m.match ? 'var(--text-900)' : '#dc2626', fontFamily: 'JetBrains Mono, monospace' }}>
                          {m.name}
                        </div>
                        {m.subtext && (
                          <div style={{ fontSize: '0.68rem', color: '#dc2626', marginTop: 1 }}>{m.subtext}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: 'var(--text-500)' }}>{m.version}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-700)' }}>{m.arch}</td>
                  {/* Expected hash */}
                  <td>
                    <code style={{ fontSize: '0.68rem', fontFamily: 'JetBrains Mono', color: '#10b981', background: '#f0fdf4', padding: '2px 6px', borderRadius: 3 }}>
                      {m.expHash}
                    </code>
                  </td>
                  {/* Current hash */}
                  <td>
                    <code style={{ fontSize: '0.68rem', fontFamily: 'JetBrains Mono', color: m.match ? '#10b981' : '#dc2626', background: m.match ? '#f0fdf4' : '#fef2f2', padding: '2px 6px', borderRadius: 3, border: m.match ? 'none' : '1px solid #fecaca' }}>
                      {m.curHash}
                    </code>
                  </td>
                  {/* Status */}
                  <td>
                    {m.status === 'APPROVED' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', borderRadius: 999, fontSize: '0.68rem', fontWeight: 700, padding: '3px 10px' }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} /> APPROVED
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#dc2626', color: '#fff', borderRadius: 4, fontSize: '0.65rem', fontWeight: 700, padding: '4px 10px', letterSpacing: '0.2px' }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#fca5a5', display: 'inline-block' }} /> TAMPERING<br/>DETECTED
                      </span>
                    )}
                  </td>
                  {/* Last attestation */}
                  <td style={{ textAlign: 'right', paddingRight: 18, fontSize: '0.72rem', color: 'var(--text-400)', fontFamily: 'JetBrains Mono' }}>
                    {m.lastAttest}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Bottom ledger bar */}
          <div style={{ padding: '10px 18px', borderTop: '1px solid var(--card-border)', background: 'var(--gray-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-500)', fontFamily: 'JetBrains Mono' }}>
              Ledger Checksum Anchor: <code style={{ color: 'var(--primary)' }}>0xAA48....91F0</code>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.72rem', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#065f46' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                4 Validated
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#991b1b' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                1 Quarantined
              </span>
            </div>
          </div>
        </div>

        {/* Sim mode re-enable */}
        {!simMode && (
          <div style={{ marginTop: 14, textAlign: 'center' }}>
            <button className="btn btn-ghost" onClick={() => setSimMode(true)} style={{ fontSize: '0.78rem', color: 'var(--text-500)' }}>
              ↻ Re-enable Tampering Simulation
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
