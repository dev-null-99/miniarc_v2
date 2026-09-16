import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser } from '../lib/auth'
import API from '../lib/api'
import { GAMES } from '../lib/games'

// ── Default Premium Gaming Avatars ──
const AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Rookie&backgroundColor=transparent',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Sniper&backgroundColor=transparent',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Ninja&backgroundColor=transparent',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Hacker&backgroundColor=transparent',
  'https://api.dicebear.com/7.x/bottts/svg?seed=ProGamer&backgroundColor=transparent',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Legend&backgroundColor=transparent'
]

// ── Ultra Premium Cyberpunk CSS ──
const styles = `
  .cyber-bg { background: var(--bg); min-height: 100vh; position: relative; overflow-x: hidden; }
  
  .bg-blob-1, .bg-blob-2 { position: fixed; border-radius: 50%; filter: blur(80px); opacity: 0.4; pointer-events: none; z-index: 0; }
  .bg-blob-1 { top: 10%; left: 20%; width: 400px; height: 400px; background: var(--blue); animation: floatBlob1 15s infinite alternate ease-in-out; }
  .bg-blob-2 { bottom: 10%; right: 10%; width: 500px; height: 500px; background: var(--red); animation: floatBlob2 20s infinite alternate ease-in-out; }
  @keyframes floatBlob1 { 100% { transform: translate(150px, 100px) scale(1.2); } }
  @keyframes floatBlob2 { 100% { transform: translate(-200px, -50px) scale(1.1); } }

  .glass-panel {
    background: rgba(255, 255, 255, 0.04); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.12); border-top: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 24px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4); position: relative; z-index: 1;
  }
  
  .glass-fx { position: absolute; inset: 0; border-radius: inherit; overflow: hidden; pointer-events: none; z-index: 0; }
  .glass-fx::before {
    content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
    transform: skewX(-20deg); animation: shine 6s infinite;
  }
  @keyframes shine { 100% { left: 200%; } }
  
  .glass-content { position: relative; z-index: 2; }
  
  .hud-card {
    background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%);
    border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; transition: all 0.3s ease; backdrop-filter: blur(8px);
  }
  .hud-card:hover { border-color: var(--hover-color); box-shadow: inset 0 0 20px rgba(0,0,0,0.5), 0 0 15px calc(var(--hover-color) + '44'); transform: translateY(-4px); }
  
  .xp-track { background: rgba(0,0,0,0.6); border-radius: 10px; height: 10px; width: 100%; box-shadow: inset 0 2px 4px rgba(0,0,0,0.8); overflow: hidden; position: relative; }
  .xp-fill { height: 100%; border-radius: 10px; background: linear-gradient(90deg, var(--blue), var(--green), var(--yellow)); box-shadow: 0 0 10px var(--green); transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1); }
  
  /* FIXED: Cyberpunk Scrollbar for Games Tab */
  .game-tabs-container {
    display: flex; gap: 24px; overflow-x: auto; padding-bottom: 12px; scrollbar-width: thin; scrollbar-color: var(--blue) rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.1);
  }
  .game-tabs-container::-webkit-scrollbar { height: 6px; }
  .game-tabs-container::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 10px; }
  .game-tabs-container::-webkit-scrollbar-thumb { background: var(--blue); border-radius: 10px; }
  .game-tabs-container::-webkit-scrollbar-thumb:hover { background: var(--yellow); }
  
  .cyber-tab { position: relative; transition: all 0.3s; white-space: nowrap; flex-shrink: 0; padding-bottom: 4px; }
  .cyber-tab.active { color: var(--active-color); text-shadow: 0 0 10px var(--active-color); }
  .cyber-tab.active::after {
    content: ''; position: absolute; bottom: -8px; left: 10%; width: 80%; height: 3px;
    background: var(--active-color); box-shadow: 0 0 10px var(--active-color); border-radius: 10px;
  }
  .terminal-row { transition: all 0.2s; }
  .terminal-row:hover { background: rgba(255,255,255,0.05) !important; transform: scale(1.01); }
`

