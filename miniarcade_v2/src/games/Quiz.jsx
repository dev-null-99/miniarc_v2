import { useState, useEffect, useRef } from 'react'

// --- Professional Shuffle Logic ---
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const QUESTIONS = {
  gk: [
    // Original 10
    { q:'Which is the largest ocean?', options:['Atlantic','Pacific','Indian','Arctic'], ans:1 },
    { q:'How many continents are there?', options:['5','6','7','8'], ans:2 },
    { q:'Which planet is known as the Red Planet?', options:['Venus','Mars','Jupiter','Saturn'], ans:1 },
    { q:'What is the capital of Australia?', options:['Sydney','Melbourne','Canberra','Perth'], ans:2 },
    { q:'Who painted the Mona Lisa?', options:['Michelangelo','Raphael','Da Vinci','Donatello'], ans:2 },
    { q:'Which country has the most natural lakes?', options:['USA','Russia','Canada','Brazil'], ans:2 },
    { q:'What is the longest river in the world?', options:['Amazon','Nile','Yangtze','Mississippi'], ans:1 },
    { q:'How many bones does an adult human have?', options:['196','206','216','226'], ans:1 },
    { q:'Which metal is liquid at room temperature?', options:['Lead','Tin','Mercury','Gallium'], ans:2 },
    { q:'What is the currency of Japan?', options:['Yuan','Won','Yen','Ringgit'], ans:2 },
    // 15 New
    { q:'What is the approximate height of Mount Everest?', options:['7,848m','8,848m','9,848m','10,848m'], ans:1 },
    { q:'Which is the smallest country in the world?', options:['Monaco','Nauru','Vatican City','Tuvalu'], ans:2 },
    { q:'Which is the largest hot desert in the world?', options:['Gobi','Kalahari','Sahara','Mojave'], ans:2 },
    { q:'What is the official currency of the United Kingdom?', options:['Euro','Pound Sterling','Dollar','Franc'], ans:1 },
    { q:'What is the national animal of India?', options:['Lion','Elephant','Tiger','Peacock'], ans:2 },
    { q:'What is the largest mammal in the world?', options:['Elephant','Blue Whale','Giraffe','Orca'], ans:1 },
    { q:'Who is credited with inventing the telephone?', options:['Thomas Edison','Nikola Tesla','Alexander Graham Bell','Albert Einstein'], ans:2 },
    { q:'What is the capital city of Canada?', options:['Toronto','Vancouver','Ottawa','Montreal'], ans:2 },
    { q:'Which is the highest uninterrupted waterfall in the world?', options:['Niagara Falls','Angel Falls','Victoria Falls','Iguazu Falls'], ans:1 },
    { q:'What is the deepest part of the world oceans?', options:['Tonga Trench','Mariana Trench','Java Trench','Puerto Rico Trench'], ans:1 },
    { q:'Who wrote the Harry Potter series?', options:['J.R.R. Tolkien','George R.R. Martin','J.K. Rowling','Stephen King'], ans:2 },
    { q:'Which country is known as the Land of the Rising Sun?', options:['China','South Korea','Thailand','Japan'], ans:3 },
    { q:'How many strings does a standard acoustic guitar have?', options:['4','5','6','7'], ans:2 },
    { q:'What is the first element on the periodic table?', options:['Helium','Oxygen','Carbon','Hydrogen'], ans:3 },
    { q:'What is the worlds largest island?', options:['Australia','Greenland','New Guinea','Madagascar'], ans:1 },
  ],
  science: [
    // Original 10
    { q:'What is the chemical symbol for water?', options:['WO','H2O','HO2','W2O'], ans:1 },
    { q:'What is the speed of light?', options:['200,000 km/s','300,000 km/s','400,000 km/s','150,000 km/s'], ans:1 },
    { q:'Which planet has the most moons?', options:['Jupiter','Saturn','Neptune','Uranus'], ans:1 },
    { q:'What is the atomic number of Carbon?', options:['6','8','12','14'], ans:0 },
    { q:'What gas do plants absorb from the air?', options:['Oxygen','Nitrogen','CO2','Hydrogen'], ans:2 },
    { q:'What is the powerhouse of the cell?', options:['Nucleus','Ribosome','Mitochondria','Vacuole'], ans:2 },
    { q:'How many chromosomes do humans have?', options:['23','44','46','48'], ans:2 },
    { q:'What is the hardest natural substance?', options:['Ruby','Diamond','Quartz','Topaz'], ans:1 },
    { q:'Which force keeps planets in orbit?', options:['Magnetic','Electric','Nuclear','Gravity'], ans:3 },
    { q:'What is the chemical formula for table salt?', options:['NaCl','KCl','CaCl2','NaBr'], ans:0 },
    // 15 New
    { q:'What is the closest star to Earth?', options:['Proxima Centauri','Sirius','The Sun','Alpha Centauri'], ans:2 },
    { q:'What is the boiling point of water at sea level?', options:['50°C','75°C','100°C','150°C'], ans:2 },
    { q:'Which gas is commonly used to fill floating balloons?', options:['Oxygen','Helium','Nitrogen','Carbon Dioxide'], ans:1 },
    { q:'What is the scientific study of fungi called?', options:['Botany','Zoology','Mycology','Ecology'], ans:2 },
    { q:'What is the most abundant gas in Earths atmosphere?', options:['Oxygen','Nitrogen','Carbon Dioxide','Argon'], ans:1 },
    { q:'What is the center of an atom called?', options:['Proton','Electron','Nucleus','Neutron'], ans:2 },
    { q:'What force opposes the motion of objects sliding against each other?', options:['Gravity','Magnetism','Inertia','Friction'], ans:3 },
    { q:'By what process do plants make their own food?', options:['Respiration','Digestion','Photosynthesis','Fermentation'], ans:2 },
    { q:'What is the basic unit of life?', options:['Tissue','Organ','Cell','Atom'], ans:2 },
    { q:'Which planet is closest to the Sun?', options:['Venus','Earth','Mars','Mercury'], ans:3 },
    { q:'What is the pH level of pure water?', options:['5','6','7','8'], ans:2 },
    { q:'Who developed the theory of relativity?', options:['Isaac Newton','Albert Einstein','Galileo Galilei','Nikola Tesla'], ans:1 },
    { q:'Which organ pumps blood throughout the human body?', options:['Lungs','Brain','Liver','Heart'], ans:3 },
    { q:'What is the chemical symbol for Iron?', options:['Ir','Fe','In','I'], ans:1 },
    { q:'In which medium can sound NOT travel?', options:['Water','Air','Steel','Vacuum'], ans:3 },
  ],
  history: [
    // Original 10
    { q:'In which year did World War 2 end?', options:['1943','1944','1945','1946'], ans:2 },
    { q:'Who was the first US President?', options:['Lincoln','Jefferson','Washington','Adams'], ans:2 },
    { q:'In which year did India gain independence?', options:['1945','1946','1947','1948'], ans:2 },
    { q:'Who built the Great Wall of China?', options:['Mongols','Han Dynasty','Qin Dynasty','Ming Dynasty'], ans:2 },
    { q:'Which empire was the largest in history?', options:['Roman','Mongol','British','Ottoman'], ans:1 },
    { q:'Who discovered America?', options:['Vasco da Gama','Columbus','Magellan','Amerigo Vespucci'], ans:1 },
    { q:'In which year did the Berlin Wall fall?', options:['1987','1988','1989','1990'], ans:2 },
    { q:'Who was the first man on the moon?', options:['Buzz Aldrin','Neil Armstrong','Yuri Gagarin','John Glenn'], ans:1 },
    { q:'Which civilization built Machu Picchu?', options:['Aztec','Maya','Inca','Olmec'], ans:2 },
    { q:'In which city was the Titanic built?', options:['London','Belfast','Liverpool','Glasgow'], ans:1 },
    // 15 New
    { q:'Which is considered the oldest known civilization?', options:['Egyptian','Indus Valley','Sumerian','Mayan'], ans:2 },
    { q:'Who painted the ceiling of the Sistine Chapel?', options:['Leonardo da Vinci','Michelangelo','Raphael','Donatello'], ans:1 },
    { q:'Which famous ocean liner sank on its maiden voyage in 1912?', options:['Lusitania','Britannic','Titanic','Queen Mary'], ans:2 },
    { q:'Who was the first female Prime Minister of the UK?', options:['Theresa May','Indira Gandhi','Margaret Thatcher','Angela Merkel'], ans:2 },
    { q:'In what year did the French Revolution begin?', options:['1776','1789','1812','1848'], ans:1 },
    { q:'What is the name of the ancient Roman amphitheater used for gladiator contests?', options:['Pantheon','Parthenon','Colosseum','Forum'], ans:2 },
    { q:'Who was the first Emperor of unified China?', options:['Sun Yat-sen','Qin Shi Huang','Han Wudi','Kublai Khan'], ans:1 },
    { q:'Which explosive invention originated in ancient China?', options:['Dynamite','Gunpowder','TNT','Napalm'], ans:1 },
    { q:'Which Roman city was destroyed by the eruption of Mount Vesuvius?', options:['Rome','Athens','Pompeii','Sparta'], ans:2 },
    { q:'Who was the principal author of the US Declaration of Independence?', options:['George Washington','Thomas Jefferson','John Adams','Benjamin Franklin'], ans:1 },
    { q:'Who was the last Tsar of the Russian Empire?', options:['Peter the Great','Ivan the Terrible','Nicholas II','Alexander III'], ans:2 },
    { q:'In which country did the Renaissance originate?', options:['France','England','Spain','Italy'], ans:3 },
    { q:'Who led the Soviet Union during World War II?', options:['Vladimir Lenin','Joseph Stalin','Leon Trotsky','Nikita Khrushchev'], ans:1 },
    { q:'Who was the first human to journey into outer space?', options:['Neil Armstrong','Yuri Gagarin','John Glenn','Alan Shepard'], ans:1 },
    { q:'Which of these is one of the Seven Wonders of the Ancient World?', options:['Colosseum','Great Wall','Great Pyramid of Giza','Stonehenge'], ans:2 },
  ],
  sports: [
    // Original 10
    { q:'How many players in a soccer team?', options:['9','10','11','12'], ans:2 },
    { q:'Which country won the 2018 FIFA World Cup?', options:['Brazil','Germany','France','Croatia'], ans:2 },
    { q:'How many Grand Slams in tennis per year?', options:['2','3','4','5'], ans:2 },
    { q:'Which sport uses a shuttlecock?', options:['Tennis','Squash','Badminton','Pickleball'], ans:2 },
    { q:'How long is a marathon?', options:['40km','41km','42.195km','43km'], ans:2 },
    { q:'Which country invented cricket?', options:['Australia','India','England','South Africa'], ans:2 },
    { q:'How many rings on the Olympic flag?', options:['4','5','6','7'], ans:1 },
    { q:'Which sport is played at Wimbledon?', options:['Golf','Cricket','Tennis','Squash'], ans:2 },
    { q:'Who has won the most Olympic gold medals?', options:['Usain Bolt','Michael Phelps','Carl Lewis','Mark Spitz'], ans:1 },
    { q:'How many players in a basketball team?', options:['4','5','6','7'], ans:1 },
    // 15 New
    { q:'What is a perfect score in a game of ten-pin bowling?', options:['100','200','300','400'], ans:2 },
    { q:'What term is used in tennis for a score of zero?', options:['Nil','Zero','Love','Blank'], ans:2 },
    { q:'How many pockets does a standard snooker table have?', options:['4','6','8','10'], ans:1 },
    { q:'Which NBA players silhouette is featured on the official NBA logo?', options:['Michael Jordan','Magic Johnson','Jerry West','Larry Bird'], ans:2 },
    { q:'In golf, what is three strokes under par on a single hole called?', options:['Eagle','Birdie','Albatross','Bogey'], ans:2 },
    { q:'Which NFL team has won the most Super Bowls (tied at 6)?', options:['Dallas Cowboys','New England Patriots','Green Bay Packers','San Francisco 49ers'], ans:1 },
    { q:'How long is a standard professional mens boxing round?', options:['2 minutes','3 minutes','4 minutes','5 minutes'], ans:1 },
    { q:'In which game would you use the term Checkmate?', options:['Checkers','Backgammon','Chess','Dominoes'], ans:2 },
    { q:'What color is the leaders jersey in the Tour de France?', options:['Green','Red','Polka Dot','Yellow'], ans:3 },
    { q:'What was Muhammad Alis birth name?', options:['Joe Frazier','Cassius Clay','George Foreman','Sugar Ray'], ans:1 },
    { q:'How many bases are there on a standard baseball diamond?', options:['3','4','5','6'], ans:1 },
    { q:'What is the Olympic motto?', options:['Faster, Higher, Stronger','Play Hard, Win Big','One World, One Dream','Peace, Love, Sports'], ans:0 },
    { q:'In which country did the martial art of Judo originate?', options:['China','South Korea','Japan','Thailand'], ans:2 },
    { q:'Which sport uses a rubber disk called a puck?', options:['Field Hockey','Ice Hockey','Lacrosse','Curling'], ans:1 },
    { q:'What is the international governing body of association football (soccer)?', options:['UEFA','CONCACAF','FIFA','IOC'], ans:2 },
  ],
}

