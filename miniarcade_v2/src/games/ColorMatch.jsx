import { useState, useEffect, useRef } from 'react'

const COLORS = [
  { name: 'RED',    hex: '#e63946' },
  { name: 'BLUE',   hex: '#3a86ff' },
  { name: 'GREEN',  hex: '#2ec4b6' },
  { name: 'YELLOW', hex: '#ffd166' },
  { name: 'PURPLE', hex: '#b100e8' },
  { name: 'ORANGE', hex: '#f77f00' },
]

// Professional Shuffle Algorithm
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pick(exclude) {
  const filtered = COLORS.filter(c => c.name !== exclude?.name)
  return filtered[Math.floor(Math.random() * filtered.length)]
}

function makeQuestion() {
  const word = COLORS[Math.floor(Math.random() * COLORS.length)]
  const textColor = pick(word)
  // Ensure we get exactly 3 UNIQUE incorrect options to avoid duplicates
  const incorrectOpts = shuffleArray(COLORS.filter(c => c.name !== word.name)).slice(0, 3)
  const opts = shuffleArray([word, ...incorrectOpts])
  return { word, textColor, opts }
}

export default function ColorMatch({ onScore }) {
  const [q,           setQ]         = useState(null)
  const [round,       setRound]     = useState(0)
  const [score,       setScore]     = useState(0)
  const [selected,    setSelected]  = useState(null)
  const [timeLeft,    setTimeLeft]  = useState(3)
  const [done,        setDone]      = useState(false)
  const TOTAL = 20
  const timerRef = useRef(null)

  useEffect(() => {
    setQ(makeQuestion()); setRound(0); setScore(0); setDone(false)
  }, [])

  useEffect(() => {
    if (!q || done || selected !== null) return
    setTimeLeft(3)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); next(null); return 3 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [q, round, done])

  function answer(color) {
    if (selected) return
    clearInterval(timerRef.current)
    setSelected(color)
    const correct = color?.name === q.word.name
    const pts = correct ? 100 + (timeLeft * 30) : 0
    const newScore = score + pts
    setScore(newScore)
    setTimeout(() => next(color), 800)
  }

  function next(color) {
    const nextRound = round + 1
    if (nextRound >= TOTAL) {
      setDone(true)
      onScore && onScore(score + (color?.name === q?.word.name ? 100 + timeLeft * 30 : 0))
      return
    }
    setRound(nextRound); setQ(makeQuestion()); setSelected(null)
  }

  function restart() {
    setQ(makeQuestion()); setRound(0); setScore(0); setSelected(null); setDone(false)
  }

  if (!q) return null

  return (
    <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
      <style>{`
        .cm-wrapper {
          width: 100%; max-width: 520px; min-height: 520px;
          background: #080b14; border-radius: 20px;
          border: 2px solid rgba(255, 107, 157, 0.3);
          box-shadow: 0 0 30px rgba(255, 107, 157, 0.15);
          display: flex; flex-direction: column;
          padding: 24px; box-sizing: border-box;
          position: relative; overflow: hidden;
          font-family: 'Inter', sans-serif;
        }

        .cm-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 24px;
        }

        .cm-word-box {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
        }

        .cm-options-grid {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 16px; margin-top: 32px;
        }

        .cm-opt-btn {
          height: 64px; border-radius: 14px;
          background: rgba(255,255,255,0.03); border: 2px solid rgba(255,255,255,0.1);
          cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex; align-items: center; justify-content: center; gap: 12px;
        }
        
        .cm-opt-btn:not(:disabled):hover {
          transform: translateY(-4px) scale(1.02);
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.3);
          box-shadow: 0 8px 20px rgba(0,0,0,0.4);
        }

        .arcade-btn {
          background: rgba(255, 107, 157, 0.15); border: 1px solid #ff6b9d;
          color: #ff6b9d; font-family: 'Orbitron', sans-serif; font-weight: 700;
          letter-spacing: 1px; cursor: pointer; transition: all 0.2s;
          height: 48px; padding: 0 32px; border-radius: 8px; font-size: 14px;
        }
        .arcade-btn:hover {
          background: #ff6b9d; color: #000; box-shadow: 0 0 20px rgba(255,107,157,0.6);
        }

        .animate-enter { animation: slideUp 0.4s ease forwards; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* 📱 Mobile Responsiveness */
        @media (max-width: 480px) {
          .cm-wrapper { padding: 20px; min-height: 480px; }
          .cm-options-grid { gap: 12px; margin-top: 20px; }
          .cm-opt-btn { height: 56px; }
          .cm-word { font-size: clamp(36px, 12vw, 56px) !important; }
        }
      `}</style>

      <div className="cm-wrapper">
        
        {/* --- RESULTS SCREEN --- */}
        {done ? (
          <div className="animate-enter" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', flex: 1, gap: 20 }}>
            <div style={{ fontFamily:'Orbitron,sans-serif', fontSize:26, color:'#ff6b9d', letterSpacing: '2px' }}>SYSTEM CLEARED</div>
            
            <div style={{ width:140, height:140, borderRadius:'50%', background: 'rgba(255,107,157,0.1)', border:`4px solid #ff6b9d`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', boxShadow: '0 0 30px rgba(255,107,157,0.3)' }}>
              <div style={{ fontFamily:'Russo One,sans-serif', fontSize:32, color:'#fff' }}>{score}</div>
              <div style={{ fontFamily:'Inter,sans-serif', fontSize:14, color:'var(--muted)' }}>POINTS</div>
            </div>
            
            <div style={{ fontFamily:'Rajdhani,sans-serif', fontWeight: 700, fontSize:16, color:'var(--muted)', letterSpacing: '1px' }}>
              AVG SCORE: {Math.round(score/TOTAL)} PER ROUND
            </div>
            
            <button className="arcade-btn" style={{ marginTop: 12 }} onClick={restart}>PLAY AGAIN</button>
          </div>
        ) : (
          /* --- ACTIVE GAME SCREEN --- */
          <div key={round} className="animate-enter" style={{ display:'flex', flexDirection:'column', height:'100%', flex: 1 }}>
            
            {/* Header / HUD */}
            <div className="cm-header">
              <div style={{ textAlign:'center', width: 70 }}>
                <div style={{ fontFamily:'Russo One,sans-serif', fontSize:24, color:'#ff6b9d' }}>{score}</div>
                <div style={{ fontFamily:'Orbitron,sans-serif', fontSize:10, color:'var(--muted)', letterSpacing: '1px' }}>SCORE</div>
              </div>
              
              <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:16, fontWeight:700, color:'var(--muted)', letterSpacing: '2px' }}>
                ROUND {round + 1} / {TOTAL}
              </div>
              
              {/* SVG Radar Timer */}
              <div style={{ position:'relative', width:60, height:60 }}>
                <svg viewBox="0 0 72 72" width="60" height="60" style={{ filter: `drop-shadow(0 0 6px ${timeLeft<=1?'#e63946':'#ff6b9d'})` }}>
                  <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4"/>
                  <circle cx="36" cy="36" r="30" fill="none"
                    stroke={timeLeft<=1?'#e63946':'#ff6b9d'}
                    strokeWidth="4" strokeDasharray={`${2*Math.PI*30}`}
                    strokeDashoffset={`${2*Math.PI*30*(1-(timeLeft/3)*100/100)}`}
                    strokeLinecap="round" transform="rotate(-90 36 36)"
                    style={{ transition:'stroke-dashoffset 1s linear, stroke 0.3s' }}
                  />
                </svg>
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Russo One,sans-serif', fontSize:20, color: timeLeft<=1?'#e63946':'#fff' }}>
                  {timeLeft}
                </div>
              </div>
            </div>

            {/* Instruction */}
            <div style={{ fontFamily:'Inter,sans-serif', fontSize:13, color:'var(--muted)', textAlign:'center', marginBottom: 16 }}>
              Match the <span style={{ color:'#ff6b9d', fontWeight: 700, letterSpacing: '1px' }}>WORD</span>, not the color!
            </div>

            {/* The Trick Word */}
            <div className="cm-word-box">
              <div className="cm-word" style={{ fontFamily:'Orbitron,sans-serif', fontWeight:900, fontSize:'clamp(46px, 8vw, 72px)', color:q.textColor.hex, textShadow:`0 0 25px ${q.textColor.hex}88`, letterSpacing: '2px', textAlign: 'center' }}>
                {q.word.name}
              </div>
            </div>

            {/* Options */}
            <div className="cm-options-grid">
              {q.opts.map((c, i) => {
                const isCorrect = c.name === q.word.name
                const isSelected = selected?.name === c.name
                
                let border = `2px solid rgba(255,255,255,0.1)`
                let bg = `rgba(255,255,255,0.03)`
                let textColor = 'var(--text)'
                let shadow = 'none'
                
                if (selected) {
                  if (isCorrect) { 
                    border = `2px solid ${c.hex}`; 
                    bg = `${c.hex}22`; 
                    textColor = c.hex;
                    shadow = `0 0 15px ${c.hex}66`;
                  } else if (isSelected) { 
                    border = '2px solid #e63946'; 
                    bg = 'rgba(230,57,70,0.15)'; 
                    textColor = '#e63946';
                  }
                }

                return (
                  <button key={i} className="cm-opt-btn" onClick={() => answer(c)} disabled={selected !== null}
                    style={{ background: bg, border: border, boxShadow: shadow }}>
                    <div style={{ width:24, height:24, borderRadius:'50%', background:c.hex, boxShadow:`0 0 10px ${c.hex}88`, flexShrink: 0 }}/>
                    <span style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:18, color: textColor, letterSpacing: '1px' }}>
                      {c.name}
                    </span>
                  </button>
                )
              })}
            </div>

          </div>
        )}
      </div>
    </div>
  )
} 