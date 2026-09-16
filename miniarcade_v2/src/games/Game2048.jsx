import { useState, useEffect, useCallback, useRef } from 'react'

const SIZE = 4

function emptyGrid() { return Array(SIZE).fill(null).map(() => Array(SIZE).fill(0)) }

function addRandom(grid) {
  const empty = []
  grid.forEach((row,r)=>row.forEach((v,c)=>{ if(!v) empty.push([r,c]) }))
  if (!empty.length) return grid
  const [r,c] = empty[Math.floor(Math.random()*empty.length)]
  const g = grid.map(row=>[...row])
  g[r][c] = Math.random()<0.9 ? 2 : 4
  return g
}

function initGrid() { return addRandom(addRandom(emptyGrid())) }

function slide(row) {
  const arr = row.filter(Boolean)
  let score = 0
  for (let i=0; i<arr.length-1; i++) {
    if (arr[i]===arr[i+1]) { arr[i]*=2; score+=arr[i]; arr[i+1]=0 }
  }
  const result = arr.filter(Boolean)
  while (result.length < SIZE) result.push(0)
  return { row: result, score }
}

function moveLeft(grid) {
  let score=0, moved=false
  const next = grid.map(row => {
    const { row:r, score:s } = slide(row)
    score+=s; if (JSON.stringify(r)!==JSON.stringify(row)) moved=true
    return r
  })
  return { grid:next, score, moved }
}

function rotateRight(grid) {
  return grid[0].map((_,i) => grid.map(row=>row[i]).reverse())
}

function move(grid, dir) {
  let g = grid, rots = { left:0, right:2, up:3, down:1 }[dir]
  for (let i=0; i<rots; i++) g = rotateRight(g)
  const { grid:ng, score, moved } = moveLeft(g)
  let result = ng
  for (let i=0; i<(4-rots)%4; i++) result = rotateRight(result)
  return { grid: moved ? addRandom(result) : grid, score, moved }
}

function canMove(grid) {
  for (let r=0; r<SIZE; r++) for (let c=0; c<SIZE; c++) {
    if (!grid[r][c]) return true
    if (r<SIZE-1 && grid[r][c]===grid[r+1][c]) return true
    if (c<SIZE-1 && grid[r][c]===grid[r][c+1]) return true
  }
  return false
}

const TILE_COLORS = {
  0:'transparent', 2:'#eee4da', 4:'#ede0c8', 8:'#f2b179', 16:'#f59563',
  32:'#f67c5f', 64:'#f65e3b', 128:'#edcf72', 256:'#edcc61',
  512:'#edc850', 1024:'#edc53f', 2048:'#edc22e',
}

export default function Game2048({ onScore }) {
  const [grid,  setGrid]  = useState(initGrid)
  const [score, setScore] = useState(0)
  const [best,  setBest]  = useState(0)
  const [over,  setOver]  = useState(false)
  const [won,   setWon]   = useState(false)
  
  // Touch Ref for seamless swiping
  const touchRef = useRef({ x: 0, y: 0 })

  const doMove = useCallback((dir) => {
    if (over) return
    setGrid(prev => {
      const { grid:ng, score:s, moved } = move(prev, dir)
      if (!moved) return prev
      setScore(sc => {
        const next = sc+s
        setBest(b => Math.max(b, next))
        return next
      })
      if (ng.flat().includes(2048) && !won) { setWon(true); onScore && onScore(score+s) }
      if (!canMove(ng)) { setOver(true); onScore && onScore(score+s) }
      return ng
    })
  }, [over, won, score, onScore])

  // Keyboard support for PC
  useEffect(() => {
    function onKey(e) {
      const map = { ArrowLeft:'left', ArrowRight:'right', ArrowUp:'up', ArrowDown:'down', a:'left', d:'right', w:'up', s:'down' }
      if (map[e.key]) { e.preventDefault(); doMove(map[e.key]) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [doMove])

  // Custom Touch Handlers attached directly to grid (Prevents window freezing)
  const handleTouchStart = (e) => {
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchRef.current.x
    const dy = e.changedTouches[0].clientY - touchRef.current.y
    // Ignore tiny accidental taps
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      doMove(dx > 0 ? 'right' : 'left')
    } else {
      doMove(dy > 0 ? 'down' : 'up')
    }
  }

  function restart() { setGrid(initGrid()); setScore(0); setOver(false); setWon(false) }

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', width:'100%', height:'100%', gap:24, padding:16 }}>

      {/* Score */}
      <div style={{ display:'flex', gap:16, width: '100%', maxWidth: '400px', justifyContent: 'center' }}>
        {[['SCORE',score,'#f77f00'],['BEST',best,'#ffd700']].map(([label,val,color])=>(
          <div key={label} style={{ flex: 1, textAlign:'center', padding:'8px', background:'var(--card)', borderRadius:10, border:`1px solid ${color}44` }}>
            <div style={{ fontFamily:'Russo One,sans-serif', fontSize:24, color }}>{val}</div>
            <div style={{ fontFamily:'Inter,sans-serif', fontSize:11, color:'var(--muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ 
          position:'relative', background:'#bbada0', borderRadius:12, padding:10, 
          display:'grid', gridTemplateColumns:`repeat(${SIZE},1fr)`, gap:10,
          width: '100%', maxWidth: '400px', 
          touchAction: 'none' // 🚀 THIS IS THE MAGIC FIX FOR MOBILE SCROLLING!
        }}
      >
        {grid.flat().map((val,i) => (
          <div key={i} style={{
            aspectRatio: '1/1', // Automatically scales height with width
            borderRadius:8,
            background: TILE_COLORS[val] || (val>2048?'#3c3a32':'#cdc1b4'),
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'Russo One,sans-serif',
            fontSize: val>=1024?'clamp(16px, 4vw, 24px)':val>=128?'clamp(20px, 5vw, 28px)':'clamp(24px, 6vw, 34px)',
            color: val<=4 ? '#776e65' : '#f9f6f2',
            transition:'all 0.1s ease-in-out',
            boxShadow: val>=2048 ? '0 0 30px rgba(237,194,46,0.8)' : 'none',
          }}>
            {val || ''}
          </div>
        ))}

        {(over || won) && (
          <div style={{ position:'absolute', inset:0, background:'rgba(238,228,218,0.85)', borderRadius:12, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, zIndex: 10 }}>
            <div style={{ fontFamily:'Orbitron,sans-serif', fontSize:26, color: won?'#f9c74f':'#776e65', textShadow: won?'0 0 10px rgba(249,199,79,0.5)':'none' }}>
              {won ? '🏆 YOU WON!' : 'GAME OVER'}
            </div>
            <div style={{ fontFamily:'Russo One,sans-serif', fontSize:20, color:'#776e65' }}>Score: {score}</div>
            <button className="btn btn-primary" onClick={restart} style={{ height: '44px', padding: '0 32px', fontSize: '16px' }}>
              Try Again
            </button>
          </div>
        )}
      </div>

    </div>
  )
}