// ── Navbar ──
function Navbar() {
  const navigate = useNavigate()
  return (
    <nav className="navbar" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'transparent', position: 'relative', zIndex: 10 }}>
      <div className="logo" style={{ textShadow: '0 0 10px var(--yellow)' }}>
        <span>MINI</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#f4a261" style={{ margin: '0 2px', filter: 'drop-shadow(0 0 5px #f4a261)' }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        <span>ARCADE</span>
      </div>
      <button className="btn btn-ghost" style={{ height: 36, padding: '0 16px', fontSize: 14, background: 'rgba(255,255,255,0.05)' }} onClick={() => navigate('/games')}>[ ESC ] Menu</button>
    </nav>
  )
}

// ── HUD Stat Card ──
function HudCard({ label, value, color, subtitle }) {
  return (
    <div className="hud-card" style={{ padding: '24px', textAlign: 'center', '--hover-color': color }}>
      <div style={{ fontFamily: 'Russo One, sans-serif', fontSize: 42, color: color, textShadow: `0 0 20px ${color}66`, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 16, color: '#fff', letterSpacing: '2px', marginTop: 12 }}>{label}</div>
      {subtitle && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{subtitle}</div>}
    </div>
  )
}

// ── Game Data Arena ──
function GameTab({ game, data, history }) {
  const navigate = useNavigate()
  const hasData = data && data.best_score !== undefined
  return (
    <div className="glass-content" style={{ animation: 'fadeIn 0.5s ease', marginTop: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: `1px solid ${game.color}44`, paddingBottom: 16, marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span style={{ fontFamily: 'Rajdhani, sans-serif', color: game.color, letterSpacing: '4px', fontSize: 12, fontWeight: 700 }}>SELECTED TARGET</span>
          <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 32, color: '#fff', margin: '4px 0 0', textShadow: `0 0 15px ${game.color}66` }}>{game.name}</h2>
        </div>
        <button className="btn" style={{ background: game.color, color: '#000', fontFamily: 'Russo One', boxShadow: `0 0 15px ${game.color}66`, border: 'none', padding: '12px 32px', borderRadius: 8 }} onClick={() => navigate(`/play/${game.id}`)}>
          LAUNCH SEQUENCE 🚀
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, marginBottom: 32 }}>
        <HudCard label="HIGHEST RATING" value={hasData ? data.best_score : '—'} color={game.color} subtitle="Personal Best Score" />
        <HudCard label="DEPLOYMENTS" value={hasData ? data.times_played : '—'} color="var(--blue)" subtitle="Total Matches Played" />
      </div>

      <div className="glass-panel" style={{ borderRadius: 16, padding: 24 }}>
        <div className="glass-fx" />
        <div className="glass-content">
          <h4 style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--muted)', letterSpacing: '2px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, background: 'var(--red)', borderRadius: '50%', animation: 'pulseGlow 2s infinite' }}/>
            LIVE MATCH LOGS
          </h4>
          {!history || history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}><p style={{ fontFamily: 'Orbitron', color: 'var(--muted)', fontSize: 14 }}>NO LOGS DETECTED.</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {history.slice(0, 8).map((row, i) => {
                const isBest = row.score === data?.best_score
                const date = new Date(row.played_at)
                return (
                  <div key={i} className="terminal-row" style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', padding: '12px 16px', background: 'rgba(0,0,0,0.3)', borderRadius: 8, borderLeft: `3px solid ${isBest ? game.color : 'transparent'}`, alignItems: 'center' }}>
                    <span style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--muted)', fontSize: 14 }}>{date.toLocaleDateString([], { month: 'short', day: '2-digit' })} <span style={{ color: '#fff' }}>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span></span>
                    <span style={{ fontFamily: 'Russo One, sans-serif', color: isBest ? game.color : '#fff', fontSize: 20, textAlign: 'center', textShadow: isBest ? `0 0 10px ${game.color}` : 'none' }}>{row.score} PTS</span>
                    <span style={{ width: 100, textAlign: 'right' }}>{isBest && <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 11, background: `${game.color}22`, color: game.color, padding: '4px 8px', borderRadius: 4, border: `1px solid ${game.color}` }}>RECORD</span>}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ──
export default function Scores() {
  const navigate  = useNavigate()
  const user      = getUser()
  const [activeTab,  setActiveTab]  = useState('')
  const [bestScores, setBestScores] = useState([])
  const [history,    setHistory]    = useState([])
  const [loading,    setLoading]    = useState(true)

  // Avatar System State
  const [avatar, setAvatar] = useState(() => localStorage.getItem('arcade_avatar') || AVATARS[0])
  const [showAvatarSelect, setShowAvatarSelect] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    Promise.all([
      API.get('/api/scores/best'),
      API.get('/api/scores/history'),
    ]).then(([bestRes, histRes]) => {
      setBestScores(bestRes.data)
      setHistory(histRes.data)
      if(GAMES.length > 0) setActiveTab(GAMES[0].id)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (!user) return null

  const changeAvatar = (url) => {
    setAvatar(url)
    localStorage.setItem('arcade_avatar', url)
    setShowAvatarSelect(false)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => { changeAvatar(reader.result) }
      reader.readAsDataURL(file)
    }
  }

  const totalPlayed = history.length
  const uniqueGames = [...new Set(history.map(h => h.game_slug))].length
  const userLevel = Math.floor(totalPlayed / 5) + 1
  const xpPercentage = ((totalPlayed % 5) / 5) * 100

  let rankName = 'ROOKIE'; let rankColor = 'var(--muted)'
  if (totalPlayed >= 50) { rankName = 'LEGEND'; rankColor = 'var(--gold)' }
  else if (totalPlayed >= 20) { rankName = 'PRO GAMER'; rankColor = 'var(--yellow)' }
  else if (totalPlayed >= 5) { rankName = 'CHALLENGER'; rankColor = 'var(--blue)' }

  const activeGame = GAMES.find(g => g.id === activeTab)
  const activeData = bestScores.find(s => s.game_slug === activeTab)
  const activeHistory = history.filter(h => h.game_slug === activeTab)

  return (
    <div className="cyber-bg">
      <style>{styles}</style>
      <div className="bg-blob-1" />
      <div className="bg-blob-2" />
      <Navbar />

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px 100px', position: 'relative', zIndex: 5 }}>
        
        {/* Cyberpunk Player ID Card */}
        <div className="glass-panel" style={{ padding: 32, marginBottom: 40, display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="glass-fx" />
          
          <div className="glass-content" style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
            
            {/* Avatar Selector Area */}
            <div style={{ position: 'relative', flexShrink: 0, margin: '10px' }}>
              
              {/* Diamond Container */}
              <div 
                onClick={() => setShowAvatarSelect(!showAvatarSelect)}
                style={{ width: 90, height: 90, borderRadius: 16, background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(20,20,30,0.9))', border: `2px solid ${rankColor}`, boxShadow: `0 0 25px ${rankColor}44`, transform: 'rotate(45deg)', overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <div style={{ transform: 'rotate(-45deg)', width: '142%', height: '142%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={avatar} alt="Avatar" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                </div>
              </div>

              {/* Edit Icon Overlay */}
              <div 
                onClick={() => setShowAvatarSelect(!showAvatarSelect)}
                style={{ position: 'absolute', bottom: -5, right: -5, background: 'var(--bg2)', border: `2px solid ${rankColor}`, borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, color: rankColor, boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}
                title="Edit Avatar"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </div>
              
              {/* FIXED: Dropdown Menu Positioned to the RIGHT */}
              {showAvatarSelect && (
                <div style={{ position: 'absolute', top: 0, left: 130, background: 'rgba(15, 20, 25, 0.95)', backdropFilter: 'blur(10px)', border: '1px solid var(--border)', borderRadius: 12, padding: 12, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, zIndex: 9999, width: 220, boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
                  <div style={{ gridColumn: 'span 3', textAlign: 'center', fontFamily: 'Rajdhani', color: 'var(--muted)', fontSize: 12, marginBottom: 4 }}>SELECT AVATAR</div>
                  {AVATARS.map(url => (
                    <div key={url} onClick={() => changeAvatar(url)} style={{ border: avatar === url ? `2px solid var(--yellow)` : '1px solid var(--border)', borderRadius: 8, padding: 4, cursor: 'pointer', background: 'rgba(255,255,255,0.05)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform='scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform='scale(1)'}>
                      <img src={url} style={{ width: '100%', display: 'block' }} />
                    </div>
                  ))}
                  
                  {/* Custom Upload Button */}
                  <label style={{ gridColumn: 'span 3', background: 'var(--blue)', color: '#fff', textAlign: 'center', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: 'Orbitron', marginTop: '4px', display: 'block' }}>
                    UPLOAD CUSTOM
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                  </label>
                </div>
              )}
            </div>

            {/* User Details & XP */}
            <div style={{ flex: '1 1 300px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 36, margin: 0, textTransform: 'uppercase', textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>{user.username}</h1>
                <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, color: rankColor, padding: '4px 12px', background: `${rankColor}22`, borderRadius: 4, fontSize: 14, border: `1px solid ${rankColor}` }}>{rankName}</span>
              </div>
              
              <div style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Rajdhani', fontSize: 14, fontWeight: 700, color: 'var(--muted)', marginBottom: 6 }}>
                  <span>LVL {userLevel}</span>
                  <span>{totalPlayed % 5} / 5 XP TO NEXT LEVEL</span>
                </div>
                <div className="xp-track"><div className="xp-fill" style={{ width: `${Math.max(xpPercentage, 5)}%` }} /></div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: 'flex', gap: 16, background: 'rgba(0,0,0,0.4)', padding: 16, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ textAlign: 'center', padding: '0 12px' }}>
                <div style={{ fontFamily: 'Russo One', fontSize: 24, color: 'var(--blue)' }}>{totalPlayed}</div>
                <div style={{ fontFamily: 'Rajdhani', fontSize: 11, color: 'var(--muted)', letterSpacing: '1px' }}>TOTAL RUNS</div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ textAlign: 'center', padding: '0 12px' }}>
                <div style={{ fontFamily: 'Russo One', fontSize: 24, color: 'var(--green)' }}>{uniqueGames}</div>
                <div style={{ fontFamily: 'Rajdhani', fontSize: 11, color: 'var(--muted)', letterSpacing: '1px' }}>GAMES PLAYED</div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 100 }}>
            <div className="loader" style={{ margin: '0 auto', width: 40, height: 40, borderTopColor: 'var(--blue)' }} />
            <div style={{ marginTop: 20, fontFamily: 'Orbitron', color: 'var(--blue)', letterSpacing: '4px' }}>ACCESSING DATABASE...</div>
          </div>
        ) : (
          <>
            {/* Cyberpunk Navigation Tabs - Scrollbar Visible Setup */}
            <div className="game-tabs-container">
              {GAMES.map(g => (
                <button
                  key={g.id}
                  className={`cyber-tab ${activeTab === g.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(g.id)}
                  style={{ background: 'none', border: 'none', padding: '8px 0', cursor: 'pointer', fontFamily: 'Russo One, sans-serif', fontSize: 16, textTransform: 'uppercase', letterSpacing: '1px', color: activeTab === g.id ? g.color : 'var(--muted)', '--active-color': g.color }}
                >
                  {g.name}
                </button>
              ))}
            </div>

            {/* Active Game Data */}
            {activeGame && <GameTab game={activeGame} data={activeData} history={activeHistory} />}
          </>
        )}
      </div>
    </div>
  )
}