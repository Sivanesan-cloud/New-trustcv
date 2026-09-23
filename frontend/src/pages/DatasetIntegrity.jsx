import React, { useState, useCallback } from 'react'
import api from '../api/axiosClient'
import StatusBadge from '../components/StatusBadge'

/* ── Mock data that mirrors the screenshot exactly ── */
const MOCK_FILES = [
  {
    name: 'images/train/cam01_frame_04921.png',
    type: 'img',
    baseline: 'e3b0c44298...7852b855',
    computed:  'e3b0c44298...7852b855',
    status: 'UNCHANGED',
  },
  {
    name: 'labels/val/annotation_box_8831.json',
    type: 'json',
    baseline: '7a4f910b88...f1092c41',
    computed:  '99f2b87441...4379e022',
    status: 'MODIFIED',
  },
  {
    name: 'masks/sem/seg_ground_truth_102.png',
    type: 'mask',
    baseline: '(none / baseline new)',
    computed:  '11d7f6c348...ef94821a',
    status: 'ADDED',
  },
  {
    name: 'images/test/night_fog_sensor_091.jpg',
    type: 'img',
    baseline: '58c93b1e84...fe482103',
    computed:  '58c93b1e84...fe482103',
    status: 'UNCHANGED',
  },
  {
    name: 'weights/anchors/kmeans_priors_v4.npy',
    type: 'npy',
    baseline: '4c9829f124...48210381',
    computed:  '4c9829f124...48210381',
    status: 'UNCHANGED',
  },
  {
    name: 'images/val/pedestrian_cross_004.png',
    type: 'img',
    baseline: '66fa902188...41982bca',
    computed:  '66fa902188...41982bca',
    status: 'UNCHANGED',
  },
  {
    name: 'metadata/dataset_provenance_manifest.yaml',
    type: 'yaml',
    baseline: '963210ab78...23ca4199',
    computed:  '(file missing / purged)',
    status: 'DELETED',
  },
]

const FILE_TYPE_ICONS = {
  img: '🖼️', json: '{ }', mask: '▨', npy: '⊞', yaml: '⇌', default: '📄'
}

function parseOutputCounts(output = '') {
  let unchanged = 55394
  let modified  = 1
  let added     = 8
  let deleted   = 0

  const mUnchanged = output.match(/Unchanged\s*:\s*(\d+)/i)
  const mModified  = output.match(/Modified\s*:\s*(\d+)/i)
  const mAdded     = output.match(/Added\s*:\s*(\d+)/i)
  const mDeleted   = output.match(/Deleted\s*:\s*(\d+)/i)

  if (mUnchanged) unchanged = parseInt(mUnchanged[1], 10)
  if (mModified)  modified  = parseInt(mModified[1], 10)
  if (mAdded)     added     = parseInt(mAdded[1], 10)
  if (mDeleted)   deleted   = parseInt(mDeleted[1], 10)

  const total = unchanged + modified + added + deleted
  return { unchanged, modified, added, deleted, total }
}

function parseStatus(output = '') {
  const u = output.toUpperCase()
  if (u.includes('PASS') || u.includes('OK') || u.includes('MATCH')) return 'VERIFIED'
  if (u.includes('FAIL') || u.includes('MISMATCH') || u.includes('TAMPER') || u.includes('VIOLATION') || u.includes('WARN')) return 'VIOLATION'
  return null
}

