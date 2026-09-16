import { useNavigate, Link } from 'react-router-dom'
import { GAMES } from '../lib/games'
import { getUser, logout } from '../lib/auth'

// ── Added Premium CSS for Background & Glass Effect ──
const styles = `
  .cyber-bg {
    position: relative; 
    overflow-x: hidden; 
    background: var(--bg); 
    min-height: 100vh;
  }
  
  /* Animated Blobs */
  .bg-blob-1, .bg-blob-2 { 
    position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.35; pointer-events: none; z-index: 0; 
  }
  .bg-blob-1 { 
    top: 5%; left: -10%; width: 500px; height: 500px; background: var(--blue); animation: floatBlob1 20s infinite alternate ease-in-out; 
  }
  .bg-blob-2 { 
    bottom: -10%; right: -5%; width: 600px; height: 600px; background: var(--red); animation: floatBlob2 25s infinite alternate ease-in-out; 
  }
  @keyframes floatBlob1 { 100% { transform: translate(200px, 150px) scale(1.2); } }
  @keyframes floatBlob2 { 100% { transform: translate(-250px, -100px) scale(1.1); } }

  /* 35% Glossy Glass Effect for Cards */
  .glass-card {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    z-index: 1;
  }
`

// ── Navbar ──
function Navbar() {
  const user = getUser()
  const navigate = useNavigate()
  
  // Fetching the avatar from LocalStorage so it matches the Profile page
  const avatar = localStorage.getItem('arcade_avatar')

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar" style={{ position: 'relative', zIndex: 10, background: 'rgba(8,11,20,0.6)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="logo">
        <span>MINI</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#f4a261" style={{ margin: '0 2px' }}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
        <span>ARCADE</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {user ? (
          <>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--bg2), var(--bg))',
              border: '2px solid var(--yellow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 14, color: '#fff',
              overflow: 'hidden', boxShadow: '0 0 10px rgba(244, 162, 97, 0.3)'
            }}>
              {/* If avatar exists, show it. Otherwise show first letter of username */}
              {avatar ? (
                <img src={avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user.username[0].toUpperCase()
              )}
            </div>
            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>
              {user.username}
            </span>
            <Link to="/scores" className="btn btn-ghost" style={{ height: 36, padding: '0 16px', fontSize: 14 }}>
              My Scores
            </Link>
            <button
              className="btn btn-ghost"
              style={{ height: 36, padding: '0 16px', fontSize: 14, color: 'var(--red)', borderColor: 'var(--red)' }}
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login"  className="btn btn-ghost"   style={{ height: 36, padding: '0 16px', fontSize: 14 }}>Login</Link>
            <Link to="/signup" className="btn btn-primary" style={{ height: 36, padding: '0 16px', fontSize: 14 }}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  )
}

// ── Game Art Image ──
function GameArt({ game }) {
  const fallback = `https://ui-avatars.com/api/?name=${game.name.replace(' ','+')}&background=${game.color.replace('#','')}&color=fff&size=200`
  return (
    <img 
      src={game.image || fallback} 
      alt={game.name}
      style={{
        width: '100%', height: '140px', objectFit: 'contain', borderRadius: '12px',
        boxShadow: `0 4px 15px ${game.color}33`, border: `2px solid ${game.color}44`,
        background: 'rgba(0,0,0,0.2)'
      }}
      onError={(e) => { e.target.src = fallback }}
    />
  )
}

