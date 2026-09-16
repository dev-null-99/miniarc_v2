import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { GAMES } from '../lib/games'
import { getUser } from '../lib/auth'
import API from '../lib/api'

// ── Games Import ──
import TicTacToe    from '../games/TicTacToe'
import MemoryMatch  from '../games/MemoryMatch'
import Snake        from '../games/Snake'
import Game2048     from '../games/Game2048'
import Quiz         from '../games/Quiz'
              //import Flappy       from '../games/Flappy'
import BrickBreaker from '../games/BrickBreaker'
import ColorMatch   from '../games/ColorMatch'

const GAME_COMPONENTS = {
  tictactoe:    TicTacToe,
  memory:       MemoryMatch,
  snake:        Snake,
  '2048':       Game2048,
  quiz:         Quiz,
              //flappy:       Flappy,
  brickbreaker: BrickBreaker,
  colormatch:   ColorMatch,
}


const INSTRUCTIONS = {
  tictactoe:    { title: 'Tic Tac Toe',       controls: 'Click any cell to place your mark.', rules: ['Get 3 in a row to win', 'Choose vs Player or vs Computer', 'Select AI difficulty before starting'] },
  numguess:     { title: 'Number Guess',       controls: 'Type your guess and press Enter or click Guess.', rules: ['A secret number is chosen between 1 and 100', 'After each guess you get Higher or Lower hint', 'Fewer attempts = higher score'] },
  memory:       { title: 'Memory Match',       controls: 'Click cards to flip them.', rules: ['Find all matching pairs', 'Two cards flip at a time', 'Fewer moves = higher score'] },
  rps:          { title: 'Rock Paper Scissors',controls: 'Click Rock, Paper or Scissors button.', rules: ['You play against the computer', 'Rock beats Scissors', 'Paper beats Rock', 'Scissors beats Paper', 'Build a win streak for bonus points'] },
  wordguess:    { title: 'Word Guess',         controls: 'Click letters or use your keyboard.', rules: ['Pick a category first', 'Guess the hidden word letter by letter', 'You have 6 wrong guesses before losing', 'Fewer mistakes = higher score'] },
  snake:        { title: 'Snake',              controls: 'Arrow keys or WASD to move. Space to pause. On mobile use D-pad buttons.', rules: ['Eat the glowing orb to grow and score', 'Do not hit the walls or yourself', 'Speed increases every 5 foods'] },
  '2048':       { title: '2048',               controls: 'Arrow keys to slide. On mobile swipe in any direction.', rules: ['Slide tiles to merge matching numbers', 'Reach the 2048 tile to win', 'Game ends when no moves remain'] },
  quiz:         { title: 'Quiz Game',          controls: 'Click an answer option. Timer runs automatically.', rules: ['10 questions per round', '15 seconds per question', 'Correct answer = 100 pts + time bonus', 'Pick a category before starting'] },
  flappy:       { title: 'Flappy Mini',        controls: 'Space bar or click to flap. On mobile tap anywhere.', rules: ['Fly through the gaps between pipes', 'Each pipe passed = 1 point', 'Hit a pipe or ground = game over'] },
  brickbreaker: { title: 'Brick Breaker',      controls: 'Mouse or touch to move the paddle. Space to launch ball.', rules: ['Break all bricks to complete the level', 'Catch power-ups for special abilities', 'Do not let the ball fall below the paddle'] },
  whackamole:   { title: 'Whack-a-Mole',       controls: 'Click or tap the moles as fast as possible.', rules: ['Moles pop up randomly in 9 holes', 'You have 30 seconds to hit as many as possible', 'Speed increases over time', 'Combo hits give bonus points'] },
  typing:       { title: 'Typing Speed',       controls: 'Just start typing — no clicking needed.', rules: ['Type the displayed words as fast as you can', 'You have 60 seconds', 'WPM = Words Per Minute', 'Accuracy must be 90% or above for leaderboard'] },
  colormatch:   { title: 'Color Match',        controls: 'Click the color swatch that matches the WORD not the text color.', rules: ['The word "RED" might be shown in blue', 'Click the actual red color swatch', '3 seconds per question', '20 rounds per game'] },
  reaction:     { title: 'Reaction Time',      controls: 'Click or press Space when the circle turns green.', rules: ['Wait for the circle to turn green', 'Click as fast as possible', 'Clicking too early gives a penalty', '5 rounds — your average time is your score'] },
}

