import React, { useState, useEffect, useCallback } from 'react';

// Safely inject premium fonts
if (typeof document !== 'undefined') {
  const fontUrl = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800;900&family=Rajdhani:wght@600;700&family=Russo+One&family=Inter:wght@400;600&display=swap';
  if (!document.head.querySelector(`link[href="${fontUrl}"]`)) {
    const link = document.createElement('link');
    link.href = fontUrl;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
}

// Premium SVG Geometry for Cards (No Emojis)
const SYMBOL_DEFS = {
  hex: { color: '#e040fb', node: <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" /> },
  tri: { color: '#3a86ff', node: <polygon points="50,15 90,85 10,85" /> },
  cir: { color: '#00f5d4', node: <circle cx="50" cy="50" r="35" /> },
  str: { color: '#ff9e00', node: <polygon points="50,15 61,35 85,35 66,50 74,75 50,60 26,75 34,50 15,35 39,35" /> },
  dia: { color: '#ff0054', node: <polygon points="50,10 85,50 50,90 15,50" /> },
  sqr: { color: '#ffd700', node: <rect x="20" y="20" width="60" height="60" rx="8" /> },
  crs: { color: '#b100e8', node: <path d="M40,15 H60 V40 H85 V60 H60 V85 H40 V60 H15 V40 H40 Z" /> },
  rng: { color: '#00b4d8', node: <g><circle cx="50" cy="50" r="18"/><circle cx="50" cy="50" r="38"/></g> }
};

const SYMBOL_KEYS = Object.keys(SYMBOL_DEFS);

const shuffle = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export default function MemoryMatch({ onScore }) {
  const [uiState, setUiState] = useState('menu'); // 'menu', 'playing', 'victory'
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]); 
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [score, setScore] = useState(0);

  // Initialize Game
  const startGame = useCallback(() => {
    const deck = shuffle([...SYMBOL_KEYS, ...SYMBOL_KEYS]).map((symbolId, idx) => ({
      id: idx,
      symbolId,
      isFlipped: false,
      isMatched: false
    }));
    
    setCards(deck);
    setFlipped([]);
    setMoves(0);
    setMatches(0);
    setScore(0);
    setUiState('playing');
  }, []);

  // Handle Logic when 2 cards are flipped
  useEffect(() => {
    if (flipped.length === 2) {
      const [idx1, idx2] = flipped;
      const isMatch = cards[idx1].symbolId === cards[idx2].symbolId;

      const timer = setTimeout(() => {
        setCards(prev => {
          const next = [...prev];
          if (isMatch) {
            next[idx1].isMatched = true;
            next[idx2].isMatched = true;
          } else {
            next[idx1].isFlipped = false;
            next[idx2].isFlipped = false;
          }
          return next;
        });
        
        if (isMatch) setMatches(m => m + 1);
        setFlipped([]);
      }, isMatch ? 400 : 800);

      return () => clearTimeout(timer);
    }
  }, [flipped, cards]);

  // Handle Victory & Scoring
  useEffect(() => {
    if (matches === SYMBOL_KEYS.length && uiState === 'playing') {
      const finalScore = Math.max(1000, 10000 - ((moves - 8) * 350));
      setScore(finalScore);
      
      const timer = setTimeout(() => {
        setUiState('victory');
        if (onScore) onScore(finalScore); // Send to leaderboard
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [matches, moves, uiState, onScore]);

  const handleCardClick = (index) => {
    if (flipped.length === 2 || cards[index].isFlipped || cards[index].isMatched) return;

    setCards(prev => {
      const next = [...prev];
      next[index].isFlipped = true;
      return next;
    });
    
    setFlipped(prev => {
      const next = [...prev, index];
      if (next.length === 2) setMoves(m => m + 1);
      return next;
    });
  };

  return (
    <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
      <style>{`
        /* Master Container */
        .memory-wrapper {
          width: 100%;
          max-width: 480px;
          min-height: 520px; /* Force minimum height so menu never squashes! */
          background: #080b14;
          border-radius: 16px;
          border: 2px solid rgba(58, 134, 255, 0.3);
          box-sizing: border-box;
          font-family: 'Inter', sans-serif;
          animation: pulseGlow 6s infinite ease-in-out;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        /* HUD Section */
        .memory-hud {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 24px 16px 24px;
        }
        .hud-label {
          font-family: 'Orbitron', sans-serif;
          font-size: 11px;
          color: #5b6a82;
          letter-spacing: 1px;
          font-weight: 800;
        }
        .hud-val {
          font-family: 'Russo One', sans-serif;
          font-size: 22px;
          color: #fff;
          margin-top: 2px;
        }

        /* Responsive Square Grid */
        .memory-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          padding: 0 24px 24px 24px;
          flex-grow: 1;
        }

        /* Overlay & Menu Screen */
        .menu-overlay {
          position: absolute;
          inset: 0;
          background: rgba(8, 11, 20, 0.9);
          backdrop-filter: blur(8px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10;
          gap: 24px;
          padding: 30px;
          text-align: center;
        }
        .menu-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 36px;
          font-weight: 900;
          color: #e040fb;
          text-shadow: 0 0 15px currentColor;
          margin: 0;
          letter-spacing: 2px;
        }
        .rule-box {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 16px 24px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .rule-text {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #aaa;
        }
        .stats-box {
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255, 215, 0, 0.3);
          padding: 20px 30px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          box-sizing: border-box;
        }
        .stat-row {
          display: flex;
          justify-content: space-between;
          font-family: 'Russo One', sans-serif;
          font-size: 18px;
          color: #8899ac;
          width: 100%;
        }

        /* Buttons */
        .arcade-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #fff;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.2s ease;
          height: 48px;
          padding: 0 36px;
          border-radius: 8px;
          font-size: 16px;
        }
        .arcade-btn:hover {
          background: rgba(224, 64, 251, 0.2);
          border-color: #e040fb;
          box-shadow: 0 0 15px #e040fb88;
        }

        /* Glow Animations */
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 15px rgba(224, 64, 251, 0.2); }
          50% { box-shadow: 0 0 25px rgba(58, 134, 255, 0.4); }
          100% { box-shadow: 0 0 15px rgba(224, 64, 251, 0.2); }
        }
        @keyframes cardDeal {
          0% { transform: translateY(40px) scale(0.8); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        
        /* Interactive Card Physics */
        .card-slot {
          perspective: 1000px;
          width: 100%;
          aspect-ratio: 1/1; 
          cursor: pointer;
        }
        .card-inner {
          width: 100%;
          height: 100%;
          position: relative;
          transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-style: preserve-3d;
        }
        
        /* Premium Floating Effect */
        .card-slot:hover:not(.disabled) .card-inner:not(.flipped) {
          transform: translateY(-6px) scale(1.03);
        }
        
        /* Flip Activation */
        .card-inner.flipped { transform: rotateY(180deg); }
        
        .card-face {
          position: absolute; width: 100%; height: 100%;
          backface-visibility: hidden; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          box-sizing: border-box; transition: box-shadow 0.3s ease;
        }
        
        .card-back {
          background: #111625; border: 2px solid #2a344a;
          background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 10px);
          box-shadow: inset 0 0 15px rgba(0,0,0,0.8);
        }
        .card-slot:hover:not(.disabled) .card-back {
          border-color: #3a86ff;
          box-shadow: 0 8px 20px rgba(0,0,0,0.6), inset 0 0 15px rgba(58,134,255,0.2);
        }
        
        .card-front {
          background: #080b14; transform: rotateY(180deg); border: 2px solid;
        }
        
        .card-inner.matched .card-front {
          opacity: 0.5; filter: grayscale(0.5); box-shadow: none !important;
        }

        /* 📱 Mobile Adjustments */
        @media (max-width: 480px) {
          .memory-wrapper { border-radius: 12px; min-height: 440px; }
          .memory-hud { padding: 16px 16px 12px 16px; }
          .memory-grid { gap: 8px; padding: 0 16px 16px 16px; }
          .hud-val { font-size: 18px; }
          .hud-label { font-size: 9px; }
          .card-face { border-radius: 8px; }
          .card-face svg { width: 50% !important; height: 50% !important; }
          .menu-title { font-size: 28px !important; }
          .rule-box { padding: 12px; }
          .arcade-btn { padding: 0 24px; font-size: 14px; }
        }
      `}</style>

      <div className="memory-wrapper">
        {/* Dynamic HUD */}
        <div className="memory-hud">
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span className="hud-label">MOVES</span>
            <span className="hud-val">{moves}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span className="hud-label" style={{ color: '#e040fb' }}>MEMORY MATCH</span>
            <span className="hud-val" style={{ fontSize: '14px', color: '#8899ac' }}>PAIRS: {matches}/8</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span className="hud-label">SCORE</span>
            <span className="hud-val" style={{ color: '#00f5d4' }}>
              {uiState === 'playing' ? Math.max(1000, 10000 - (moves * 350)) : score}
            </span>
          </div>
        </div>

        {/* Grid Canvas */}
        <div className="memory-grid">
          {cards.map((card, idx) => {
            const sym = SYMBOL_DEFS[card.symbolId];
            const isFlipped = card.isFlipped || card.isMatched;
            const isDisabled = uiState !== 'playing' || flipped.length === 2 || isFlipped;

            return (
              <div 
                key={card.id} 
                className={`card-slot ${isDisabled ? 'disabled' : ''}`} 
                onClick={() => handleCardClick(idx)}
                style={{ animation: uiState === 'playing' ? `cardDeal 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${idx * 0.04}s backwards` : 'none' }}
              >
                <div className={`card-inner ${isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}>
                  <div className="card-face card-back">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="4" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                  <div 
                    className="card-face card-front" 
                    style={{ 
                      borderColor: sym.color, 
                      boxShadow: card.isMatched ? 'none' : `inset 0 0 20px ${sym.color}33, 0 0 15px ${sym.color}66`
                    }}
                  >
                    <svg 
                      viewBox="0 0 100 100" 
                      style={{ width: '60%', height: '60%', overflow: 'visible' }}
                      fill="none" stroke={sym.color} strokeWidth="6" 
                      strokeLinecap="round" strokeLinejoin="round"
                      filter={`drop-shadow(0 0 6px ${sym.color})`}
                    >
                      {sym.node}
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Menus / Overlays */}
        {uiState === 'menu' && (
          <div className="menu-overlay">
            <h1 className="menu-title">NEON MEMORY</h1>
            <div className="rule-box">
              <div className="rule-text">Find all 8 matching geometric pairs.</div>
              <div className="rule-text">Complete in fewer moves for a higher score!</div>
            </div>
            <button className="arcade-btn" onClick={startGame}>INITIALIZE DECK →</button>
          </div>
        )}

        {uiState === 'victory' && (
          <div className="menu-overlay">
            <h2 className="menu-title" style={{ color: '#ffd700' }}>SYSTEM CLEARED</h2>
            <div className="stats-box">
              <div className="stat-row"><span>TOTAL MOVES:</span> <span style={{color: '#fff'}}>{moves}</span></div>
              <div className="stat-row"><span>FINAL SCORE:</span> <span style={{color: '#00f5d4'}}>{score}</span></div>
            </div>
            <button className="arcade-btn" onClick={startGame}>PLAY AGAIN</button>
          </div>
        )}
      </div>
    </div>
  );
}