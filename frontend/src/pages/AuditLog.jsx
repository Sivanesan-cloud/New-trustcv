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

function fmtDate(str) {
  if (!str) return '—'
  try { return new Date(str).toLocaleString('en-IN', { hour12: false, dateStyle: 'short', timeStyle: 'short' }) } catch { return str }
}

export default function AuditLog() {
  const [logs, setLogs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [chainOk, setChainOk]   = useState(null)
  const [search, setSearch]     = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [error, setError]       = useState('')

  const fetchLogs = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await api.get('/audit/logs')
      setLogs(res.data.audit_logs || [])
    } catch {
      setError('Failed to load audit logs from backend.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  async function handleVerifyChain() {
    setVerifying(true)
    try {
      // Verify chain integrity by checking hash chain locally
      let ok = true
      for (let i = 1; i < logs.length; i++) {
        if (logs[i].prev_hash !== logs[i - 1].entry_hash) { ok = false; break }
      }
      setChainOk(ok)
    } catch {
      setChainOk(false)
    } finally { setVerifying(false) }
  }

  // Filter logs
  const actionOptions = [...new Set(logs.map(l => l.action).filter(Boolean))].slice(0, 10)
  const filtered = logs.filter(l => {
    const matchSearch = !search ||
      (l.username || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.action   || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.asset_id || '').toLowerCase().includes(search.toLowerCase())
    const matchAction = actionFilter === 'all' || l.action === actionFilter
    return matchSearch && matchAction
  })

  // Detect tampered rows (hash chain broken)
  const tamperedIds = new Set()
  for (let i = 1; i < logs.length; i++) {
    if (logs[i].prev_hash && logs[i - 1].entry_hash &&
        logs[i].prev_hash !== logs[i - 1].entry_hash) {
      tamperedIds.add(logs[i].id)
    }
  }

  return (
    <div className="page-wrap fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Audit Log</div>
          <div className="page-subtitle">Immutable Merkle-chained event ledger</div>
        </div>
        <div className="page-actions">
          {chainOk !== null && (
            <span className={`badge ${chainOk ? 'badge-verified' : 'badge-blocked'}`} style={{ fontSize: '0.78rem', padding: '5px 12px' }}>
              {chainOk ? '✅ Audit Chain Verified' : '🔴 Chain Broken'}
            </span>
          )}
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleVerifyChain}
            disabled={verifying || loading}
          >
            {verifying
              ? <><span className="spinner spinner-sm" /> Verifying…</>
              : <><Ico d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" size={13} /> Verify Chain</>
            }
          </button>
          <button className="btn btn-secondary btn-sm" onClick={fetchLogs}>
            <Ico d="M1 4v6h6 M23 20v-6h-6 M20.49 9A9 9 0 0 0 5.64 5.64L1 10 M3.51 15a9 9 0 0 0 14.85 3.36L23 14" size={13} />
            Refresh
          </button>
        </div>
      </div>

      <ErrorBanner message={error} />

      {/* Search + filter bar */}
      <div className="card card-pad-sm mb-4 flex items-center gap-3 flex-wrap" style={{ padding: '12px 16px' }}>
        <div className="search-wrap" style={{ width: 260 }}>
          <span className="search-icon">
            <Ico d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0" size={13} />
          </span>
          <input
            placeholder="Search by user, action, asset…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="form-input"
          style={{ width: 'auto', padding: '7px 12px', fontSize: '0.8rem' }}
        >
          <option value="all">All Actions</option>
          {actionOptions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#64748B' }}>
          {filtered.length} of {logs.length} entries
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="card-header">
          <div>
            <div className="card-title">Audit Events</div>
            <div className="card-subtitle">Each row is hash-chained to the previous for tamper detection</div>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748B' }}>🔒 Tamper-evident</span>
        </div>

        {loading ? (
          <Spinner text="Loading audit log…" />
        ) : logs.length === 0 ? (
          <div className="spinner-wrap" style={{ color: '#94A3B8' }}>
            <span style={{ fontSize: '1.5rem' }}>📋</span>
            <span>No audit events recorded yet</span>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>🔒</th>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Asset Type</th>
                  <th>Asset ID</th>
                  <th>Entry Hash</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => {
                  const isTampered = tamperedIds.has(row.id)
                  const isAlert = /fail|block|tamper/i.test(row.action || '')
                  return (
                    <tr key={i} className={isTampered ? 'row-tampered' : ''}>
                      <td style={{ width: 28, textAlign: 'center', fontSize: '0.75rem' }}>
                        {isTampered ? '🔴' : '🔒'}
                      </td>
                      <td className="font-mono text-xs" style={{ color: '#64748B', whiteSpace: 'nowrap' }}>
                        {fmtDate(row.timestamp)}
                      </td>
                      <td style={{ fontWeight: 600, fontSize: '0.8rem' }}>{row.username || 'system'}</td>
                      <td>
                        <span style={{
                          fontSize: '0.72rem', fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                          background: isAlert ? '#FEF2F2' : '#F0FDF4',
                          color: isAlert ? '#B91C1C' : '#15803D',
                          border: `1px solid ${isAlert ? '#FECACA' : '#BBF7D0'}`
                        }}>
                          {row.action}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: '#64748B' }}>{row.asset_type || '—'}</td>
                      <td>
                        <code style={{ fontSize: '0.67rem', fontFamily: 'JetBrains Mono', background: '#EFF6FF', color: '#2563EB', padding: '2px 5px', borderRadius: 3 }}>
                          {row.asset_id ? (row.asset_id.length > 18 ? row.asset_id.slice(0, 18) + '…' : row.asset_id) : '—'}
                        </code>
                      </td>
                      <td>
                        <code style={{ fontSize: '0.65rem', fontFamily: 'JetBrains Mono', color: '#94A3B8' }}>
                          {row.entry_hash ? row.entry_hash.slice(0, 14) + '…' : '—'}
                        </code>
                      </td>
                      <td>
                        <StatusBadge status={isTampered ? 'TAMPERED' : isAlert ? 'BLOCKED' : 'VERIFIED'} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length === 0 && logs.length > 0 && (
          <div className="spinner-wrap" style={{ color: '#94A3B8' }}>
            <span>No matching entries</span>
          </div>
        )}
      </div>
    </div>
  )
}
