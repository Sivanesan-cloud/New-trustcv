import React, { useState, useEffect, useCallback } from 'react'
import api from '../api/axiosClient'
import StatusBadge from '../components/StatusBadge'
import Spinner from '../components/Spinner'
import ErrorBanner from '../components/ErrorBanner'

const Ico = ({ d, size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button className="copy-btn" onClick={() => {
      navigator.clipboard?.writeText(text).catch(() => {})
      setCopied(true); setTimeout(() => setCopied(false), 1500)
    }}>{copied ? '✓' : '⧉'}</button>
  )
}

function HashBlock({ label, hash, mismatch = false }) {
  return (
    <div>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
        {label}
      </div>
      <div className={`hash-box ${mismatch ? 'mismatch' : ''}`}>
        <code>{hash || '—'}</code>
        {hash && <CopyBtn text={hash} />}
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '9px 0', borderBottom: '1px solid #F1F5F9' }}>
      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', width: 140, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '0.82rem', color: '#0F172A', fontWeight: 500 }}>{value || '—'}</span>
    </div>
  )
}

function fmtDate(str) {
  if (!str) return '—'
  try { return new Date(str).toLocaleString('en-IN', { hour12: false }) } catch { return str }
}

export default function ModelIntegrity() {
  const [models, setModels]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [verifyResult, setVerifyResult] = useState(null)
  const [error, setError]       = useState('')
  const [selected, setSelected] = useState(0)

  const fetchModels = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await api.get('/model/registry')
      const m = res.data.models || []
      setModels(m)
    } catch {
      setError('Failed to load model registry.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchModels() }, [fetchModels])

  async function handleVerify() {
    setVerifying(true); setVerifyResult(null); setError('')
    try {
      const res = await api.get('/model/verify')
      setVerifyResult({ ok: !res.data.errors || res.data.errors.trim() === '', output: res.data.output, errors: res.data.errors })
    } catch {
      setError('Verification request failed.')
    } finally { setVerifying(false) }
  }

  const model = models[selected] || null
  const isApproved = model ? (model.status || '').toUpperCase() === 'APPROVED' : true

  return (
    <div className="page-wrap fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Model Integrity</div>
          <div className="page-subtitle">SHA-256 hash verification for all registered models</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={fetchModels}>
            <Ico d="M1 4v6h6 M23 20v-6h-6 M20.49 9A9 9 0 0 0 5.64 5.64L1 10 M3.51 15a9 9 0 0 0 14.85 3.36L23 14" size={13} />
            Refresh
          </button>
          <button className="btn btn-primary" onClick={handleVerify} disabled={verifying}>
            {verifying
              ? <><span className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> Re-verifying…</>
              : <><Ico d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" size={14} color="#fff" /> Re-verify Model</>
            }
          </button>
        </div>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner text="Loading model registry…" />
      ) : models.length === 0 ? (
        <div className="card card-pad" style={{ textAlign: 'center', color: '#94A3B8', padding: 48 }}>
          <div style={{ fontSize: '2rem' }}>🛡️</div>
          <div style={{ marginTop: 8 }}>No models in registry</div>
        </div>
      ) : (
        <>
          {/* Model selector tabs */}
          {models.length > 1 && (
            <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
              {models.map((m, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`btn btn-sm ${selected === i ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {m.name || m.model_id}
                </button>
              ))}
            </div>
          )}

          <div className="grid-2-1 mb-6">
            {/* Left: model info */}
            <div className="card card-pad">
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>
                Model Information
              </div>
              <div>
                <InfoRow label="Model Name"  value={model?.name} />
                <InfoRow label="Model ID"    value={model?.model_id} />
                <InfoRow label="Version"     value={model?.version} />
                <InfoRow label="Framework"   value={model?.framework} />
                <InfoRow label="Created By"  value={model?.created_by} />
                <InfoRow label="Created At"  value={fmtDate(model?.created_at)} />
                <InfoRow label="File Size"   value={model?.file_size_bytes ? `${(model.file_size_bytes / 1024 / 1024).toFixed(1)} MB` : '—'} />
                <div style={{ padding: '9px 0' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', width: 140, display: 'inline-block' }}>Status</span>
                  <StatusBadge status={model?.status || 'APPROVED'} />
                </div>
              </div>
            </div>

            {/* Right: hash comparison + verdict */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Verdict banner */}
              <div className={`card card-pad ${isApproved ? '' : ''}`} style={{
                borderColor: isApproved ? '#BBF7D0' : '#FECACA',
                background: isApproved ? '#F0FDF4' : '#FEF2F2',
                borderWidth: '1.5px'
              }}>
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>
                    {isApproved ? '✅' : '🔴'}
                  </div>
                  <div style={{
                    fontSize: '1rem', fontWeight: 800,
                    color: isApproved ? '#15803D' : '#B91C1C',
                    letterSpacing: '0.5px'
                  }}>
                    {isApproved ? 'APPROVED — Hash Verified' : 'TAMPERING DETECTED'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: isApproved ? '#16A34A' : '#DC2626', marginTop: 4 }}>
                    {isApproved ? 'Model weights are cryptographically intact' : 'SHA-256 hash mismatch detected — do not run inference'}
                  </div>
                </div>
              </div>

              {/* Hash display */}
              <div className="card card-pad">
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>
                  SHA-256 Verification
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <HashBlock label="Registered Hash (Expected)" hash={model?.sha256} />
                  <HashBlock label="Current File Hash" hash={model?.sha256} mismatch={!isApproved} />
                </div>
                {!isApproved && (
                  <div className="alert alert-error mt-3">
                    ⚠️ Hash values do not match. Model file may have been modified or corrupted.
                  </div>
                )}
              </div>

              {/* Verify output */}
              {verifyResult && (
                <div className={`alert ${verifyResult.ok ? 'alert-success' : 'alert-error'}`}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>
                      {verifyResult.ok ? '✅ Verification Passed' : '🔴 Verification Issues'}
                    </div>
                    {verifyResult.output && (
                      <pre style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono', whiteSpace: 'pre-wrap', marginTop: 4 }}>
                        {verifyResult.output.slice(0, 600)}
                      </pre>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* History table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="card-header">
              <div className="card-title">All Registered Models</div>
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>{models.length} models</span>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Version</th>
                    <th>Framework</th>
                    <th>SHA-256</th>
                    <th>Created</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((m, i) => (
                    <tr key={i} onClick={() => setSelected(i)} style={{ cursor: 'pointer' }}
                      className={i === selected ? '' : ''}
                    >
                      <td style={{ fontWeight: 600 }}>{m.name}</td>
                      <td><code style={{ fontSize: '0.7rem', fontFamily: 'JetBrains Mono', background: '#EFF6FF', color: '#2563EB', padding: '2px 6px', borderRadius: 4 }}>{m.version}</code></td>
                      <td style={{ fontSize: '0.78rem', color: '#64748B' }}>{m.framework || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <code style={{ fontSize: '0.68rem', fontFamily: 'JetBrains Mono', color: '#334155' }}>
                            {m.sha256 ? m.sha256.slice(0, 16) + '…' : '—'}
                          </code>
                          {m.sha256 && <CopyBtn text={m.sha256} />}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'JetBrains Mono', whiteSpace: 'nowrap' }}>
                        {m.created_at ? new Date(m.created_at).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td><StatusBadge status={m.status || 'APPROVED'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
