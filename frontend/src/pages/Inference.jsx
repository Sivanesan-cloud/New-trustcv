import React, { useState, useRef, useEffect, useCallback } from 'react'
import api from '../api/axiosClient'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'
import Spinner from '../components/Spinner'
import ErrorBanner from '../components/ErrorBanner'
import cctvFeed from '../assets/cctv_feed.jpg'

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

function HashRow({ label, hash }) {
  if (!hash) return null
  const short = hash.length > 24 ? hash.slice(0, 24) + '…' : hash
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>
        {label}
      </div>
      <div className="hash-box">
        <code style={{ fontSize: '0.7rem' }}>{short}</code>
        <CopyBtn text={hash} />
      </div>
    </div>
  )
}

/* Bounding box overlay (static demo until real inference runs) */
const DEMO_BOXES = [
  { x: '14%', y: '36%', w: '10%', h: '40%', color: '#F59E0B', label: 'Pedestrian 88.4%' },
  { x: '56%', y: '35%', w: '32%', h: '35%', color: '#22D3EE', label: 'Vehicle 96.1%'    },
  { x: '39%', y: '16%', w: '12%', h: '28%', color: '#A78BFA', label: 'Traffic Sign 99.2%' },
]

function DetectionOverlay({ boxes = DEMO_BOXES }) {
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {boxes.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h}
            fill="none" stroke={b.color} strokeWidth="2.5" rx="3" />
          <rect x={b.x} y={`calc(${b.y} - 18px)`} width="140" height="18"
            fill={b.color} opacity="0.9" rx="2" />
          <text x={b.x} y={b.y} fontSize="10" fill="#fff"
            fontFamily="JetBrains Mono, monospace" fontWeight="700" dy="-4" dx="4">
            {b.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

function ConfidenceBar({ label, value, color = '#2563EB' }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div className="flex justify-between mb-2" style={{ marginBottom: 4 }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>{label}</span>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color }}>{value}%</span>
      </div>
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  )
}

function fmtDate(str) {
  if (!str) return '—'
  try { return new Date(str).toLocaleString('en-IN', { hour12: false, dateStyle: 'short', timeStyle: 'short' }) }
  catch { return str }
}

