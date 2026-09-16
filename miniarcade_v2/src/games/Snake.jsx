import { useEffect, useRef, useState } from 'react'

const CELL = 20  // Slightly larger cells
const COLS = 25  // Bigger ground (25x25)
const ROWS = 25

// Random Food Generator (Prevents spawning on snake)
function randFood(snake) {
  let pos
  do {
    pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
  } while (snake.some(s => s.x === pos.x && s.y === pos.y))
  return pos
}

const INIT_SNAKE = [{ x: 12, y: 12 }, { x: 11, y: 12 }, { x: 10, y: 12 }, { x: 9, y: 12 }]
const INIT_DIR   = { x: 1, y: 0 }

export default function Snake({ onScore, color = '#a8e063' }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null) // For swipe detection
  
  // Strict HOD Rule: Canvas games MUST use onScoreRef pattern
  const onScoreRef = useRef(onScore)
  useEffect(() => { onScoreRef.current = onScore }, [onScore])
  
  const gameRef = useRef({
    snake:   INIT_SNAKE.map(s => ({ ...s })),
    dir:     { ...INIT_DIR },
    nextDir: { ...INIT_DIR },
    food:    randFood(INIT_SNAKE),
    score:   0,
    running: false,
    dead:    false,
    mode:    'classic'
  })
  
  const animRef = useRef(null)
  const lastRef = useRef(0)
  const [ui, setUi] = useState({ score: 0, dead: false, started: false, mode: 'classic' })

  function draw(ctx) {
    const g = gameRef.current
    const W = COLS * CELL
    const H = ROWS * CELL

    ctx.clearRect(0, 0, W, H)

    // Deep space premium background
    ctx.fillStyle = '#171b24' 
    ctx.fillRect(0, 0, W, H)

    // Glowing subtle grid (Checkerboard illusion)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.015)'
    for (let i = 0; i < COLS; i++) {
      for (let j = 0; j < ROWS; j++) {
        if ((i + j) % 2 === 0) ctx.fillRect(i * CELL, j * CELL, CELL, CELL)
      }
    }

    // Border styling based on mode
    ctx.strokeStyle = g.mode === 'nowalls' ? 'rgba(255, 255, 255, 0.05)' : `${color}66`
    ctx.lineWidth = g.mode === 'nowalls' ? 2 : 4
    ctx.setLineDash(g.mode === 'nowalls' ? [8, 8] : [])
    ctx.strokeRect(0, 0, W, H)
    ctx.setLineDash([])

    // Draw Food (Pulsing glowing orb)
    const time = Date.now() / 150
    const pulse = Math.abs(Math.sin(time)) * 2
    ctx.fillStyle = '#ff3366'
    ctx.shadowColor = '#ff3366'
    ctx.shadowBlur = 15 + pulse * 5
    ctx.beginPath()
    ctx.arc(g.food.x * CELL + CELL / 2, g.food.y * CELL + CELL / 2, CELL / 2 - 4 + pulse, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0 // Reset shadow

    // Draw Snake
    g.snake.forEach((seg, i) => {
      const isHead = i === 0
      // Gradient effect: Head is bright, tail is darker
      const ratio = 1 - (i / g.snake.length) * 0.7
      const hex   = Math.floor(ratio * 255).toString(16).padStart(2, '0')
      ctx.fillStyle = isHead ? '#ffffff' : `${color}${hex}`
      
      // Slight tapering effect for the tail
      const sizeOffset = isHead ? 0 : Math.min(2, i * 0.1) 
      const sSize = CELL - 2 - sizeOffset

      ctx.beginPath()
      ctx.roundRect(
        seg.x * CELL + 1 + sizeOffset/2, 
        seg.y * CELL + 1 + sizeOffset/2, 
        sSize, sSize, 
        isHead ? 8 : 4
      )
      ctx.fill()

      // Detailed Eyes on the Head
      if (isHead) {
        const d = g.dir
        const eyeOffset = 4
        
        ctx.fillStyle = color // Eyes match theme color
        // Left Eye
        ctx.beginPath()
        ctx.arc(seg.x * CELL + CELL / 2 + d.x * eyeOffset - d.y * eyeOffset, seg.y * CELL + CELL / 2 + d.y * eyeOffset - d.x * eyeOffset, 3, 0, Math.PI * 2)
        ctx.fill()
        // Right Eye
        ctx.beginPath()
        ctx.arc(seg.x * CELL + CELL / 2 + d.x * eyeOffset + d.y * eyeOffset, seg.y * CELL + CELL / 2 + d.y * eyeOffset + d.x * eyeOffset, 3, 0, Math.PI * 2)
        ctx.fill()
        
        // Pupils
        ctx.fillStyle = '#060606'
        ctx.beginPath()
        ctx.arc(seg.x * CELL + CELL / 2 + d.x * (eyeOffset+1) - d.y * eyeOffset, seg.y * CELL + CELL / 2 + d.y * (eyeOffset+1) - d.x * eyeOffset, 1.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(seg.x * CELL + CELL / 2 + d.x * (eyeOffset+1) + d.y * eyeOffset, seg.y * CELL + CELL / 2 + d.y * (eyeOffset+1) + d.x * eyeOffset, 1.5, 0, Math.PI * 2)
        ctx.fill()
      }
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function loop(ts) {
      const g = gameRef.current

      if (g.running && !g.dead) {
        // Speed logic: Gets faster as score increases, capped at 60ms
        const speed = Math.max(60, 140 - Math.floor(g.score / 5) * 5)
        
        if (ts - lastRef.current >= speed) {
          lastRef.current = ts
          g.dir = { ...g.nextDir }

          const head = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y }

          // ── MODE 1: Classic (Die on Wall) ──
          if (g.mode === 'classic') {
            if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
              triggerGameOver(g)
            }
          } 
          // ── MODE 2: No Walls (Wrap Around) ──
          else {
            if (head.x < 0) head.x = COLS - 1
            else if (head.x >= COLS) head.x = 0
            
            if (head.y < 0) head.y = ROWS - 1
            else if (head.y >= ROWS) head.y = 0
          }

          // Self Collision 
          if (!g.dead && g.snake.some(s => s.x === head.x && s.y === head.y)) {
            triggerGameOver(g)
          }

          if (!g.dead) {
            g.snake = [head, ...g.snake] // Add new head

            // Ate Food
            if (head.x === g.food.x && head.y === g.food.y) {
              g.score += 10
              g.food   = randFood(g.snake)
              setUi(u => ({ ...u, score: g.score }))
            } else {
              g.snake.pop() // Remove tail if no food eaten
            }
          }
        }
      }

      draw(ctx)
      animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  function triggerGameOver(g) {
    g.dead = true
    g.running = false
    if (g.score > 0 && onScoreRef.current) {
      onScoreRef.current(g.score) // API Call save score
    }
    setUi(u => ({ ...u, dead: true }))
  }

  // Keyboard Controls
  useEffect(() => {
    const DIR_MAP = {
      ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
      w: { x: 0, y: -1 }, s: { x: 0, y: 1 },
      a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
    }

    function onKey(e) {
      const g = gameRef.current
      const d = DIR_MAP[e.key]

      if (d) {
        // Prevent default scrolling on arrows
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault()
        }
        // Prevent reversing direction
        if (d.x !== -g.dir.x || d.y !== -g.dir.y) { 
          gameRef.current.nextDir = d
        }
      }

      if (e.code === 'Space') {
        e.preventDefault()
        if (!g.dead && g.running) { // Only pause if running
           // Optional: pause logic could go here, but omitted to prevent cheating
        }
      }
    }

    window.addEventListener('keydown', onKey, { passive: false })
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ── Swipe Controls (Mobile) ──
  const touchStartRef = useRef({ x: 0, y: 0 })

  function handleTouchStart(e) {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  function handleTouchEnd(e) {
    const g = gameRef.current
    if (!g.running || g.dead) return // Don't allow swipes if game is stopped

    const endX = e.changedTouches[0].clientX
    const endY = e.changedTouches[0].clientY
    const dx = endX - touchStartRef.current.x
    const dy = endY - touchStartRef.current.y
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    // Minimum swipe distance to prevent accidental taps
    if (Math.max(absDx, absDy) > 30) {
      let d = null
      if (absDx > absDy) {
        d = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 } // Right / Left
      } else {
        d = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 } // Down / Up
      }

      // Apply direction if it's not directly backward
      if (d && (d.x !== -g.dir.x || d.y !== -g.dir.y)) {
        gameRef.current.nextDir = d
      }
    }
  }

  function startGame(mode) {
    const newSnake = INIT_SNAKE.map(s => ({ ...s }))
    gameRef.current = {
      snake:   newSnake,
      dir:     { ...INIT_DIR },
      nextDir: { ...INIT_DIR },
      food:    randFood(newSnake),
      score:   0,
      running: true,
      dead:    false,
      mode:    mode
    }
    lastRef.current = performance.now() 
    setUi({ score: 0, dead: false, started: true, mode })
  }

  const W = COLS * CELL
  const H = ROWS * CELL

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: '600px', gap: 20, padding: '20px 10px' }}>

      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: W, alignItems: 'center' }}>
        <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--text)', background: 'var(--card)', padding: '6px 16px', borderRadius: 24, border: '1px solid var(--border)' }}>
          {ui.mode === 'classic' ? '🚧 Classic (Walls)' : '🌌 No Walls'}
        </div>
        <div style={{ fontFamily: 'Russo One, sans-serif', fontSize: 32, color, textShadow: `0 0 10px ${color}44` }}>
          {ui.score} pts
        </div>
      </div>

      {/* Game Canvas container with Swipe Listeners */}
      <div 
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ 
          position: 'relative', 
          width: '100%', 
          maxWidth: W, 
          aspectRatio: '1/1', // Keeps it perfectly square
          touchAction: 'none' // Prevents screen scrolling while swiping
        }}
      >
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{ 
            width: '100%', 
            height: '100%', 
            borderRadius: 12, 
            display: 'block', 
            boxShadow: `0 15px 40px rgba(0,0,0,0.5)`,
            background: '#0a0d14'
          }}
        />

        {/* Start Overlay */}
        {!ui.started && !ui.dead && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(8, 11, 20, 0.85)', backdropFilter: 'blur(4px)', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 20, textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 36, color, fontWeight: 900, letterSpacing: '2px', textShadow: `0 0 20px ${color}66` }}>SNAKE</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'var(--text)' }}>
                  💻 Use <strong style={{color}}>Arrow Keys</strong> or <strong style={{color}}>WASD</strong><br/>
                  📱 <strong style={{color}}>Swipe</strong> on screen to move
                </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 280 }}>
              <button className="btn btn-primary" onClick={() => startGame('classic')} style={{ width: '100%', height: 50, fontSize: 16 }}>
                Play: Classic (Walls)
              </button>
              <button className="btn" onClick={() => startGame('nowalls')} style={{ width: '100%', height: 50, fontSize: 16, border: `1px solid ${color}`, color, background: `${color}11` }}>
                Play: No Walls 🌌
              </button>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {ui.dead && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(230, 57, 70, 0.2)', backdropFilter: 'blur(5px)', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, border: '2px solid rgba(230,57,70,0.5)' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 32, color: '#e63946', textShadow: '0 4px 20px rgba(230,57,70,0.8)', fontWeight: 900, marginBottom: 8 }}>GAME OVER</div>
                <div style={{ fontFamily: 'Russo One, sans-serif', fontSize: 48, color: '#fff' }}>{ui.score}</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 220 }}>
               <button className="btn btn-primary" onClick={() => startGame(ui.mode)} style={{ height: 48, fontSize: 16 }}>Try Again</button>
               <button className="btn btn-ghost" onClick={() => setUi(u => ({...u, started: false, dead: false}))} style={{ height: 48, fontSize: 14 }}>Change Mode</button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}