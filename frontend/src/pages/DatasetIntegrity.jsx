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
    }}>
      {copied ? '✓' : '⧉'}
    </button>
  )
}

function CountBox({ label, value, color }) {
  return (
    <div style={{
      background: '#F8FAFC', border: `1.5px solid ${color}30`,
      borderTop: `3px solid ${color}`,
      borderRadius: 8, padding: '16px 18px', textAlign: 'center', flex: 1
    }}>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color, lineHeight: 1, marginBottom: 4 }}>
        {value ?? '—'}
      </div>
      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </div>
    </div>
  )
}

export default function DatasetIntegrity() {
  const [datasets, setDatasets] = useState([])
  const [loading, setLoading]   = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [verifyResult, setVerifyResult] = useState(null)
  const [error, setError]       = useState('')

  const fetchDatasets = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await api.get('/dataset/versions')
      setDatasets(res.data.datasets || [])
    } catch {
      setError('Failed to load dataset versions from backend.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchDatasets() }, [fetchDatasets])

  async function handleVerify() {
    setVerifying(true); setVerifyResult(null); setError('')
    try {
      const res = await api.get('/dataset/verify')
      setVerifyResult({ ok: !res.data.errors, output: res.data.output, errors: res.data.errors })
    } catch {
      setError('Verification failed — backend error.')
    } finally { setVerifying(false) }
  }

  // Compute counts from dataset statuses
  const verified   = datasets.filter(d => (d.status || '').toUpperCase() === 'VERIFIED').length
  const modified   = datasets.filter(d => /modif/i.test(d.status || '')).length
  const added      = datasets.filter(d => /add/i.test(d.status || '')).length
  const deleted    = datasets.filter(d => /delet/i.test(d.status || '')).length
  const hasViolation = modified > 0 || deleted > 0

  // Determine banner status: use verifyResult if available, else infer from data
  const isVerified = verifyResult
    ? (verifyResult.ok && !verifyResult.errors)
    : (!hasViolation && datasets.length > 0)

  return (
    <div className="page-wrap fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Dataset Integrity</div>
          <div className="page-subtitle">Cryptographic verification of all dataset versions</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={fetchDatasets}>
            <Ico d="M1 4v6h6 M23 20v-6h-6 M20.49 9A9 9 0 0 0 5.64 5.64L1 10 M3.51 15a9 9 0 0 0 14.85 3.36L23 14" size={13} />
            Refresh
          </button>
          <button
            className="btn btn-primary"
            onClick={handleVerify}
            disabled={verifying}
          >
            {verifying
              ? <><span className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> Verifying…</>
              : <><Ico d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" size={14} color="#fff" /> Verify Dataset</>
            }
          </button>
          {hasViolation && (
            <button className="btn btn-danger">
              <Ico d="M3 3v18h18 M3 9l9-7 7 5" size={13} color="#B91C1C" />
              Restore Dataset
            </button>
          )}
        </div>
      </div>

      <ErrorBanner message={error} />

      {/* Status banner */}
      {!loading && (
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className={`status-banner ${isVerified ? 'status-banner-verified' : 'status-banner-violation'}`}>
            <span style={{ fontSize: '1.6rem' }}>{isVerified ? '✅' : '🔴'}</span>
            <div>
              <div>{isVerified ? 'VERIFIED — All datasets intact' : 'VIOLATION DETECTED — Dataset mismatch'}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 400, marginTop: 4, opacity: 0.8 }}>
                Last checked: {new Date().toLocaleString('en-IN', { hour12: false })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Count boxes */}
      <div className="flex gap-4 mb-6" style={{ flexWrap: 'wrap' }}>
        <CountBox label="Verified"  value={verified} color="#16A34A" />
        <CountBox label="Modified"  value={modified} color="#DC2626" />
        <CountBox label="Added"     value={added}    color="#2563EB" />
        <CountBox label="Deleted"   value={deleted}  color="#DC2626" />
        <CountBox label="Total"     value={datasets.length} color="#7C3AED" />
      </div>

      {/* Verify output */}
      {verifyResult && (
        <div className={`alert ${verifyResult.ok && !verifyResult.errors ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>
              {verifyResult.ok && !verifyResult.errors ? '✅ Verification Passed' : '🔴 Verification Issues'}
            </div>
            {verifyResult.output && (
              <pre style={{ fontSize: '0.72rem', marginTop: 4, fontFamily: 'JetBrains Mono', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {verifyResult.output.slice(0, 800)}
              </pre>
            )}
            {verifyResult.errors && (
              <pre style={{ fontSize: '0.72rem', marginTop: 4, fontFamily: 'JetBrains Mono', color: '#B91C1C', whiteSpace: 'pre-wrap' }}>
                {verifyResult.errors.slice(0, 400)}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="card-header">
          <div>
            <div className="card-title">Dataset Versions</div>
            <div className="card-subtitle">All registered dataset snapshots with manifest hashes</div>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748B' }}>{datasets.length} total</span>
        </div>
        {loading ? (
          <Spinner text="Loading datasets…" />
        ) : datasets.length === 0 ? (
          <div className="spinner-wrap" style={{ color: '#94A3B8' }}>
            <span style={{ fontSize: '1.5rem' }}>🗃️</span>
            <span>No dataset versions registered yet</span>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dataset Name</th>
                  <th>Version</th>
                  <th>Files</th>
                  <th>Manifest Hash</th>
                  <th>Created By</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {datasets.map((d, i) => {
                  const statusKey = (d.status || 'VERIFIED').toUpperCase()
                  const isViolation = /modif|delet|fail/i.test(d.status || '')
                  return (
                    <tr key={i} className={isViolation ? 'row-tampered' : ''}>
                      <td style={{ fontWeight: 600, fontSize: '0.82rem' }}>{d.dataset_name}</td>
                      <td>
                        <code style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono', background: '#EFF6FF', color: '#2563EB', padding: '2px 6px', borderRadius: 4 }}>
                          {d.version}
                        </code>
                      </td>
                      <td style={{ fontWeight: 600 }}>{d.total_files?.toLocaleString() ?? '—'}</td>
                      <td>
                        {d.manifest_hash ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <code style={{ fontSize: '0.68rem', fontFamily: 'JetBrains Mono', color: '#334155' }}>
                              {d.manifest_hash.slice(0, 16)}…
                            </code>
                            <CopyBtn text={d.manifest_hash} />
                          </div>
                        ) : '—'}
                      </td>
                      <td style={{ fontSize: '0.78rem' }}>{d.created_by || '—'}</td>
                      <td style={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'JetBrains Mono', whiteSpace: 'nowrap' }}>
                        {d.created_at ? new Date(d.created_at).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td><StatusBadge status={statusKey} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