// ── Leaderboard Modal ──
function LeaderboardModal({ gameId, color, onClose }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const user = getUser()
  
  // Get current user's local avatar
  const myAvatar = localStorage.getItem('arcade_avatar')

  useEffect(() => {
    API.get(`/api/leaderboard/${gameId}`)
      .then(res => setEntries(res.data))
      .catch(err => console.error("Error fetching leaderboard:", err))
      .finally(() => setLoading(false))
  }, [gameId])

  return (
    <div className="modal-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', padding: '24px', borderRadius: '16px', width: '380px', border: '1px solid var(--border)', boxShadow: '0 10px 40px rgba(0,0,0,0.6)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
          <h2 style={{ color: color || 'var(--yellow)', margin: 0, fontFamily: 'Orbitron', textShadow: `0 0 10px ${color || 'var(--yellow)'}66`, fontSize: 20 }}>
            LIVE LEADERBOARD
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>✖</button>
        </div>

        {/* Body */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#aaa', padding: '30px' }}>
            <div className="loader" style={{ margin: '0 auto', borderTopColor: color }} />
          </div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#aaa', padding: '30px', fontFamily: 'Inter' }}>No scores yet. Play to be the first! 🏆</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {entries.map((entry, i) => {
              const isMe = user && entry.username === user.username;
              
              // Smart Avatar Logic: Local avatar for me, Unique Bot for others
              const avatarUrl = isMe && myAvatar 
                ? myAvatar 
                : `https://api.dicebear.com/7.x/bottts/svg?seed=${entry.username}&backgroundColor=transparent`;

              // Rank Colors
              let rankColor = 'var(--muted)';
              if (i === 0) rankColor = 'var(--gold)';
              else if (i === 1) rankColor = 'var(--silver)';
              else if (i === 2) rankColor = 'var(--bronze)';

              return (
                <div key={i} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: isMe ? 'rgba(58,134,255,0.1)' : 'var(--bg2)', 
                  padding: '10px 14px', borderRadius: '12px',
                  border: isMe ? '1px solid var(--blue)' : `1px solid ${i < 3 ? rankColor + '44' : 'transparent'}`,
                  boxShadow: isMe ? '0 0 15px rgba(58,134,255,0.2)' : 'none',
                  transition: 'transform 0.2s'
                }} onMouseOver={e => e.currentTarget.style.transform='scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform='scale(1)'}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontFamily: 'Russo One', color: rankColor, width: '24px', fontSize: '15px' }}>
                      #{i + 1}
                    </span>
                    
                    {/* Tiny Avatar Wrapper */}
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '8px', 
                      background: 'rgba(0,0,0,0.5)', border: `1px solid ${rankColor}88`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                    }}>
                      <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <span style={{ color: isMe ? '#fff' : 'var(--text)', fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '16px', letterSpacing: '0.5px' }}>
                      {entry.username} {isMe && <span style={{fontSize: 10, color: 'var(--blue)', verticalAlign: 'top'}}>(YOU)</span>}
                    </span>
                  </div>

                  <span style={{ color: rankColor, fontFamily: 'Russo One', fontSize: '17px', textShadow: `0 0 10px ${rankColor}44` }}>
                    {entry.best_score}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {!user && (
          <p style={{ textAlign: 'center', fontFamily: 'Inter', fontSize: 12, color: 'var(--muted)', marginTop: 20 }}>
            Login to appear on this leaderboard
          </p>
        )}
      </div>
    </div>
  )
}


// ── Instructions Modal ──
function InstructionsModal({ gameId, color, onStart }) {
  const info = INSTRUCTIONS[gameId] || { title: 'How to Play', controls: 'Follow on-screen prompts.', rules: [] }

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 460 }}>

        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${color}22`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 20, color }}>
            How to Play
          </h2>
          <p style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: 18, color: 'var(--text)', marginTop: 4 }}>
            {info.title}
          </p>
        </div>

        {/* Rules */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--muted)', letterSpacing: '0.08em', marginBottom: 10 }}>
            RULES
          </p>
          {info.rules.map((rule, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: `${color}22`, border: `1px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'Russo One, sans-serif', fontSize: 11, color }}>
                {i + 1}
              </div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>{rule}</span>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: '12px 16px', marginBottom: 24 }}>
          <p style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--muted)', letterSpacing: '0.08em', marginBottom: 6 }}>
            CONTROLS
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'var(--text)' }}>
            {info.controls}
          </p>
        </div>

        {/* Start Button */}
        <button
          className="btn btn-primary"
          style={{ width: '100%', height: 52, fontSize: 16, borderRadius: 12 }}
          onClick={onStart}
        >
          Got it! Start Game →
        </button>
      </div>
    </div>
  )
}

// ── Score Saved Toast ──
function ScoreToast({ score, isNewBest, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
      background: isNewBest ? 'rgba(255,215,0,0.15)' : 'rgba(46,196,182,0.15)',
      border: `1px solid ${isNewBest ? 'var(--gold)' : 'var(--green)'}`,
      borderRadius: 12, padding: '14px 24px', zIndex: 300,
      fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 16,
      color: isNewBest ? 'var(--gold)' : 'var(--green)',
      animation: 'bounceIn 0.4s ease',
      whiteSpace: 'nowrap',
    }}>
      {isNewBest ? `🏆 New Personal Best! ${score} pts` : `✓ Score Saved — ${score} pts`}
    </div>
  )
}

