const express = require('express')
const router = express.Router()
const db = require('../db')

// ── FETCH TOP 10 PLAYERS FOR A SPECIFIC GAME ──
router.get('/:game_slug', async (req, res) => {
  const { game_slug } = req.params
  
  try {
    const [rows] = await db.query(`
      SELECT 
        u.username, 
        l.best_score, 
        l.updated_at
      FROM leaderboard l
      JOIN users u ON l.user_id = u.user_id
      JOIN games g ON l.game_id = g.game_id
      WHERE g.game_slug = ?
      ORDER BY l.best_score DESC
      LIMIT 10
    `, [game_slug])
    
    res.json(rows)
  } catch (err) {
    console.error('❌ Leaderboard Fetch Error:', err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router