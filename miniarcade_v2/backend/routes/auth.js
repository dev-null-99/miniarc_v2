const express    = require('express')
const router     = express.Router()
const bcrypt     = require('bcryptjs')
const jwt        = require('jsonwebtoken')
const db         = require('../db')
const isBadWord  = require('../middleware/badwords')

// ── SIGNUP ──
router.post('/signup', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password)
    return res.status(400).json({ message: 'All fields required' })

  if (!/^[a-zA-Z0-9]{3,15}$/.test(username))
    return res.status(400).json({ message: 'Username: 3-15 characters, letters and numbers only' })

  if (password.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters' })

  if (isBadWord(username))
    return res.status(400).json({ message: 'Username not available' })

  try {
    const hash = await bcrypt.hash(password, 12)
    await db.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hash]
    )
    res.json({ message: 'Signup successful!' })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(400).json({ message: 'Username already taken' })
    res.status(500).json({ message: 'Server error' })
  }
})

// ── LOGIN ──
router.post('/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password)
    return res.status(400).json({ message: 'All fields required' })

  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE username = ?', [username]
    )
    if (rows.length === 0)
      return res.status(401).json({ message: 'Username not found' })

    const user  = rows[0]
    const match = await bcrypt.compare(password, user.password)
    if (!match)
      return res.status(401).json({ message: 'Wrong password' })

    const token = jwt.sign(
      { user_id: user.user_id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message:  'Login successful!',
      token,
      username: user.username,
      user_id:  user.user_id,
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router