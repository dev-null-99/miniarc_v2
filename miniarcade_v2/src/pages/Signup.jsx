import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../lib/api'

// ── Icons ──
function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}

function IconLock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2ec4b6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function IconX() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e63946" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

// ── Password Strength ──
function getStrength(password) {
  let score = 0
  if (password.length >= 6)  score++
  if (password.length >= 10) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  return score
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_COLORS = ['', '#e63946', '#f4a261', '#3a86ff', '#2ec4b6']

// ── Floating Shapes ──
function FloatingShapes() {
  const shapes = [
    { size: 60, top: '15%', left: '20%', color: '#2ec4b6', delay: '0s',   duration: '6s' },
    { size: 40, top: '60%', left: '60%', color: '#3a86ff', delay: '1s',   duration: '8s' },
    { size: 80, top: '75%', left: '15%', color: '#e040fb', delay: '0.5s', duration: '7s' },
    { size: 30, top: '30%', left: '70%', color: '#f4a261', delay: '2s',   duration: '5s' },
    { size: 50, top: '45%', left: '35%', color: '#7b2d8b', delay: '1.5s', duration: '9s' },
  ]
  return (
    <>
      {shapes.map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: s.top, left: s.left,
          width: s.size, height: s.size,
          borderRadius: i % 2 === 0 ? '50%' : '12px',
          border: `2px solid ${s.color}44`,
          background: `${s.color}0a`,
          animation: `float ${s.duration} ease-in-out ${s.delay} infinite`,
          pointerEvents: 'none',
        }} />
      ))}
    </>
  )
}

export default function Signup() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  const strength    = getStrength(password)
  const usernameOk  = /^[a-zA-Z0-9]{3,15}$/.test(username)
  const usernameErr = username.length > 0 && !usernameOk

  async function handleSignup() {
    if (!username || !password) return setError('Please fill all fields.')
    if (!usernameOk) return setError('Username: 3-15 characters, letters and numbers only.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    setLoading(true)
    setError('')
    try {
      await API.post('/api/auth/signup', { username, password })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 1800)
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">

      {/* Left Panel */}
      <div className="auth-left">
        <FloatingShapes />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="logo" style={{ marginBottom: 32, fontSize: 24 }}>
            <span>MINI</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#f4a261" style={{ margin: '0 4px' }}>
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            <span>ARCADE</span>
          </div>
          <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 28, fontWeight: 700, marginBottom: 16, lineHeight: 1.3 }}>
            Join the<br />Arcade
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: 'var(--muted)', lineHeight: 1.7 }}>
            Create your free account and<br />
            start competing on live<br />
            leaderboards today.
          </p>

          {/* Perks */}
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              'Save your scores across all 14 games',
              'Appear on live leaderboards',
              'Track your personal bests',
              'Completely free — no credit card',
            ].map((perk) => (
              <div key={perk} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(46,196,182,0.15)', border: '1px solid #2ec4b6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconCheck />
                </div>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'var(--muted)' }}>{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-form">

          {/* Back */}
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontFamily: 'Inter, sans-serif', fontSize: 14, textDecoration: 'none', marginBottom: 8 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to Login
          </Link>

          {/* Title */}
          <div>
            <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
              Create Account
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'var(--muted)' }}>
              Pick a username and password to get started.
            </p>
          </div>

          {/* Success */}
          {success && (
            <div style={{ padding: '14px 16px', background: 'rgba(46,196,182,0.1)', border: '1px solid var(--green)', borderRadius: 10, color: 'var(--green)', fontFamily: 'Inter, sans-serif', fontSize: 14, textAlign: 'center' }}>
              Account created! Redirecting to login...
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ padding: '12px 16px', background: 'rgba(230,57,70,0.1)', border: '1px solid var(--red)', borderRadius: 10, color: 'var(--red)', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
              {error}
            </div>
          )}

          {/* Username */}
          <div>
            <label style={{ display: 'block', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 13, letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>
              USERNAME
            </label>
            <div className="input-wrap">
              <IconUser />
              <input
                className="input"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSignup()}
                autoComplete="username"
                style={{ paddingRight: 44, borderColor: usernameErr ? 'var(--red)' : username.length > 0 && usernameOk ? 'var(--green)' : undefined }}
              />
              {/* Validation icon */}
              {username.length > 0 && (
                <div style={{ position: 'absolute', right: 14 }}>
                  {usernameOk ? <IconCheck /> : <IconX />}
                </div>
              )}
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: usernameErr ? 'var(--red)' : 'var(--dim)', marginTop: 6 }}>
              3-15 characters, letters and numbers only
            </p>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 13, letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>
              PASSWORD
            </label>
            <div className="input-wrap">
              <IconLock />
              <input
                className="input"
                type="password"
                placeholder="Create a password (min 6 chars)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSignup()}
                autoComplete="new-password"
              />
            </div>

            {/* Strength Bar */}
            {password.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div className="strength-bar">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="strength-seg" style={{
                      background: i <= strength ? STRENGTH_COLORS[strength] : 'var(--border)',
                      transition: 'background 0.3s',
                    }} />
                  ))}
                </div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: STRENGTH_COLORS[strength], marginTop: 4 }}>
                  {STRENGTH_LABELS[strength]}
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            className="btn btn-green"
            style={{ width: '100%', height: 52, fontSize: 16, borderRadius: 12 }}
            onClick={handleSignup}
            disabled={loading || success}
          >
            {loading
              ? <div className="loader" style={{ width: 20, height: 20, borderWidth: 2 }} />
              : 'Create Account'
            }
          </button>

          {/* Login Link */}
          <p style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'var(--muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--yellow)', fontWeight: 600, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
            >
              Login →
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}