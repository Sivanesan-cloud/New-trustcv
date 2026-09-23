import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosClient'
import StatusBadge from '../components/StatusBadge'
import Spinner from '../components/Spinner'
import ErrorBanner from '../components/ErrorBanner'

const Ico = ({ d, size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

function StatCard({ icon, label, value, sub, color = '#2563EB', loading }) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-2">
        <span className="stat-label">{label}</span>
        <div style={{
          width: 34, height: 34, borderRadius: 8,
          background: `${color}18`, border: `1px solid ${color}28`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Ico d={icon} size={15} color={color} />
        </div>
      </div>
      <div className="stat-value" style={{ color: loading ? '#CBD5E1' : color, fontSize: '1.85rem' }}>
        {loading ? '—' : value}
      </div>
      <div className="stat-sub">{sub}</div>
    </div>
  )
}

function HealthPill({ label, ok }) {
  return (
    <span className={`health-pill ${ok ? 'health-pill-ok' : 'health-pill-err'}`}>
      <span className={`health-dot ${ok ? 'health-dot-pulse' : ''}`} />
      {label}
    </span>
  )
}

function fmtDate(str) {
  if (!str) return '—'
  try { return new Date(str).toLocaleString('en-IN', { hour12: false, dateStyle: 'short', timeStyle: 'short' }) }
  catch { return str }
}

export default function Overview() {
  const nav = useNavigate()
  const [stats, setStats]     = useState(null)
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [backendOk, setBackendOk] = useState(false)
  const [dbOk, setDbOk]         = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [sumRes, auditRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/audit/logs'),
      ])
      setStats(sumRes.data)
      const logs = auditRes.data.audit_logs || []
      setActivity(logs.slice(0, 10))
      setBackendOk(true)
      setDbOk(true)
    } catch (e) {
      setError('Could not connect to backend — showing partial data.')
      setBackendOk(false)
      setDbOk(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const s = stats || {}
  const trustScore = s.models
    ? Math.round((s.models.approved / Math.max(s.models.total, 1)) * 100)
    : null

  return (
    <div className="page-wrap fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Overview</div>
          <div className="page-subtitle">Real-time system health and integrity status</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => nav('/dataset')}>
            <Ico d="M9 17H7A5 5 0 0 1 7 7h2 M15 7h2a5 5 0 1 1 0 10h-2 M8 12h8" size={13} />
            Verify Dataset
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => nav('/inference')}>
            <Ico d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" size={13} />
            Run Inference
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => nav('/audit')}>
            <Ico d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" size={13} />
            View Audit Log
          </button>
          <button className="btn btn-secondary btn-sm" onClick={fetchData}>
            <Ico d="M1 4v6h6 M23 20v-6h-6 M20.49 9A9 9 0 0 0 5.64 5.64L1 10 M3.51 15a9 9 0 0 0 14.85 3.36L23 14" size={13} />
            Refresh
          </button>
        </div>
      </div>

      <ErrorBanner message={error} />

      {/* 4 Stat cards */}
      <div className="grid-4 mb-6">
        <StatCard
          icon="M12 2C6.48 2 2 4.24 2 7s4.48 5 10 5 10-2.24 10-5-4.48-5-10-5zM2 17c0 2.76 4.48 5 10 5s10-2.24 10-5M2 12c0 2.76 4.48 5 10 5s10-2.24 10-5"
          label="Dataset Status"
          value={s.datasets ? `${s.datasets.verified}/${s.datasets.total}` : '—'}
          sub="Verified datasets"
          color="#16A34A"
          loading={loading}
        />
        <StatCard
          icon="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          label="Model Status"
          value={s.models ? `${s.models.approved}/${s.models.total}` : '—'}
          sub="Approved models"
          color="#2563EB"
          loading={loading}
        />
        <StatCard
          icon="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4"
          label="Trust Score"
          value={trustScore != null ? `${trustScore}%` : '—'}
          sub={trustScore >= 90 ? 'Excellent' : trustScore >= 70 ? 'Good' : 'Needs attention'}
          color={trustScore >= 90 ? '#16A34A' : trustScore >= 70 ? '#D97706' : '#DC2626'}
          loading={loading}
        />
        <StatCard
          icon="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
          label="Inference Runs"
          value={s.inferences?.total ?? '—'}
          sub="Total executions logged"
          color="#7C3AED"
          loading={loading}
        />
      </div>

      {/* System health strip */}
      <div className="card card-pad-sm mb-6 flex items-center gap-4 flex-wrap" style={{ padding: '14px 20px' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>System Health</span>
        <div style={{ width: 1, height: 16, background: '#E2E8F0' }} />
        <HealthPill label="Backend Connected" ok={backendOk} />
        <HealthPill label="Database Connected" ok={dbOk} />
        {s.audit_logs && (
          <>
            <div style={{ width: 1, height: 16, background: '#E2E8F0' }} />
            <span style={{ fontSize: '0.75rem', color: s.audit_logs.violations > 0 ? '#DC2626' : '#16A34A', fontWeight: 600 }}>
              {s.audit_logs.violations > 0 ? `⚠️ ${s.audit_logs.violations} violations` : '✅ 0 violations'}
            </span>
          </>
        )}
        {s.db_size_mb && (
          <>
            <div style={{ width: 1, height: 16, background: '#E2E8F0' }} />
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>DB: {s.db_size_mb} MB</span>
          </>
        )}
        <div style={{ marginLeft: 'auto' }}>
          <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
            Last updated: {new Date().toLocaleTimeString('en-IN', { hour12: false })}
          </span>
        </div>
      </div>

      {/* Recent activity */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="card-header">
          <div>
            <div className="card-title">Recent Activity</div>
            <div className="card-subtitle">Last 10 audit events from the immutable chain</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => nav('/audit')}>
            View All →
          </button>
        </div>

        {loading ? (
          <Spinner text="Loading activity…" />
        ) : activity.length === 0 ? (
          <div className="spinner-wrap" style={{ color: '#94A3B8' }}>
            <span style={{ fontSize: '1.5rem' }}>📋</span>
            <span>No audit events yet</span>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Asset</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((row, i) => {
                  const isViolation = /fail|block|tamper/i.test(row.action || '')
                  return (
                    <tr key={i} className={isViolation ? 'row-tampered' : ''}>
                      <td className="font-mono text-xs" style={{ color: '#64748B', whiteSpace: 'nowrap' }}>
                        {fmtDate(row.timestamp)}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{row.username || 'system'}</span>
                      </td>
                      <td style={{ maxWidth: 280 }} className="truncate">
                        <span style={{ fontSize: '0.8rem' }}>{row.action}</span>
                      </td>
                      <td>
                        <code style={{ fontSize: '0.68rem', fontFamily: 'JetBrains Mono', color: '#2563EB', background: '#EFF6FF', padding: '2px 6px', borderRadius: 4 }}>
                          {row.asset_id ? (row.asset_id.length > 20 ? row.asset_id.slice(0, 20) + '…' : row.asset_id) : '—'}
                        </code>
                      </td>
                      <td>
                        <StatusBadge status={isViolation ? 'BLOCKED' : 'VERIFIED'} />
                      </td>
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