export default function Quiz({ onScore }) {
  const [category, setCategory] = useState(null)
  const [questions, setQs]      = useState([])
  const [current,  setCurrent]  = useState(0)
  const [selected, setSelected] = useState(null)
  const [score,    setScore]    = useState(0)
  const [correct,  setCorrect]  = useState(0)
  const [time,     setTime]     = useState(15)
  const [done,     setDone]     = useState(false)
  const timerRef = useRef(null)

  function startQuiz(cat) {
    // 🔥 Magic happens here: Shuffles all 25 questions, then slices exactly 10!
    const qs = shuffleArray(QUESTIONS[cat]).slice(0, 10)
    
    setCategory(cat); setQs(qs); setCurrent(0); setSelected(null)
    setScore(0); setCorrect(0); setTime(15); setDone(false)
  }

  useEffect(() => {
    if (!category || done || selected !== null) return
    setTime(15)
    timerRef.current = setInterval(() => {
      setTime(t => {
        if (t <= 1) { clearInterval(timerRef.current); next(null); return 15 }
        return t-1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [current, category, done])

  function answer(idx) {
    if (selected !== null) return
    clearInterval(timerRef.current)
    setSelected(idx)
    const isCorrect = idx === questions[current].ans
    const timeBonus = Math.floor(time * 50/15)
    const pts = isCorrect ? 100 + timeBonus : 0
    setScore(s => s+pts)
    if (isCorrect) setCorrect(c => c+1)
    setTimeout(() => next(idx), 1200)
  }

  function next(idx) {
    if (current >= questions.length-1) {
      const finalScore = score + (idx===questions[current]?.ans ? 100+Math.floor(time*50/15) : 0)
      setDone(true)
      onScore && onScore(finalScore)
    } else {
      setCurrent(c => c+1)
      setSelected(null)
    }
  }

  // --- Premium UI Rendering ---
  return (
    <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
      <style>{`
        .quiz-wrapper {
          width: 100%; max-width: 540px; min-height: 500px;
          background: #080b14; border-radius: 20px;
          border: 2px solid rgba(0, 180, 216, 0.3);
          box-shadow: 0 0 30px rgba(0, 180, 216, 0.15);
          display: flex; flex-direction: column;
          padding: 32px; box-sizing: border-box;
          position: relative; overflow: hidden;
          font-family: 'Inter', sans-serif;
        }

        .cat-grid, .options-grid {
          display: grid; width: 100%; gap: 16px;
        }
        
        .cat-grid { grid-template-columns: repeat(2, 1fr); margin-top: 24px; }
        .options-grid { grid-template-columns: repeat(2, 1fr); margin-top: 16px; }

        .cat-btn {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
          padding: 24px 16px; border-radius: 16px; color: var(--text);
          font-family: 'Orbitron', sans-serif; font-weight: 700; font-size: 16px;
          cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex; flex-direction: column; align-items: center; gap: 12px;
        }
        .cat-btn:hover {
          background: rgba(0, 180, 216, 0.1); border-color: #00b4d8;
          color: #00b4d8; box-shadow: 0 10px 20px rgba(0, 180, 216, 0.2);
          transform: translateY(-4px);
        }
        .cat-icon { font-size: 32px; filter: drop-shadow(0 0 8px rgba(0, 180, 216, 0.5)); }

        .opt-btn {
          padding: 16px; border-radius: 12px;
          font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 16px;
          cursor: pointer; transition: all 0.2s; text-align: left;
          display: flex; gap: 12px; align-items: center;
        }
        .opt-btn:hover:not(:disabled) {
          transform: scale(1.02); box-shadow: 0 4px 15px rgba(255,255,255,0.1);
        }
        .opt-letter {
          width: 28px; height: 28px; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; flex-shrink: 0; font-family: 'Russo One', sans-serif;
        }

        .animate-enter { animation: slideUp 0.4s ease forwards; }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .arcade-btn {
          background: rgba(0, 180, 216, 0.15); border: 1px solid #00b4d8;
          color: #00b4d8; font-family: 'Orbitron', sans-serif; font-weight: 700;
          letter-spacing: 1px; cursor: pointer; transition: all 0.2s;
          height: 48px; padding: 0 32px; border-radius: 8px; font-size: 14px;
        }
        .arcade-btn:hover {
          background: #00b4d8; color: #000; box-shadow: 0 0 20px rgba(0,180,216,0.6);
        }

        /* 📱 MOBILE RESPONSIVENESS */
        @media (max-width: 480px) {
          .quiz-wrapper { padding: 20px; min-height: 460px; border-radius: 16px; }
          .options-grid { grid-template-columns: 1fr; gap: 10px; }
          .cat-grid { grid-template-columns: 1fr; gap: 12px; }
          .cat-btn { padding: 16px; flex-direction: row; justify-content: center; }
          .cat-icon { font-size: 24px; }
        }
      `}</style>

      <div className="quiz-wrapper">
        
        {/* --- 1. CATEGORY SELECTION --- */}
        {!category && (
          <div className="animate-enter" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', flex: 1 }}>
            <h2 style={{ fontFamily:'Orbitron,sans-serif', fontSize: 'clamp(20px, 5vw, 26px)', color:'#00b4d8', margin:0, textShadow:'0 0 15px rgba(0,180,216,0.5)' }}>
              SELECT DIRECTORY
            </h2>
            <div className="cat-grid">
              {[
                ['gk', 'General Knowledge', '🌍'],
                ['science', 'Science', '🔬'],
                ['history', 'History', '📜'],
                ['sports', 'Sports', '⚽']
              ].map(([id, label, icon]) => (
                <button key={id} onClick={() => startQuiz(id)} className="cat-btn">
                  <div className="cat-icon">{icon}</div>
                  <div>{label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- 2. RESULTS SCREEN --- */}
        {category && done && (
          <div className="animate-enter" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex: 1, gap: 24 }}>
            <div style={{ fontFamily:'Orbitron,sans-serif', fontSize:26, color:'#00b4d8', letterSpacing: '2px' }}>MODULE CLEARED</div>
            
            <div style={{ width:140, height:140, borderRadius:'50%', background: 'rgba(0,180,216,0.1)', border:`4px solid #00b4d8`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', boxShadow: '0 0 30px rgba(0,180,216,0.3)' }}>
              <div style={{ fontFamily:'Russo One,sans-serif', fontSize:42, color:'#00b4d8' }}>{correct}</div>
              <div style={{ fontFamily:'Inter,sans-serif', fontSize:14, color:'var(--muted)' }}>OUT OF {questions.length}</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily:'Russo One,sans-serif', fontSize:32, color:'#fff' }}>{score} PTS</div>
              <div style={{ fontFamily:'Rajdhani,sans-serif', fontWeight: 700, fontSize:16, color:'var(--muted)', letterSpacing: '1px' }}>
                ACCURACY: {Math.round(correct/questions.length*100)}%
              </div>
            </div>
            
            <div style={{ display:'flex', gap:12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button className="arcade-btn" onClick={()=>startQuiz(category)}>RETRY MODULE</button>
              <button className="arcade-btn" style={{ background: 'transparent', color: 'var(--muted)', borderColor: 'var(--border)' }} onClick={()=>setCategory(null)}>MAIN MENU</button>
            </div>
          </div>
        )}

        {/* --- 3. ACTIVE QUESTION SCREEN --- */}
        {category && !done && (
          <div key={current} className="animate-enter" style={{ display:'flex', flexDirection:'column', flex: 1 }}>
            
            {/* HUD Header */}
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom: 24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'Orbitron,sans-serif', fontWeight:700, fontSize:12, color:'var(--muted)', letterSpacing: '1px' }}>
                <span>Q {current+1} / {questions.length}</span>
                <span style={{ color:'#00b4d8' }}>SCORE: {score}</span>
              </div>
              <div style={{ height:6, background:'rgba(255,255,255,0.05)', borderRadius:3, overflow: 'hidden' }}>
                <div style={{ height:'100%', width:`${((current)/questions.length)*100}%`, background:'#00b4d8', borderRadius:3, transition:'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 0 10px #00b4d8' }}/>
              </div>
            </div>

            {/* Question Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              
              {/* Radar Timer */}
              <div style={{ position:'relative', width:70, height:70, marginBottom: 20 }}>
                <svg viewBox="0 0 72 72" width="70" height="70" style={{ filter: `drop-shadow(0 0 8px ${time<=5?'#e63946':time<=10?'#f4a261':'#00b4d8'})` }}>
                  <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4"/>
                  <circle cx="36" cy="36" r="30" fill="none"
                    stroke={time<=5?'#e63946':time<=10?'#f4a261':'#00b4d8'}
                    strokeWidth="4" strokeDasharray={`${2*Math.PI*30}`}
                    strokeDashoffset={`${2*Math.PI*30*(1-(time/15)*100/100)}`}
                    strokeLinecap="round" transform="rotate(-90 36 36)"
                    style={{ transition:'stroke-dashoffset 1s linear, stroke 0.3s' }}
                  />
                </svg>
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Russo One,sans-serif', fontSize:22, color: time<=5?'#e63946':'#fff' }}>
                  {time}
                </div>
              </div>

              {/* The Question */}
              <h3 style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:'clamp(20px, 4vw, 24px)', color:'#fff', textAlign:'center', lineHeight:1.4, margin: '0 0 24px 0', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {questions[current].q}
              </h3>

              {/* Options Grid */}
              <div className="options-grid">
                {questions[current].options.map((opt,i) => {
                  const isCorrect = i === questions[current].ans
                  const isSelected = i === selected
                  let bg = 'rgba(255,255,255,0.03)', border = 'rgba(255,255,255,0.1)', color = 'var(--text)', letterBg = 'rgba(255,255,255,0.05)'
                  
                  if (selected !== null) {
                    if (isCorrect) { bg='rgba(46,196,182,0.15)'; border='#2ec4b6'; color='#2ec4b6'; letterBg='#2ec4b6' }
                    else if (isSelected) { bg='rgba(230,57,70,0.15)'; border='#e63946'; color='#e63946'; letterBg='#e63946' }
                  }

                  return (
                    <button key={i} className="opt-btn" onClick={()=>answer(i)} disabled={selected!==null}
                      style={{ background:bg, border:`1px solid ${border}`, color }}>
                      <span className="opt-letter" style={{ background: letterBg, color: selected !== null && (isCorrect || isSelected) ? '#000' : 'var(--text)' }}>
                        {['A','B','C','D'][i]}
                      </span>
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}