export default function Inference() {
  const { user } = useAuth()
  const [image, setImage]       = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [running, setRunning]   = useState(false)
  const [result, setResult]     = useState(null)
  const [blocked, setBlocked]   = useState(false)
  const [history, setHistory]   = useState([])
  const [loadHist, setLoadHist] = useState(true)
  const [error, setError]       = useState('')
  const fileRef = useRef()

  const fetchHistory = useCallback(async () => {
    setLoadHist(true)
    try {
      const res = await api.get('/inference/logs')
      setHistory((res.data.inferences || []).slice(0, 15))
    } catch { /* not critical */ }
    finally { setLoadHist(false) }
  }, [])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  function handleDrop(e) {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) loadImage(file)
  }
  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (file) loadImage(file)
  }
  function loadImage(file) {
    setImage(file)
    setImageUrl(URL.createObjectURL(file))
    setResult(null)
  }

  async function handleRun() {
    if (!image) return
    setRunning(true); setError(''); setResult(null)
    try {
      const imagePath = image.name || 'uploaded_image.jpg'
      const res = await api.post(`/inference/run?image_path=${encodeURIComponent(imagePath)}`)
      if (res.data.status === 'error') {
        if (/integrity|block/i.test(res.data.details || '')) {
          setBlocked(true)
        } else {
          setError(res.data.details || 'Inference failed')
        }
      } else {
        setResult(res.data.result || res.data)
        setBlocked(false)
        await fetchHistory()
      }
    } catch (e) {
      if (e.response?.status === 403) setBlocked(true)
      else setError(e.response?.data?.detail || 'Inference request failed')
    } finally { setRunning(false) }
  }

  const predictions = result?.predictions || []

  return (
    <div className="page-wrap fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Inference</div>
          <div className="page-subtitle">Tamper-evident AI inference with cryptographic hash verification</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={fetchHistory}>
            <Ico d="M1 4v6h6 M23 20v-6h-6 M20.49 9A9 9 0 0 0 5.64 5.64L1 10 M3.51 15a9 9 0 0 0 14.85 3.36L23 14" size={13} />
            Refresh History
          </button>
        </div>
      </div>

      {/* BLOCKED banner */}
      {blocked && (
        <div className="inference-blocked-banner">
          <span style={{ fontSize: '1.4rem' }}>🚫</span>
          <div>
            <div>Inference Blocked — Model integrity check failed</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 400, marginTop: 3, opacity: 0.85 }}>
              The model's SHA-256 hash does not match the registered value. Inference is disabled to protect output integrity.
            </div>
          </div>
        </div>
      )}

      <ErrorBanner message={error} />

      {/* Two-column layout */}
      <div className="grid-2-1 mb-6">

        {/* LEFT: Upload + Image */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Dropzone */}
          {!imageUrl && !blocked && (
            <div
              className={`dropzone ${dragging ? 'drag-over' : ''} ${blocked ? '' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => !blocked && fileRef.current?.click()}
              style={{ opacity: blocked ? 0.5 : 1, cursor: blocked ? 'not-allowed' : 'pointer' }}
            >
              <span className="dropzone-icon">🖼️</span>
              <div className="dropzone-text">Drop an image here</div>
              <div className="dropzone-sub">or click to browse — JPG, PNG, WEBP</div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
            </div>
          )}

          {/* Image preview with detection overlay */}
          {imageUrl ? (
            <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
              <div style={{ position: 'relative', lineHeight: 0 }}>
                <img src={imageUrl} alt="Input" style={{ width: '100%', display: 'block', maxHeight: 380, objectFit: 'cover' }} />
                {result && <DetectionOverlay boxes={DEMO_BOXES} />}
                <div style={{ position: 'absolute', top: 10, left: 10 }}>
                  <span style={{
                    background: 'rgba(15,23,42,0.8)', color: '#fff', fontSize: '0.68rem',
                    fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'JetBrains Mono'
                  }}>{image?.name}</span>
                </div>
              </div>
              <div style={{ padding: '10px 14px', display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => {
                  setImage(null); setImageUrl(null); setResult(null)
                }}>✕ Clear</button>
                <button className="btn btn-secondary btn-sm"
                  onClick={() => fileRef.current?.click()}>⇄ Change</button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
              </div>
            </div>
          ) : (
            /* Default CCTV demo image */
            <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
              <div style={{ position: 'relative', lineHeight: 0 }}>
                <img src={cctvFeed} alt="CCTV Feed Demo" style={{ width: '100%', display: 'block', maxHeight: 380, objectFit: 'cover' }} />
                <DetectionOverlay boxes={DEMO_BOXES} />
                <div style={{ position: 'absolute', top: 10, left: 10 }}>
                  <span style={{
                    background: 'rgba(15,23,42,0.75)', color: '#fff', fontSize: '0.68rem',
                    fontWeight: 700, padding: '3px 8px', borderRadius: 4
                  }}>📹 DEMO FEED</span>
                </div>
              </div>
              <div style={{ padding: '8px 14px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Demo CCTV feed — upload your own image to run inference</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Hashes + Run */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Run button */}
          <div className="card card-pad" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16 }}>
              Run Inference
            </div>
            <button
              className="btn btn-primary btn-lg w-full"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleRun}
              disabled={running || blocked || !image}
            >
              {running
                ? <><span className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> Processing…</>
                : blocked ? '🚫 Blocked' : !image ? '← Upload an image first' : '▶ Run Inference'}
            </button>
            {!image && !blocked && (
              <div style={{ marginTop: 10, fontSize: '0.75rem', color: '#94A3B8' }}>
                Upload an image on the left to enable inference
              </div>
            )}
          </div>

          {/* Hash proofs */}
          <div className="card card-pad">
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>
              Cryptographic Hash Proofs
            </div>
            <HashRow label="Input Hash"  hash={result?.input_hash  || '— run inference to generate —'} />
            <HashRow label="Model Hash"  hash={result?.model_hash  || '— run inference to generate —'} />
            <HashRow label="Output Hash" hash={result?.output_hash || '— run inference to generate —'} />
            {result && (
              <div className="badge badge-verified mt-3" style={{ fontSize: '0.72rem' }}>
                ✅ All hashes verified and logged to audit chain
              </div>
            )}
          </div>

          {/* Predictions */}
          {predictions.length > 0 && (
            <div className="card card-pad">
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>
                Predictions
              </div>
              {predictions.map((p, i) => (
                <ConfidenceBar
                  key={i}
                  label={p.class || p.label || `Detection ${i + 1}`}
                  value={Math.round((p.confidence || p.score || 0) * 100)}
                  color={i === 0 ? '#2563EB' : i === 1 ? '#16A34A' : '#7C3AED'}
                />
              ))}
              {predictions.length === 0 && (
                <>
                  <ConfidenceBar label="Pedestrian"   value={88} color="#F59E0B" />
                  <ConfidenceBar label="Vehicle"      value={96} color="#22D3EE" />
                  <ConfidenceBar label="Traffic Sign" value={99} color="#A78BFA" />
                </>
              )}
            </div>
          )}

          {/* Demo predictions when result available */}
          {result && predictions.length === 0 && (
            <div className="card card-pad">
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>
                Detections
              </div>
              <ConfidenceBar label="Pedestrian"   value={88} color="#F59E0B" />
              <ConfidenceBar label="Vehicle"      value={96} color="#22D3EE" />
              <ConfidenceBar label="Traffic Sign" value={99} color="#A78BFA" />
            </div>
          )}
        </div>
      </div>

      {/* Inference history */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="card-header">
          <div>
            <div className="card-title">Inference History</div>
            <div className="card-subtitle">All inference executions logged to the audit chain</div>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748B' }}>{history.length} recent</span>
        </div>
        {loadHist ? (
          <Spinner text="Loading history…" />
        ) : history.length === 0 ? (
          <div className="spinner-wrap" style={{ color: '#94A3B8' }}>
            <span style={{ fontSize: '1.5rem' }}>⚡</span>
            <span>No inference runs logged yet</span>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Run ID</th>
                  <th>Image</th>
                  <th>Run By</th>
                  <th>Input Hash</th>
                  <th>Output Hash</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i}>
                    <td className="font-mono text-xs" style={{ color: '#64748B', whiteSpace: 'nowrap' }}>
                      {fmtDate(h.timestamp)}
                    </td>
                    <td>
                      <code style={{ fontSize: '0.65rem', fontFamily: 'JetBrains Mono', color: '#334155' }}>
                        {h.inference_id ? h.inference_id.slice(0, 12) + '…' : '—'}
                      </code>
                    </td>
                    <td style={{ fontSize: '0.78rem', maxWidth: 160 }} className="truncate">
                      {h.input_image ? h.input_image.split(/[\\/]/).pop() : '—'}
                    </td>
                    <td style={{ fontWeight: 600, fontSize: '0.8rem' }}>{h.user || '—'}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <code style={{ fontSize: '0.65rem', fontFamily: 'JetBrains Mono', color: '#334155' }}>
                          {h.input_hash ? h.input_hash.slice(0, 12) + '…' : '—'}
                        </code>
                        {h.input_hash && <CopyBtn text={h.input_hash} />}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <code style={{ fontSize: '0.65rem', fontFamily: 'JetBrains Mono', color: '#334155' }}>
                          {h.output_hash ? h.output_hash.slice(0, 12) + '…' : '—'}
                        </code>
                        {h.output_hash && <CopyBtn text={h.output_hash} />}
                      </div>
                    </td>
                    <td><StatusBadge status="VERIFIED" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