// ── Main Game Page ──
export default function GamePage() {
  const { id }                          = useParams()
  const navigate                        = useNavigate()
  const user                            = getUser()
  const [showInstructions, setShowInstructions] = useState(true)
  const [showLeaderboard, setShowLeaderboard]   = useState(false)
  const [showHelp, setShowHelp]                 = useState(false)
  const [toast, setToast]                       = useState(null)
  const [bestScore, setBestScore]               = useState(null)

  const game = GAMES.find(g => g.id === id)

  useEffect(() => {
    if (user && game) {
      API.get('/api/scores/best')
        .then(res => {
          const found = res.data.find(s => s.game_slug === id)
          if (found) setBestScore(found.best_score)
        })
        .catch(() => {})
    }
  }, [id, user])

if (!game) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontFamily: 'Orbitron, sans-serif', color: 'var(--red)' }}>Game not found!</p>
        <button className="btn btn-primary" onClick={() => navigate('/games')}>Back to Menu</button>
      </div>
    )
  }

  const GameComponent = GAME_COMPONENTS[id]

  async function handleScore(score, extraData = null) {
    console.log('=== handleScore called ===')
    console.log('Score:', score)
    console.log('Game ID:', id)
    console.log('User:', user)

    if (!user) {
      console.log('❌ User not logged in')
      return
    }

    if (!score || score <= 0) {
      console.log('❌ Invalid score:', score)
      return
    }

    try {
      console.log('Saving to API...')
      const res = await API.post('/api/scores/save', {
        game_slug:  id,
        score:      Number(score),
        extra_data: extraData || null,
      })
      console.log('✅ Saved:', res.data)

      const isNewBest = bestScore === null || score > bestScore
      if (isNewBest) setBestScore(score)
      setToast({ score, isNewBest })

    } catch (err) {
      console.error('❌ Save error:', err.response?.data || err.message)
    }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Top Bar */}
      <div className="game-topbar">
        <button
          className="btn btn-ghost"
          style={{ height: 36, padding: '0 14px', fontSize: 14, gap: 6 }}
          onClick={() => navigate('/games')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Menu
        </button>

        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: game.color, display: 'inline-block', boxShadow: `0 0 8px ${game.color}` }} />
          {game.name}
        </span>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {user && bestScore !== null && (
            <div className="score-chip" style={{ color: game.color, borderColor: `${game.color}44` }}>
              Best: {bestScore}
            </div>
          )}
          <button
            className="btn btn-ghost"
            style={{ height: 36, padding: '0 12px', fontSize: 14, color: game.color, borderColor: `${game.color}44` }}
            onClick={() => setShowLeaderboard(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="8 21 12 17 16 21"/>
              <line x1="12" y1="17" x2="12" y2="11"/>
              <path d="M7 4H4a2 2 0 0 0-2 2v1a4 4 0 0 0 4 4h.5"/>
              <path d="M17 4h3a2 2 0 0 1 2 2v1a4 4 0 0 1-4 4h-.5"/>
              <path d="M7 4a5 5 0 0 0 10 0H7z"/>
            </svg>
            Board
          </button>
          <button
            className="btn btn-ghost"
            style={{ width: 36, height: 36, padding: 0, borderRadius: '50%', fontSize: 16 }}
            onClick={() => setShowHelp(true)}
          >
            ?
          </button>
        </div>
      </div>

      {/* Game Area */}
      <div className="game-area" style={{ paddingTop: 56 }}>
        {GameComponent
          ? <GameComponent onScore={handleScore} color={game.color} />
          : (
            <div style={{ textAlign: 'center', color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>
              <p style={{ fontSize: 18, marginBottom: 8 }}>Game coming soon!</p>
              <button className="btn btn-primary" onClick={() => navigate('/games')}>Back to Menu</button>
            </div>
          )
        }
      </div>

      {/* Modals */}
      {showInstructions && (
        <InstructionsModal
          gameId={id}
          color={game.color}
          onStart={() => setShowInstructions(false)}
        />
      )}

      {showHelp && (
        <InstructionsModal
          gameId={id}
          color={game.color}
          onStart={() => setShowHelp(false)}
        />
      )}

      {showLeaderboard && (
        <LeaderboardModal
          gameId={id}
          color={game.color}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {toast && (
        <ScoreToast
          score={toast.score}
          isNewBest={toast.isNewBest}
          onDone={() => setToast(null)}
        />
      )}
    </div>
  )
}