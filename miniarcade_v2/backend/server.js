const express   = require('express')
const cors      = require('cors')
const dotenv    = require('dotenv')
const helmet    = require('helmet')
const rateLimit = require('express-rate-limit')

dotenv.config()
const app = express()

// ── Rate Limiter / Proxy Fix (For Render) ──
// Ye line add karni bohot zaroori thi, iske bina 500 error aayega
app.set('trust proxy', 1) 

// ── Security ──
app.use(helmet())
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://miniarcd.netlify.app', // Yahan last wala '/' hata diya, wo CORS fail karata hai
  ],
  credentials: true,
}))
app.use(express.json())

// ── Rate Limiting ──
app.use('/api/', rateLimit({ windowMs: 15*60*1000, max: 200 }))
app.use('/api/auth/login', rateLimit({ windowMs: 60*1000, max: 10, message: { message: 'Too many attempts' } }))

// ── Routes ──
app.use('/api/auth',        require('./routes/auth'))
app.use('/api/scores',      require('./routes/scores'))
app.use('/api/leaderboard', require('./routes/leaderboard'))

// ── Health Check ──
app.get('/', (req, res) => res.json({ message: '✅ MiniArcade API running!' }))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`))