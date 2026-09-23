import React, { useState } from 'react'
import api from '../api/axiosClient'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [form, setForm]     = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // FastAPI OAuth2 expects form-encoded body
      const params = new URLSearchParams()
      params.append('username', form.username)
      params.append('password', form.password)
      const res = await api.post('/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      const { access_token, role } = res.data
      login({ username: form.username, role }, access_token)
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card fade-in">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">🛡️</div>
          <div>
            <div className="login-logo-name">TRUSTCV</div>
            <div className="login-logo-sub">AI Security & Integrity Platform</div>
          </div>
        </div>

        <div className="login-title">Sign in to your workspace</div>
        <div className="login-subtitle">Enter your credentials to access the dashboard.</div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="login-username">Username</label>
            <input
              id="login-username"
              className="form-input"
              type="text"
              placeholder="admin"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full btn-lg"
            style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? (
              <><span className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> Signing in…</>
            ) : (
              '→ Sign In'
            )}
          </button>
        </form>

        <div style={{ marginTop: 24, padding: '12px 14px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', marginBottom: 6 }}>DEMO CREDENTIALS</div>
          <div style={{ fontSize: '0.75rem', color: '#334155', lineHeight: 1.8, fontFamily: 'JetBrains Mono, monospace' }}>
            <div>admin / admin123 <span style={{ color: '#2563EB' }}>(Admin)</span></div>
            <div>operator / op123 <span style={{ color: '#16A34A' }}>(Operator)</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
