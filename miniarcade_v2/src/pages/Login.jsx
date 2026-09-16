import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../lib/api'
import { setAuth } from '../lib/auth'

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

function IconArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  )
}

// ── Floating Shapes (Left Panel) ──
function FloatingShapes() {
  const shapes = [
    { size: 60, top: '15%', left: '20%', color: '#e63946', delay: '0s',   duration: '6s'  },
    { size: 40, top: '60%', left: '60%', color: '#3a86ff', delay: '1s',   duration: '8s'  },
    { size: 80, top: '75%', left: '15%', color: '#2ec4b6', delay: '0.5s', duration: '7s'  },
    { size: 30, top: '30%', left: '70%', color: '#f4a261', delay: '2s',   duration: '5s'  },
    { size: 50, top: '45%', left: '35%', color: '#7b2d8b', delay: '1.5s', duration: '9s'  },
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

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  async function handleLogin() {
    if (!username || !password) return setError('Please fill all fields.')
    setLoading(true)
    setError('')
    try {
      const res = await API.post('/api/auth/login', { username, password })
      setAuth(res.data.token, res.data.username, res.data.user_id)
      navigate('/games')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.')
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
            Welcome back,<br />Player
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: 'var(--muted)', lineHeight: 1.7 }}>
            Ten handcrafted arcade games,<br />
            one profile, one set of<br />
            leaderboards to conquer.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 24, marginTop: 40 }}>
            {[['14', 'Games'], ['10', 'Leaderboards'], ['∞', 'Fun']].map(([num, label]) => (
              <div key={label}>
                <div style={{ fontFamily: 'Russo One, sans-serif', fontSize: 28, color: 'var(--red)' }}>{num}</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'var(--muted)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="auth-right">
        <div className="auth-form">

          {/* Back */}
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontFamily: 'Inter, sans-serif', fontSize: 14, textDecoration: 'none', marginBottom: 8 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Back
          </Link>

          {/* Title */}
          <div>
            <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
              Player Login
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'var(--muted)' }}>
              Sign in to save scores and appear on leaderboards.
            </p>
          </div>

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
                placeholder="Enter username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                autoComplete="username"
              />
            </div>
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
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            className="btn btn-blue"
            style={{ width: '100%', height: 52, fontSize: 16, borderRadius: 12 }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? <div className="loader" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Login'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'var(--dim)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Guest Button */}
          <button
            className="btn btn-ghost"
            style={{ width: '100%', height: 52, fontSize: 15, borderRadius: 12 }}
            onClick={() => navigate('/games')}
          >
            <IconArrow />
            Continue as Guest
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'var(--dim)', marginLeft: 4 }}>
              (scores won't be saved)
            </span>
          </button>

          {/* Signup Link */}
          <p style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'var(--muted)' }}>
            New player?{' '}
            <Link to="/signup" style={{ color: 'var(--yellow)', fontWeight: 600, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
            >
              Create Account →
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}