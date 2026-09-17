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
        MAX(s.score) as best_score, 
        MAX(s.created_at) as updated_at
      FROM scores s
      JOIN users u ON s.user_id = u.user_id
      JOIN games g ON s.game_id = g.game_id
      WHERE g.game_slug = ?
      GROUP BY u.user_id, u.username
      ORDER BY best_score DESC
      LIMIT 10
    `, [game_slug])
    
    res.json(rows)
  } catch (err) {
    console.error('❌ Leaderboard Fetch Error:', err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router