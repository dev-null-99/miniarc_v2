import React, { useEffect, useRef, useState } from 'react'

const W = 480, H = 520
const BRICK_W = 46, BRICK_H = 18, BRICK_PAD = 8
const P_W = 80, P_H = 12, P_Y = H - 40
const BALL_R = 7, BALL_SPEED = 6

const LEVELS = [
  [
    [1,1,1,1,1,1,1,1],
    [1,1,2,2,2,2,1,1],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
  ],
  [
    [2,1,1,1,1,1,1,2],
    [1,0,0,1,1,0,0,1],
    [1,1,1,1,1,1,1,1],
    [1,2,1,1,1,1,2,1],
    [1,1,1,1,1,1,1,1],
  ],
  [
    [0,2,2,0,0,2,2,0],
    [1,1,1,1,1,1,1,1],
    [1,0,0,1,1,0,0,1],
    [1,1,1,1,1,1,1,1],
    [2,1,1,2,2,1,1,2],
    [1,1,1,1,1,1,1,1],
  ],
]

const ROW_COLORS = ['#ff0054','#e040fb','#3a86ff','#00f5d4','#ff9e00','#ffd700']

function initBricks(levelIdx) {
  const bricks = []
  const layout = LEVELS[levelIdx % LEVELS.length]
  const COLS = layout[0].length
  const startX = (W - (COLS * (BRICK_W + BRICK_PAD) - BRICK_PAD)) / 2
  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < COLS; c++) {
      const type = layout[r][c]
      if (type !== 0) {
        bricks.push({
          x: startX + c * (BRICK_W + BRICK_PAD),
          y: r * (BRICK_H + BRICK_PAD) + 60,
          w: BRICK_W, h: BRICK_H,
          alive: true, hp: type,
          color: ROW_COLORS[r % ROW_COLORS.length],
        })
      }
    }
  }
  return bricks
}