export default function DatasetIntegrity() {
  const [verifying, setVerifying]   = useState(false)
  const [apiResult, setApiResult]   = useState(null)
  const [apiError,  setApiError]    = useState(null)
  const [activeTab, setActiveTab]   = useState('ALL')
  const [selected,  setSelected]    = useState({})
  const [simToggle, setSimToggle]   = useState('VERIFIED') // 'VERIFIED' | 'VIOLATION'

  const runVerify = useCallback(async () => {
    setVerifying(true)
    setApiResult(null)
    setApiError(null)
    try {
      const { data } = await api.get('/dataset/verify')
      setApiResult(data)
    } catch (err) {
      setApiError(err?.response?.data?.detail || err.message || 'Verification failed.')
    } finally {
      setVerifying(false)
    }
  }, [])

  const filteredFiles = activeTab === 'ALL'
    ? MOCK_FILES
    : MOCK_FILES.filter(f => f.status === activeTab)

  const toggleSelect = (i) =>
    setSelected(prev => ({ ...prev, [i]: !prev[i] }))

  const toggleSim = () =>
    setSimToggle(s => s === 'VERIFIED' ? 'VIOLATION' : 'VERIFIED')

  const currentStatus = apiResult
    ? (parseStatus(apiResult.output || '') || simToggle)
    : simToggle

  const counts = parseOutputCounts(apiResult?.output || '')

  const filterTabs = [
    { key: 'ALL',       label: 'All',       count: counts.total     },
    { key: 'UNCHANGED', label: 'Unchanged', count: counts.unchanged },
    { key: 'MODIFIED',  label: 'Modified',  count: counts.modified  },
    { key: 'ADDED',     label: 'Added',     count: counts.added     },
    { key: 'DELETED',   label: 'Deleted',   count: counts.deleted   },
  ]

  return (
    <div className="fade-in">
      {/* ── Breadcrumb ── */}
      <div className="breadcrumb">
        <span>🔒</span>
        <span>SHA-256 DAG INTEGRITY LAYER</span>
        <span className="breadcrumb-sep">•</span>
        <span className="breadcrumb-sync">SYNC ID: #7829-MRKL</span>
      </div>

      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Dataset Integrity &amp; Cryptographic<br/>Hashing</h1>
          <p>
            Continuous Merkle-tree hashing and tamper detection across training corpus, validation
            splits, and annotation masks.
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary">
            ☁ Upload Baseline Manifest
          </button>
          <button
            className="btn btn-primary"
            id="verify-dataset-btn"
            onClick={runVerify}
            disabled={verifying}
          >
            {verifying ? <><span className="spinner spinner--sm" /> Verifying…</> : '🛡 Verify Dataset'}
          </button>
        </div>
      </div>

      <div className="page-wrap">
        {/* ── API errors ── */}
        {apiError && (
          <div className="alert alert-error mb-16">⚠ {apiError}</div>
        )}

        {/* ════ STATUS PANEL ════ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 16, marginBottom: 20 }}>

          {/* Left: verified badge + dataset info */}
          <div className="section-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <span className="badge-verified-lg" style={{
                background: currentStatus === 'VERIFIED' ? 'var(--green)' : 'var(--red)'
              }}>
                <span className="badge-dot" />
                {currentStatus === 'VERIFIED' ? 'VERIFIED' : 'VIOLATION'}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={toggleSim}
                style={{ fontSize: '0.75rem', color: 'var(--text-500)' }}>
                ↻ Simulate State Toggle
              </button>
            </div>

            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-900)', marginBottom: 6 }}>
              Autonomous-Vision-HQ-2025
            </div>
            <div style={{ display: 'inline-block', fontSize: '0.7rem', color: 'var(--primary)', background: 'var(--primary-muted)', borderRadius: 4, padding: '2px 7px', marginBottom: 12, fontWeight: 600 }}>
              v4.2
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-500)', display: 'flex', gap: 12 }}>
                <span>📁 Total Files: <strong style={{ color: 'var(--text-700)' }}>{counts.total.toLocaleString()}</strong></span>
                <span>• Root: <code style={{ fontSize: '0.7rem', color: 'var(--primary)', fontFamily: 'JetBrains Mono' }}>0x9f4b...38e1</code></span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-500)' }}>
                💾 Storage: S3-Encrypted-Vault-East
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-500)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🌿 Merkle Tree Depth: <strong style={{ color: 'var(--text-700)' }}>16 layers</strong></span>
                <span style={{ color: 'var(--green)', fontWeight: 600 }}>99.998% Provenance</span>
              </div>
            </div>
          </div>

          {/* Center: stat grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Unchanged', sublabel: 'Hash match verified',   dot: 'green', value: counts.unchanged.toLocaleString() },
              { label: 'Modified',  sublabel: 'Zero drift detected',   dot: 'blue',  value: counts.modified.toLocaleString()  },
              { label: 'Added',     sublabel: 'Verified additions',    dot: 'blue',  value: counts.added.toLocaleString()     },
              { label: 'Deleted',   sublabel: 'No pruned tensors',     dot: 'gray',  value: counts.deleted.toLocaleString()   },
            ].map(({ label, sublabel, dot, value }) => (
              <div key={label} className="section-card stat-block">
                <div className="stat-label">
                  <span className={`stat-dot stat-dot--${dot}`} />
                  {label}
                </div>
                <div className="stat-value">{value}</div>
                <div className="stat-sub">{sublabel}</div>
              </div>
            ))}
          </div>


          {/* Right: sentinel panel */}
          <div className="section-card" style={{ padding: 16, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-500)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 6 }}>
              SECOPS SENTINEL
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite' }} />
              Live Node
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-500)', lineHeight: 1.5 }}>
              Last verified <strong style={{ color: 'var(--text-700)' }}>2 minutes ago</strong> by<br/>
              SecOps Sentinel (Worker #14).
            </p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-400)' }}>
              Next scheduled scan: in <strong>28 mins</strong>
            </p>
            <button
              className="btn btn-primary btn-sm"
              style={{ marginTop: 4 }}
              onClick={runVerify}
              disabled={verifying}
            >
              {verifying ? <span className="spinner spinner--sm" /> : '↻'} Verify Dataset Now
            </button>

            {/* Show API output if available */}
            {apiResult?.output && (
              <div className="output-block" style={{ marginTop: 8, maxHeight: 80, fontSize: '0.65rem' }}>
                {apiResult.output}
              </div>
            )}
          </div>
        </div>

        {/* ════ FILE TABLE ════ */}
        <div className="section-card">
          {/* Filter bar */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Search */}
            <div className="search-input-wrap" style={{ width: 180 }}>
              <span className="search-icon" style={{ fontSize: '0.8rem', color: 'var(--text-400)' }}>🔍</span>
              <input className="input-field" placeholder="Filter by file" style={{ padding: '5px 10px 5px 28px', fontSize: '0.78rem', height: 30 }} />
            </div>

            {/* Tabs */}
            <div className="filter-tabs">
              {filterTabs.map(({ key, label, count }) => (
                <button
                  key={key}
                  className={`filter-tab ${activeTab === key ? 'filter-tab--active' : ''}`}
                  onClick={() => setActiveTab(key)}
                >
                  {label} ({count.toLocaleString()})
                </button>
              ))}
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
              <select className="input-field" style={{ width: 'auto', padding: '5px 28px 5px 10px', fontSize: '0.75rem', height: 30 }}>
                <option>SHA-256 (Merkle DAG)</option>
                <option>SHA-512</option>
                <option>MD5</option>
              </select>
              <button className="btn btn-secondary btn-sm">⬇ Export CSV</button>
            </div>
          </div>

          {/* Table */}
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}><input type="checkbox" /></th>
                <th>File Name &amp; Storage Path</th>
                <th>Expected Baseline Hash</th>
                <th>Current Computed Hash</th>
                <th>Status</th>
                <th>Cryptographic Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file, i) => {
                const isModified = file.status === 'MODIFIED'
                const isMissing  = file.status === 'DELETED'
                return (
                  <tr key={i} className={isModified ? 'row--modified' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={!!selected[i]}
                        onChange={() => toggleSelect(i)}
                        style={isModified ? { accentColor: 'var(--red)' } : {}}
                      />
                    </td>

                    {/* File name */}
                    <td className="td-filename">
                      <span style={{ marginRight: 6, fontSize: '0.75rem' }}>
                        {FILE_TYPE_ICONS[file.type] || FILE_TYPE_ICONS.default}
                      </span>
                      <span style={{ color: isModified ? 'var(--red)' : 'var(--text-900)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem' }}>
                        {file.name}
                      </span>
                    </td>

                    {/* Baseline hash */}
                    <td className="td-hash">
                      <span style={{ background: file.status === 'ADDED' ? 'transparent' : '#f0fdf4', color: '#166534', padding: '2px 6px', borderRadius: 4, fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace' }}>
                        {file.baseline}
                      </span>
                    </td>

                    {/* Computed hash */}
                    <td className="td-hash">
                      {isMissing ? (
                        <span style={{ fontStyle: 'italic', color: 'var(--text-400)', fontSize: '0.72rem' }}>
                          {file.computed}
                        </span>
                      ) : (
                        <span style={{
                          background: isModified ? '#fef2f2' : '#f0fdf4',
                          color: isModified ? '#991b1b' : '#166534',
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontSize: '0.72rem',
                          fontFamily: 'JetBrains Mono, monospace',
                          border: isModified ? '1px solid #fecaca' : 'none'
                        }}>
                          {file.computed}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td>
                      <StatusBadge status={file.status} size="sm" />
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button className="tbl-action">Inspect<br/>Hash</button>
                        {isModified ? (
                          <button className="tbl-action tbl-action--danger">View<br/>Diff</button>
                        ) : isMissing ? (
                          <button className="tbl-action">View<br/>Log</button>
                        ) : (
                          <button className="tbl-action">View<br/>Diff</button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={6}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Showing <strong>1 to 7</strong> of <strong>{counts.total.toLocaleString()}</strong> files &nbsp;•&nbsp; Merkle Verification DAG: Passed</span>

                    {/* Pagination */}
                    <div className="pagination" style={{ padding: 0 }}>
                      <button className="page-btn page-btn--nav">⟨⟨</button>
                      <button className="page-btn page-btn--nav">⟨</button>
                      <button className="page-btn page-btn--active">1</button>
                      <button className="page-btn">2</button>
                      <button className="page-btn">3</button>
                      <span className="page-dots">…</span>
                      <button className="page-btn">6,893</button>
                      <button className="page-btn page-btn--nav">⟩</button>
                      <button className="page-btn page-btn--nav">⟩⟩</button>
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
