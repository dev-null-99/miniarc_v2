import React, { useState, useEffect, useCallback } from 'react';

// Safely inject fonts
if (typeof document !== 'undefined') {
  const fontUrl = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800;900&family=Rajdhani:wght@600;700&family=Russo+One&family=Inter:wght@400;600&display=swap';
  if (!document.head.querySelector(`link[href="${fontUrl}"]`)) {
    const link = document.createElement('link');
    link.href = fontUrl;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
}

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Reusable SVG drawing components
const DrawX = ({ color }) => (
  <svg viewBox="0 0 100 100" className="svg-mark" style={{ color }}>
    <line x1="25" y1="25" x2="75" y2="75" stroke="currentColor" strokeWidth="12" strokeLinecap="round" className="draw-x1" />
    <line x1="75" y1="25" x2="25" y2="75" stroke="currentColor" strokeWidth="12" strokeLinecap="round" className="draw-x2" />
  </svg>
);

const DrawO = ({ color }) => (
  <svg viewBox="0 0 100 100" className="svg-mark" style={{ color }}>
    <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" className="draw-o" />
  </svg>
);

// Background Levitating Particles
const LevitatingBackground = () => (
  <div style={styles.floatingContainer}>
    <div className="float-shape shape-1"></div>
    <div className="float-shape shape-2"></div>
    <div className="float-shape shape-3"></div>
    <div className="float-shape shape-4"></div>
  </div>
);

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [mode, setMode] = useState('ai');
  const [difficulty, setDifficulty] = useState('hard');
  const [playerSymbol, setPlayerSymbol] = useState('X');
  const [turn, setTurn] = useState('X');
  const [winner, setWinner] = useState(null);
  const [winLine, setWinLine] = useState([]);
  const [scores, setScores] = useState({ X: 0, O: 0, ties: 0 });
  const [gameStarted, setGameStarted] = useState(false);

  const aiSymbol = playerSymbol === 'X' ? 'O' : 'X';

  const checkWinner = useCallback((currentBoard) => {
    for (let combo of WINNING_COMBOS) {
      const [a, b, c] = combo;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], combo };
      }
    }
    if (currentBoard.every(cell => cell !== null)) {
      return { winner: 'TIE', combo: [] };
    }
    return null;
  }, []);

  const minimax = useCallback((tempBoard, depth, isMaximizing) => {
    const result = checkWinner(tempBoard);
    if (result) {
      if (result.winner === aiSymbol) return 10 - depth;
      if (result.winner === playerSymbol) return depth - 10;
      if (result.winner === 'TIE') return 0;
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!tempBoard[i]) {
          tempBoard[i] = aiSymbol;
          let evaluation = minimax(tempBoard, depth + 1, false);
          tempBoard[i] = null;
          maxEval = Math.max(maxEval, evaluation);
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!tempBoard[i]) {
          tempBoard[i] = playerSymbol;
          let evaluation = minimax(tempBoard, depth + 1, true);
          tempBoard[i] = null;
          minEval = Math.min(minEval, evaluation);
        }
      }
      return minEval;
    }
  }, [aiSymbol, playerSymbol, checkWinner]);

  const getAIMove = useCallback((currentBoard) => {
    const emptyIndices = currentBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
    if (emptyIndices.length === 0) return null;

    if (difficulty === 'easy') {
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    if (difficulty === 'medium' && Math.random() < 0.5) {
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    let bestScore = -Infinity;
    let move = emptyIndices[0];

    for (let i of emptyIndices) {
      currentBoard[i] = aiSymbol;
      let score = minimax(currentBoard, 0, false);
      currentBoard[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
    return move;
  }, [difficulty, aiSymbol, minimax]);

  const makeMove = (index, symbol) => {
    const nextBoard = [...board];
    nextBoard[index] = symbol;
    setBoard(nextBoard);

    const winResult = checkWinner(nextBoard);
    if (winResult) {
      setWinner(winResult.winner);
      setWinLine(winResult.combo);
      if (winResult.winner === 'TIE') {
        setScores(prev => ({ ...prev, ties: prev.ties + 1 }));
      } else {
        setScores(prev => ({ ...prev, [winResult.winner]: prev[winResult.winner] + 1 }));
      }
    } else {
      setTurn(symbol === 'X' ? 'O' : 'X');
    }
  };

  const handleClick = (index) => {
    if (board[index] || winner || (mode === 'ai' && turn !== playerSymbol)) return;
    makeMove(index, turn);
  };

  useEffect(() => {
    if (gameStarted && mode === 'ai' && turn === aiSymbol && !winner) {
      const timer = setTimeout(() => {
        const aiMove = getAIMove(board);
        if (aiMove !== null) makeMove(aiMove, aiSymbol);
      }, 600); 
      return () => clearTimeout(timer);
    }
  }, [turn, mode, board, winner, gameStarted, aiSymbol, getAIMove]);

  const startGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWinLine([]);
    setTurn('X');
    setGameStarted(true);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWinLine([]);
    setTurn('X');
  };

  return (
    <div style={styles.container}>
      <style>{`
        /* Core Container Pulse */
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 15px #e040fb44; }
          50% { box-shadow: 0 0 25px #e040fbAA; }
          100% { box-shadow: 0 0 15px #e040fb44; }
        }

        /* SVG Line Drawing Animations */
        @keyframes drawStroke {
          to { stroke-dashoffset: 0; }
        }
        .svg-mark {
          width: 80%;
          height: 80%;
          filter: drop-shadow(0 0 8px currentColor);
        }
        .draw-x1 {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: drawStroke 0.25s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .draw-x2 {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          /* Line 2 waits for Line 1 to finish */
          animation: drawStroke 0.25s cubic-bezier(0.2, 0.8, 0.2, 1) 0.15s forwards; 
        }
        .draw-o {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: drawStroke 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        /* Levitating Background Shapes */
        @keyframes levitateA {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(15deg); }
        }
        @keyframes levitateB {
          0%, 100% { transform: translateY(0) rotate(45deg); }
          50% { transform: translateY(25px) rotate(-10deg); }
        }
        .float-shape {
          position: absolute;
          border-radius: 4px;
          opacity: 0.15;
          pointer-events: none;
        }
        .shape-1 { width: 40px; height: 40px; border: 3px solid #3a86ff; top: 10%; left: 10%; animation: levitateA 6s ease-in-out infinite; }
        .shape-2 { width: 25px; height: 25px; border: 3px solid #e040fb; top: 70%; left: 15%; animation: levitateB 8s ease-in-out infinite; border-radius: 50%; }
        .shape-3 { width: 35px; height: 35px; border: 3px solid #ffd700; top: 20%; right: 15%; animation: levitateB 7s ease-in-out infinite reverse; }
        .shape-4 { width: 50px; height: 50px; border: 3px solid #3a86ff; top: 65%; right: 10%; animation: levitateA 9s ease-in-out infinite reverse; clip-path: polygon(50% 0%, 0% 100%, 100% 100%); }

        /* General Button Styles */
        .arcade-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #fff;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          letter-spacing: 1px;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .arcade-btn:hover {
          background: rgba(224, 64, 251, 0.2);
          border-color: #e040fb;
          box-shadow: 0 0 12px #e040fb66;
        }
        .arcade-btn.active {
          background: #e040fb;
          color: #fff;
          border-color: #e040fb;
          box-shadow: 0 0 15px #e040fb88;
        }

        /* Fixed Grid Cells to prevent shrinking/expanding */
        .cell-btn {
          box-sizing: border-box; /* Crucial for preventing shifts */
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cell-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: #3a86ff !important;
          box-shadow: inset 0 0 15px #3a86ff44;
        }
      `}</style>

      {/* Floating Background Effects */}
      <LevitatingBackground />

      <h1 style={styles.headerTitle}>TIC TAC TOE</h1>

      {!gameStarted ? (
        <div style={{ ...styles.configCard, zIndex: 2 }}>
          <div style={styles.sectionGroup}>
            <label style={styles.label}>GAME MODE</label>
            <div style={styles.buttonRow}>
              <button className={`arcade-btn ${mode === 'ai' ? 'active' : ''}`} onClick={() => setMode('ai')}>
                VS COMPUTER
              </button>
              <button className={`arcade-btn ${mode === 'player' ? 'active' : ''}`} onClick={() => setMode('player')}>
                2 PLAYERS
              </button>
            </div>
          </div>

          {mode === 'ai' && (
            <>
              <div style={styles.sectionGroup}>
                <label style={styles.label}>AI DIFFICULTY</label>
                <div style={styles.buttonRow}>
                  {['easy', 'medium', 'hard'].map((lvl) => (
                    <button
                      key={lvl}
                      className={`arcade-btn ${difficulty === lvl ? 'active' : ''}`}
                      onClick={() => setDifficulty(lvl)}
                    >
                      {lvl.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.sectionGroup}>
                <label style={styles.label}>CHOOSE YOUR MARK</label>
                <div style={styles.buttonRow}>
                  <button className={`arcade-btn ${playerSymbol === 'X' ? 'active' : ''}`} onClick={() => setPlayerSymbol('X')}>
                    PLAY AS X
                  </button>
                  <button className={`arcade-btn ${playerSymbol === 'O' ? 'active' : ''}`} onClick={() => setPlayerSymbol('O')}>
                    PLAY AS O
                  </button>
                </div>
              </div>
            </>
          )}

          <button style={styles.launchBtn} onClick={startGame}>
            START GAME →
          </button>
        </div>
      ) : (
        <div style={{ ...styles.arena, zIndex: 2 }}>
          <div style={styles.scoreboard}>
            <div style={{ ...styles.scoreCard, borderColor: turn === 'X' && !winner ? '#e040fb' : 'transparent' }}>
              <span style={{ color: '#e040fb', fontFamily: 'Orbitron', fontSize: '12px' }}>PLAYER X</span>
              <span style={styles.scoreNum}>{scores.X}</span>
            </div>
            <div style={styles.scoreCard}>
              <span style={{ color: '#888', fontFamily: 'Orbitron', fontSize: '12px' }}>TIES</span>
              <span style={styles.scoreNum}>{scores.ties}</span>
            </div>
            <div style={{ ...styles.scoreCard, borderColor: turn === 'O' && !winner ? '#3a86ff' : 'transparent' }}>
              <span style={{ color: '#3a86ff', fontFamily: 'Orbitron', fontSize: '12px' }}>PLAYER O</span>
              <span style={styles.scoreNum}>{scores.O}</span>
            </div>
          </div>

          <div style={styles.grid}>
            {board.map((cell, idx) => {
              const isWinningCell = winLine.includes(idx);
              return (
                <button
                  key={idx}
                  className="cell-btn"
                  disabled={cell !== null || !!winner}
                  onClick={() => handleClick(idx)}
                  style={{
                    ...styles.cell,
                    background: isWinningCell ? 'rgba(224, 64, 251, 0.25)' : '#0f1424',
                    borderColor: isWinningCell ? '#e040fb' : '#1e2640',
                    boxShadow: isWinningCell ? '0 0 20px #e040fb' : 'none',
                  }}
                >
                  {/* Drawing Animations trigger automatically when cell updates */}
                  {cell === 'X' && <DrawX color="#e040fb" />}
                  {cell === 'O' && <DrawO color="#3a86ff" />}
                </button>
              );
            })}
          </div>

          <div style={styles.controlRow}>
            <button className="arcade-btn" onClick={resetGame}>RESTART ROUND</button>
            <button className="arcade-btn" onClick={() => setGameStarted(false)}>SETTINGS</button>
          </div>

          {winner && (
            <div style={styles.overlay}>
              <div style={styles.winCard}>
                <h2 style={{ ...styles.winText, color: winner === 'TIE' ? '#ffd700' : winner === 'X' ? '#e040fb' : '#3a86ff' }}>
                  {winner === 'TIE' ? 'DRAW GAME!' : `VICTORY FOR ${winner}!`}
                </h2>
                <button style={styles.launchBtn} onClick={resetGame}>PLAY AGAIN</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: '480px',
    height: '520px',
    background: '#080b14',
    borderRadius: '16px',
    border: '2px solid rgba(224, 64, 251, 0.27)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    fontFamily: 'Inter, sans-serif',
    color: '#fff',
    position: 'relative',
    overflow: 'hidden', // Keeps floating shapes inside
    animation: 'pulseGlow 6s infinite ease-in-out',
    margin: '0 auto'
  },
  floatingContainer: {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    pointerEvents: 'none',
  },
  headerTitle: {
    fontFamily: 'Orbitron, sans-serif',
    fontSize: '26px',
    fontWeight: 900,
    color: '#e040fb',
    textShadow: '0 0 12px #e040fb88',
    margin: '0 0 20px 0',
    letterSpacing: '2px',
    zIndex: 2,
  },
  configCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
    alignItems: 'center',
  },
  sectionGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
  },
  label: {
    fontFamily: 'Rajdhani, sans-serif',
    fontSize: '13px',
    fontWeight: 700,
    color: '#8899ac',
    letterSpacing: '1.5px',
  },
  buttonRow: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  launchBtn: {
    background: '#e040fb',
    color: '#fff',
    border: 'none',
    height: '44px',
    padding: '0 32px',
    borderRadius: '12px',
    fontFamily: 'Rajdhani, sans-serif',
    fontWeight: 700,
    fontSize: '16px',
    cursor: 'pointer',
    boxShadow: '0 0 16px #e040fb66',
    transition: 'all 0.2s ease',
    marginTop: '10px',
  },
  arena: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  scoreboard: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '320px',
    marginBottom: '20px',
  },
  scoreCard: {
    background: 'rgba(15, 20, 36, 0.85)',
    backdropFilter: 'blur(4px)',
    padding: '8px 12px',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '80px',
    border: '1px solid transparent',
    transition: 'all 0.3s ease',
  },
  scoreNum: {
    fontFamily: 'Russo One, sans-serif',
    fontSize: '22px',
    marginTop: '4px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridTemplateRows: 'repeat(3, 1fr)', // FORCES identical heights
    gap: '12px',
    width: '300px',
    height: '300px',
    marginBottom: '24px',
  },
  cell: {
    borderRadius: '12px',
    border: '2px solid #1e2640',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    outline: 'none',
    padding: 0,
    width: '100%', 
    height: '100%',
  },
  controlRow: {
    display: 'flex',
    gap: '12px',
  },
  overlay: {
    position: 'absolute',
    inset: '-24px',
    background: 'rgba(8, 11, 20, 0.88)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(6px)',
    zIndex: 10
  },
  winCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  winText: {
    fontFamily: 'Orbitron, sans-serif',
    fontSize: '24px',
    margin: 0,
    textShadow: '0 0 15px currentColor',
  },
};