export default function BrickBreaker({ onScore, color }) {
  const canvasRef = useRef(null)
  const [uiState, setUiState] = useState('menu')
  const [uiScore, setUiScore] = useState(0)
  const [uiLives, setUiLives] = useState(3)
  const [uiLevel, setUiLevel] = useState(0)

  const eng = useRef({
    pad: { x: W/2 - P_W/2, w: P_W },
    balls: [], bricks: [], powerups: [], particles: [],
    score: 0, lives: 3, level: 0,
    state: 'menu',
  })
  const inp        = useRef({ left:false, right:false, mouse:false, mouseX: W/2 })
const animRef    = useRef(null)
const onScoreRef = useRef(onScore)
useEffect(() => { onScoreRef.current = onScore }, [onScore])

  useEffect(() => {
    const dn = e => {
      if (e.key==='ArrowLeft')  { inp.current.left=true;  inp.current.mouse=false }
      if (e.key==='ArrowRight') { inp.current.right=true; inp.current.mouse=false }
    }
    const up = e => {
      if (e.key==='ArrowLeft')  inp.current.left=false
      if (e.key==='ArrowRight') inp.current.right=false
    }
    window.addEventListener('keydown', dn)
    window.addEventListener('keyup',   up)
    return () => { window.removeEventListener('keydown',dn); window.removeEventListener('keyup',up) }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function spawnParticles(x, y, col) {
      for (let i=0; i<6; i++) {
        eng.current.particles.push({
          x, y,
          vx: (Math.random()-0.5)*6,
          vy: (Math.random()-0.5)*6,
          life: 1, color: col,
        })
      }
    }

    function draw() {
      const e = eng.current
      ctx.fillStyle = 'rgba(8,11,20,0.4)'
      ctx.fillRect(0, 0, W, H)

      // HUD
      ctx.fillStyle = '#fff'
      ctx.font = "bold 13px 'Orbitron',sans-serif"
      ctx.textAlign = 'left'
      ctx.fillText(`SCORE: ${e.score}`, 12, 26)
      ctx.textAlign = 'center'
      ctx.fillStyle = '#8899ac'
      ctx.fillText(`LEVEL ${e.level+1}`, W/2, 26)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#ff0054'
      ctx.fillText(`LIVES: ${'♥'.repeat(e.lives)}`, W-12, 26)
      ctx.textAlign = 'left'

      // Bricks
      e.bricks.forEach(b => {
        if (!b.alive) return
        if (b.hp === 2) {
          ctx.fillStyle = '#8899ac'
          ctx.shadowColor = '#aaa'; ctx.shadowBlur = 4
        } else {
          ctx.fillStyle = b.color
          ctx.shadowColor = b.color; ctx.shadowBlur = 10
        }
        ctx.beginPath()
        ctx.roundRect(b.x, b.y, b.w, b.h, 4)
        ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.18)'
        ctx.beginPath()
        ctx.roundRect(b.x+2, b.y+2, b.w-4, 4, 2)
        ctx.fill()
        ctx.shadowBlur = 0
      })

      // Particles
      e.particles.forEach(p => {
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color; ctx.shadowBlur = 6
        ctx.beginPath()
        ctx.arc(p.x, p.y, 3*p.life, 0, Math.PI*2)
        ctx.fill()
      })
      ctx.globalAlpha = 1; ctx.shadowBlur = 0

      // Powerups
      e.powerups.forEach(p => {
        const cols = { W:'#3a86ff', M:'#00f5d4', F:'#ff9e00' }
        ctx.fillStyle = cols[p.type] || '#fff'
        ctx.shadowColor = cols[p.type]; ctx.shadowBlur = 10
        ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI*2); ctx.fill()
        ctx.fillStyle = '#000'; ctx.shadowBlur = 0
        ctx.font = "bold 11px sans-serif"
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(p.type, p.x, p.y)
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
      })

      // Paddle
      const pg = ctx.createLinearGradient(e.pad.x, 0, e.pad.x+e.pad.w, 0)
      pg.addColorStop(0, '#e040fb'); pg.addColorStop(1, '#3a86ff')
      ctx.fillStyle = pg
      ctx.shadowColor = '#e040fb'; ctx.shadowBlur = 14
      ctx.beginPath(); ctx.roundRect(e.pad.x, P_Y, e.pad.w, P_H, P_H/2); ctx.fill()
      ctx.shadowBlur = 0

      // Balls
      e.balls.forEach(b => {
        ctx.fillStyle = '#fff'
        ctx.shadowColor = '#3a86ff'; ctx.shadowBlur = 12
        ctx.beginPath(); ctx.arc(b.x, b.y, BALL_R, 0, Math.PI*2); ctx.fill()
      })
      ctx.shadowBlur = 0
    }

    function loop() {
      const e = eng.current

      if (e.state === 'playing') {
        // Paddle
        if (!inp.current.mouse) {
          if (inp.current.left)  e.pad.x -= 8
          if (inp.current.right) e.pad.x += 8
        } else {
          const tx = Math.min(Math.max(inp.current.mouseX - e.pad.w/2, 0), W - e.pad.w)
          e.pad.x += (tx - e.pad.x) * 0.3
        }
        e.pad.x = Math.max(0, Math.min(e.pad.x, W - e.pad.w))

        // Particles
        e.particles.forEach(p => { p.x+=p.vx; p.y+=p.vy; p.life-=0.03 })
        e.particles = e.particles.filter(p => p.life > 0)

        // Powerups
        e.powerups.forEach(p => {
          p.y += 2.5
          if (p.y+10 >= P_Y && p.y-10 <= P_Y+P_H && p.x >= e.pad.x && p.x <= e.pad.x+e.pad.w) {
            p.caught = true
            e.score += 50
            if (p.type === 'W') e.pad.w = Math.min(P_W*1.6, W-40)
            if (p.type === 'F') e.fireball = Date.now() + 5000
            if (p.type === 'M') {
              const nb = []
              e.balls.forEach(b => {
                nb.push({ x:b.x, y:b.y, vx:b.vx+2, vy:-BALL_SPEED })
                nb.push({ x:b.x, y:b.y, vx:b.vx-2, vy:-BALL_SPEED })
              })
              e.balls.push(...nb)
            }
          }
        })
        e.powerups = e.powerups.filter(p => !p.caught && p.y < H)

        // Balls
        e.balls.forEach(b => {
          b.x += b.vx; b.y += b.vy

          if (b.x - BALL_R <= 0)  { b.x = BALL_R;   b.vx *= -1 }
          if (b.x + BALL_R >= W)  { b.x = W-BALL_R; b.vx *= -1 }
          if (b.y - BALL_R <= 0)  { b.y = BALL_R;   b.vy *= -1 }

          // Paddle hit
          if (b.vy > 0 && b.y+BALL_R >= P_Y && b.y-BALL_R <= P_Y+P_H && b.x >= e.pad.x && b.x <= e.pad.x+e.pad.w) {
            b.vy = -BALL_SPEED
            b.y  = P_Y - BALL_R
            b.vx = ((b.x - (e.pad.x + e.pad.w/2)) / (e.pad.w/2)) * BALL_SPEED * 0.8
          }

          // Bricks
          for (let i=0; i<e.bricks.length; i++) {
            const bk = e.bricks[i]
            if (!bk.alive) continue
            if (b.x+BALL_R > bk.x && b.x-BALL_R < bk.x+bk.w && b.y+BALL_R > bk.y && b.y-BALL_R < bk.y+bk.h) {
              if (bk.hp > 1) {
                bk.hp--
                spawnParticles(b.x, b.y, '#8899ac')
              } else {
                bk.alive = false
                e.score += 10
                spawnParticles(b.x, b.y, bk.color)
                if (Math.random() < 0.15) {
                  const types = ['W','M','F']
                  e.powerups.push({ x:bk.x+bk.w/2, y:bk.y, type:types[Math.floor(Math.random()*3)] })
                }
              }
              b.vy *= -1
              break
            }
          }
        })

        e.balls = e.balls.filter(b => b.y < H + BALL_R)

        // Sync UI score
        setUiScore(e.score)

        // Life lost
        if (e.balls.length === 0) {
          e.lives--
          e.pad.w = P_W
          e.powerups = []
          setUiLives(e.lives)
         if (e.lives <= 0) {
          e.state = 'gameover'
            setUiState('gameover')
          console.log('Calling onScore:', e.score)
          onScoreRef.current && onScoreRef.current(e.score)
        }else {
            e.balls = [{ x:W/2, y:P_Y-BALL_R-2, vx:3, vy:-BALL_SPEED }]
          }
        }

        // Level complete
        if (e.bricks.length > 0 && e.bricks.every(b => !b.alive)) {
          if (e.level + 1 < LEVELS.length) {
            e.state = 'nextlevel'
            setUiState('nextlevel')
          } else {
            e.state = 'victory'
            setUiState('victory')
            console.log('Calling onScore:', e.score)
            onScoreRef.current && onScoreRef.current(e.score)
          }
        }
      }

      draw()
      animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  function startLevel(restart = false) {
    const e = eng.current
    const lv    = restart ? 0 : (e.state==='nextlevel' ? e.level+1 : 0)
    const score = restart ? 0 : e.score
    const lives = restart ? 3 : e.lives

    eng.current = {
      ...eng.current,
      pad: { x:W/2-P_W/2, w:P_W },
      balls: [{ x:W/2, y:P_Y-BALL_R-2, vx:3, vy:-BALL_SPEED }],
      bricks: initBricks(lv),
      powerups: [], particles: [],
      score, lives, level: lv,
      state: 'playing',
    }
    setUiState('playing')
    setUiScore(score)
    setUiLives(lives)
    setUiLevel(lv)
  }

  function onMove(e) {
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const cx = e.touches ? e.touches[0].clientX : e.clientX
    inp.current.mouseX = (cx - rect.left) * (W / rect.width)
    inp.current.mouse = true
  }

  const OL = { position:'absolute', inset:0, background:'rgba(8,11,20,0.88)', backdropFilter:'blur(6px)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20, borderRadius:14, zIndex:10 }

  return (
    <div style={{ width:W, height:H, background:'#080b14', borderRadius:16, border:`2px solid ${color||'#e040fb'}44`, position:'relative', overflow:'hidden', margin:'0 auto' }}>
      <canvas
        ref={canvasRef} width={W} height={H}
        style={{ width:'100%', height:'100%', cursor:'none', display:'block' }}
        onMouseMove={onMove} onTouchMove={onMove}
      />

      {/* Menu */}
      {uiState === 'menu' && (
        <div style={OL}>
          <h2 style={{ fontFamily:'Orbitron,sans-serif', fontSize:28, fontWeight:900, color:'#00f5d4', textShadow:'0 0 15px #00f5d4', margin:0 }}>
            BRICK BREAKER
          </h2>
          <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', padding:'14px 24px', borderRadius:10, textAlign:'center', display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ fontFamily:'Russo One,sans-serif', fontSize:13, color:'#ccc' }}>🖱 MOUSE or ⌨ ◀ ▶ ARROWS</div>
            <div style={{ fontFamily:'Russo One,sans-serif', fontSize:13, color:'#ccc' }}>
              <span style={{color:'#ff9e00'}}>F</span>=FIREBALL &nbsp;
              <span style={{color:'#00f5d4'}}>M</span>=MULTI &nbsp;
              <span style={{color:'#3a86ff'}}>W</span>=WIDE
            </div>
          </div>
          <button
            onClick={() => startLevel(true)}
            style={{ height:48, padding:'0 36px', borderRadius:10, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.15)', color:'#fff', fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:16, cursor:'pointer', letterSpacing:2 }}
          >
            START GAME →
          </button>
        </div>
      )}

      {/* Next Level */}
      {uiState === 'nextlevel' && (
        <div style={OL}>
          <h2 style={{ fontFamily:'Orbitron,sans-serif', fontSize:24, color:'#3a86ff', margin:0 }}>LEVEL {uiLevel+1} CLEARED!</h2>
          <div style={{ fontFamily:'Russo One,sans-serif', fontSize:20, color:'#fff' }}>SCORE: {uiScore}</div>
          <button onClick={() => startLevel(false)} style={{ height:48, padding:'0 32px', borderRadius:10, background:'rgba(58,134,255,0.15)', border:'1px solid #3a86ff', color:'#fff', fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:16, cursor:'pointer', letterSpacing:2 }}>
            NEXT LEVEL →
          </button>
        </div>
      )}

      {/* Game Over */}
      {uiState === 'gameover' && (
        <div style={OL}>
          <h2 style={{ fontFamily:'Orbitron,sans-serif', fontSize:26, color:'#ff0054', margin:0 }}>GAME OVER</h2>
          <div style={{ fontFamily:'Russo One,sans-serif', fontSize:22, color:'#fff' }}>SCORE: {uiScore}</div>
          <button onClick={() => startLevel(true)} style={{ height:48, padding:'0 32px', borderRadius:10, background:'rgba(255,0,84,0.15)', border:'1px solid #ff0054', color:'#fff', fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:16, cursor:'pointer', letterSpacing:2 }}>
            PLAY AGAIN
          </button>
        </div>
      )}

      {/* Victory */}
      {uiState === 'victory' && (
        <div style={OL}>
          <h2 style={{ fontFamily:'Orbitron,sans-serif', fontSize:24, color:'#ffd700', margin:0 }}>🏆 YOU WON!</h2>
          <div style={{ fontFamily:'Russo One,sans-serif', fontSize:22, color:'#fff' }}>FINAL SCORE: {uiScore}</div>
          <button onClick={() => startLevel(true)} style={{ height:48, padding:'0 32px', borderRadius:10, background:'rgba(255,215,0,0.15)', border:'1px solid #ffd700', color:'#fff', fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:16, cursor:'pointer', letterSpacing:2 }}>
            PLAY AGAIN
          </button>
        </div>
      )}
    </div>
  )
}