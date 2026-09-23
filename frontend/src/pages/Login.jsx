import React, { useState } from 'react'
import axios from 'axios'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [showPw,   setShowPw]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      // FastAPI OAuth2 form login expects application/x-www-form-urlencoded
      const params = new URLSearchParams()
      params.append('username', username)
      params.append('password', password)
      const { data } = await axios.post(
        '/login',
        params,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      )
      localStorage.setItem('trustcv_token', data.access_token)
      localStorage.setItem('trustcv_user',  JSON.stringify({ username, role: data.role || 'ADMIN' }))
      onLogin({ username, token: data.access_token })
    } catch (err) {
      setError(err?.response?.data?.detail || 'Login failed. Check credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Background pattern */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(37,99,235,0.12) 0%, transparent 60%), radial-gradient(circle at 75% 75%, rgba(16,185,129,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 440, padding: '0 20px', position: 'relative', zIndex: 1 }}>
        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 16, padding: '40px 36px', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #2563eb, #10b981)', marginBottom: 14, fontSize: '1.6rem' }}>
              🛡️
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.3rem', color: '#fff', letterSpacing: '-0.3px', marginBottom: 4 }}>
              TRUSTCV
            </div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.5px' }}>
              AI Integrity Suite — Secure Console
            </div>
          </div>

          {/* Enclave badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 8, padding: '8px 12px', marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', flexShrink: 0, animation: 'pulse-dot 2s ease-in-out infinite' }} />
            <span style={{ fontSize: '0.72rem', color: 'rgba(16,185,129,0.9)', fontWeight: 600, letterSpacing: '0.3px' }}>
              Hardware Enclave Active — ED25519 + TPM 2.0
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 6, letterSpacing: '0.3px' }}>
                USERNAME
              </label>
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin / operator1"
                required
                style={{
                  width: '100%', padding: '11px 14px', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 8, color: '#fff', fontSize: '0.875rem',
                  outline: 'none', transition: 'border-color 0.2s',
                  fontFamily: 'Inter, sans-serif',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(37,99,235,0.7)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 6, letterSpacing: '0.3px' }}>
                PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%', padding: '11px 42px 11px 14px', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 8, color: '#fff', fontSize: '0.875rem',
                    outline: 'none', transition: 'border-color 0.2s',
                    fontFamily: 'Inter, sans-serif',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(37,99,235,0.7)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', padding: 0 }}>
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, fontSize: '0.78rem', color: '#fca5a5', display: 'flex', gap: 8, alignItems: 'center' }}>
                ⚠ {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading || !username || !password}
              style={{
                width: '100%', padding: '13px', borderRadius: 9,
                background: loading ? 'rgba(37,99,235,0.5)' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '0.2px', transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading
                ? <><span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Authenticating…</>
                : '🔐 Sign In to Console'
              }
            </button>
          </form>

          {/* Credentials hint */}
          <div style={{ marginTop: 20, padding: '10px 12px', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 8 }}>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Demo Credentials</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { user: 'admin',     pw: 'admin123',    role: 'ADMIN'    },
                { user: 'operator1', pw: 'operator123', role: 'OPERATOR' },
              ].map(({ user, pw, role }) => (
                <button key={user} type="button"
                  onClick={() => { setUsername(user); setPassword(pw) }}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace' }}>
                  {user} / {pw} <span style={{ color: '#10b981', fontSize: '0.65rem', fontWeight: 700 }}>({role})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>
          TRUSTCV v2.4.1 — Cryptographic AI Integrity Platform — PROD-US-EAST
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
