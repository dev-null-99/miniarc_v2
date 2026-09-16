import { Link, useNavigate } from 'react-router-dom'
import { GAMES } from '../lib/games'

// ── SVG Icons ──────────────────────────────────────────
function IconShield() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
}

function IconTrophy() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="11"/>
      <path d="M7 4H4a2 2 0 0 0-2 2v1a4 4 0 0 0 4 4h.5"/>
      <path d="M17 4h3a2 2 0 0 1 2 2v1a4 4 0 0 1-4 4h-.5"/>
      <path d="M7 4a5 5 0 0 0 10 0H7z"/>
    </svg>
  )
}

function IconGamepad() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/>
      <circle cx="15" cy="11" r="1"/><circle cx="17" cy="13" r="1"/>
      <path d="M6 20h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"/>
    </svg>
  )
}

function IconArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  )
}

// ── Controller SVG ──────────────────────────────────────
function ControllerArt() {
  return (
    <svg
      viewBox="0 0 260 150"
      style={{ width: 280, height: 160, animation: 'float 3s ease-in-out infinite' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a2234" />
          <stop offset="100%" stopColor="#0d1117" />
        </linearGradient>
        <linearGradient id="padEdge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e63946" />
          <stop offset="50%" stopColor="#f4a261" />
          <stop offset="100%" stopColor="#3a86ff" />
        </linearGradient>
      </defs>
      <path
        d="M62 34h136c26 0 44 22 50 54 5 27-6 44-24 44-16 0-24-14-38-20-12-5-24-6-56-6s-44 1-56 6c-14 6-22 20-38 20-18 0-29-17-24-44 6-32 24-54 50-54z"
        fill="url(#pad)" stroke="url(#padEdge)" strokeWidth="2.5"
      />
      <rect x="66" y="72" width="34" height="9" rx="4.5" fill="#3a86ff" />
      <rect x="78" y="60" width="9"  height="34" rx="4.5" fill="#3a86ff" />
      <circle cx="176" cy="66" r="8" fill="#e63946" />
      <circle cx="196" cy="82" r="8" fill="#f4a261" />
      <circle cx="156" cy="82" r="8" fill="#2ec4b6" />
      <circle cx="176" cy="98" r="8" fill="#7b2d8b" />
      <rect x="112" y="70" width="14" height="6" rx="3" fill="#2d4a8a" />
      <rect x="134" y="70" width="14" height="6" rx="3" fill="#2d4a8a" />
    </svg>
  )
}

// ── Features Data ───────────────────────────────────────
const FEATURES = [
  { Icon: IconShield, title: 'Secure Accounts',    body: 'Your scores and progress saved safely to your account.',      color: '#2ec4b6', count: null   },
  { Icon: IconTrophy, title: 'Live Leaderboards',  body: 'Every run ranked. Climb the podium across all game boards.',  color: '#f4a261', count: 14     },
  { Icon: IconGamepad,title: '14 Games',           body: 'Arcade classics rebuilt with custom art and animation.',      color: '#3a86ff', count: 14     },
]

// ── Landing Page ────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>

      {/* Navbar */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 72,
        background: 'rgba(8,11,20,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div className="logo">
          <span>MINI</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#f4a261" style={{ margin: '0 2px' }}>
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          <span>ARCADE</span>
        </div>
        <nav style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/login"  className="btn btn-ghost btn-pill" style={{ height: 38, padding: '0 20px', fontSize: 14 }}>Login</Link>
          <Link to="/signup" className="btn btn-primary btn-pill" style={{ height: 38, padding: '0 20px', fontSize: 14 }}>Sign Up</Link>
        </nav>
      </header>

      {/* Hero */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <section style={{
          minHeight: 'calc(100vh - 72px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', position: 'relative', paddingBottom: 60,
        }}>
          {/* Glow orbs */}
          <div style={{ position: 'absolute', top: '20%', left: '-80px', width: 300, height: 300, borderRadius: '50%', background: 'rgba(230,57,70,0.12)', filter: 'blur(80px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '20%', right: '-80px', width: 300, height: 300, borderRadius: '50%', background: 'rgba(58,134,255,0.12)', filter: 'blur(80px)', pointerEvents: 'none' }} />

          {/* Controller */}
          <div style={{ marginBottom: 32 }}>
            <ControllerArt />
          </div>

          {/* Heading */}
          <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 900, lineHeight: 1, marginBottom: 24 }}>
            {[
              { text: 'PLAY.',     gradient: 'linear-gradient(90deg,#e63946,#f4a261)', delay: '0.1s' },
              { text: 'COMPETE.', gradient: 'linear-gradient(90deg,#f4a261,#3a86ff)', delay: '0.35s' },
              { text: 'WIN.',      gradient: 'linear-gradient(90deg,#3a86ff,#e040fb)', delay: '0.6s' },
            ].map(({ text, gradient, delay }) => (
              <span key={text} style={{
                display: 'block',
                fontSize: 'clamp(48px, 10vw, 96px)',
                background: gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: `word-in 0.6s ease ${delay} both`,
              }}>{text}</span>
            ))}
          </h1>

          {/* Subheading */}
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 18,
            color: 'var(--muted)', maxWidth: 480, marginBottom: 40,
            animation: 'word-in 0.6s ease 0.85s both',
          }}>
            14 handcrafted games. Real leaderboards. Zero downloads.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16, animation: 'word-in 0.6s ease 1s both' }}>
            <button
              className="btn btn-primary btn-pill"
              style={{ height: 56, padding: '0 32px', fontSize: 16, boxShadow: '0 8px 34px rgba(230,57,70,0.35)' }}
              onClick={() => navigate('/games')}
            >
              Start Playing Free <IconArrow />
            </button>
            <button
              className="btn btn-ghost btn-pill"
              style={{ height: 56, padding: '0 32px', fontSize: 16 }}
              onClick={() => navigate('/login')}
            >
              Login to Your Account
            </button>
          </div>

          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'var(--dim)', animation: 'word-in 0.6s ease 1.1s both' }}>
            No account needed to play as guest
          </p>
        </section>

        {/* Features */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, paddingBottom: 64 }}>
          {FEATURES.map(({ Icon, title, body, color, count }, i) => (
            <div key={title} className="card" style={{ animation: `slideInUp 0.5s ease ${i * 0.12}s both` }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: `${color}22`, color, boxShadow: `0 0 24px ${color}33`, marginBottom: 16,
              }}>
                <Icon />
              </div>
              <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{title}</h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>{body}</p>
              {count && (
                <p style={{ fontFamily: 'Russo One, sans-serif', fontSize: 28, color, marginTop: 12 }}>
                  {count}<span style={{ fontFamily: 'Inter', fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>
                    {title.includes('Game') ? 'games' : 'boards'}
                  </span>
                </p>
              )}
            </div>
          ))}
        </section>

        {/* Game Strip */}
        <section style={{ paddingBottom: 80 }}>
          <p style={{ textAlign: 'center', fontFamily: 'Orbitron, sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: '0.3em', color: 'var(--dim)', marginBottom: 24 }}>
            IN THE CABINET
          </p>
          <div className="marquee-wrap">
            <div className="marquee-track">
              {[...GAMES, ...GAMES].map((g, i) => (
                <span key={`${g.id}-${i}`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', borderRadius: 999,
                  border: `1px solid ${g.color}55`,
                  color: g.color, background: `${g.color}12`,
                  fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 14,
                  whiteSpace: 'nowrap',
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: g.color, display: 'inline-block' }} />
                  {g.name}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '24px',
        textAlign: 'center',
        fontFamily: 'Inter, sans-serif',
        fontSize: 13,
        color: 'var(--dim)',
      }}>
        MiniArcade — built for players who like their pixels sharp.
      </footer>
    </div>
  )
}