// ── Game Card ──
function GameCardItem({ game }) {
  const navigate = useNavigate()
  const isComingSoon = game.comingSoon

  return (
    <div
      className="game-card glass-card"
      onClick={() => { if (!isComingSoon) navigate(`/play/${game.id}`) }}
      style={{ 
        cursor: isComingSoon ? 'not-allowed' : 'pointer',
        opacity: isComingSoon ? 0.75 : 1,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
      onMouseEnter={e => {
        if (isComingSoon) return;
        e.currentTarget.style.borderColor = game.color
        e.currentTarget.style.boxShadow  = `0 15px 30px rgba(0,0,0,0.5), inset 0 0 15px ${game.color}22, 0 0 20px ${game.color}33`
        e.currentTarget.style.transform  = 'translateY(-8px)'
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
      }}
      onMouseLeave={e => {
        if (isComingSoon) return;
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
        e.currentTarget.style.boxShadow  = 'none'
        e.currentTarget.style.transform  = 'translateY(0)'
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
      }}
    >
      {isComingSoon && (
        <div style={{
          position: 'absolute', top: 18, right: -30, background: 'var(--red)',
          color: 'white', fontSize: 11, fontFamily: 'Russo One, sans-serif', 
          padding: '4px 32px', transform: 'rotate(45deg)', zIndex: 10, 
          boxShadow: '0 2px 10px rgba(0,0,0,0.5)', letterSpacing: '1px'
        }}>
          SOON
        </div>
      )}

      <div style={{ padding: '12px 12px 0 12px', filter: isComingSoon ? 'grayscale(0.9) blur(1.5px)' : 'none' }}>
        <GameArt game={game} />
      </div>

      <div className="game-card-info" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="game-card-name" style={{ color: '#fff', textShadow: `0 0 10px ${game.color}44` }}>{game.name}</div>
        <div className="game-card-desc" style={{ flex: 1 }}>{game.desc}</div>
        <button
          className="btn"
          disabled={isComingSoon}
          style={{
            width: '100%', height: 40, marginTop: 12,
            background: isComingSoon ? 'rgba(255,255,255,0.05)' : `${game.color}15`,
            color: isComingSoon ? 'var(--muted)' : game.color,
            border: isComingSoon ? '1px dashed var(--dim)' : `1px solid ${game.color}44`,
            borderRadius: 10, fontSize: 14,
            fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
            cursor: isComingSoon ? 'not-allowed' : 'pointer',
            transition: 'background 0.3s'
          }}
          onMouseOver={e => { if(!isComingSoon) e.currentTarget.style.background = `${game.color}33` }}
          onMouseOut={e => { if(!isComingSoon) e.currentTarget.style.background = `${game.color}15` }}
        >
          {isComingSoon ? 'COMING SOON' : 'PLAY NOW →'}
        </button>
      </div>
    </div>
  )
}

// ── Guest Banner ──
function GuestBanner({ user }) {
  const navigate = useNavigate()
  if (user) return null
  return (
    <div className="guest-banner" style={{ background: 'rgba(244, 162, 97, 0.1)', backdropFilter: 'blur(10px)', borderTop: '1px solid var(--yellow)', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--yellow)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      <span style={{ color: 'var(--yellow)', fontWeight: 600 }}>Playing as guest — scores won't be saved</span>
      <button className="btn btn-primary btn-pill" style={{ height: 32, padding: '0 16px', fontSize: 13, background: 'var(--yellow)', color: '#000', border: 'none' }} onClick={() => navigate('/login')}>
        Login to Save
      </button>
    </div>
  )
}

// ── Menu Page ──
export default function Menu() {
  const user = getUser()

  return (
    <div className="cyber-bg" style={{ paddingBottom: user ? 20 : 80 }}>
      <style>{styles}</style>
      
      {/* Background Blobs added here */}
      <div className="bg-blob-1" />
      <div className="bg-blob-2" />

      <Navbar />

      <div className="page" style={{ position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', padding: '40px 24px 24px' }}>
          <h1 style={{
            fontFamily: 'Orbitron, sans-serif', fontWeight: 900,
            fontSize: 'clamp(24px, 5vw, 42px)',
            background: 'linear-gradient(135deg, #fff, #aaa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            marginBottom: 8, textShadow: '0 0 20px rgba(255,255,255,0.2)'
          }}>
            CHOOSE YOUR GAME
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: 'var(--muted)' }}>
            Select a game to start playing
          </p>
        </div>

        <div className="games-grid" style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 10 }}>
          {GAMES.map((game, i) => (
            <div key={game.id} style={{ animation: `slideInUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${i * 0.05}s both` }}>
              <GameCardItem game={game} />
            </div>
          ))}
        </div>
      </div>

      <GuestBanner user={user} />
    </div>
  )
}