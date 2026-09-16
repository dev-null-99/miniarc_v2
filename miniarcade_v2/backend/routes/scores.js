const express = require('express')
const router = express.Router()
const db = require('../db')
const auth = require('../middleware/auth')

// ── 1. SAVE SCORE & SYNC LEADERBOARD ──
router.post('/save', auth, async (req, res) => {
  const { game_slug, score } = req.body
  const user_id = req.user.user_id

  try {
    // 1. Find Game ID from Slug
    const [games] = await db.query('SELECT game_id FROM games WHERE game_slug = ?', [game_slug])
    if (games.length === 0) {
      return res.status(404).json({ message: 'Game not found' })
    }
    const game_id = games[0].game_id

    // 2. Save to History (scores table)
    await db.query('INSERT INTO scores (user_id, game_id, score) VALUES (?, ?, ?)', [user_id, game_id, score])

    // 3. Bulletproof Leaderboard Sync (No dependency on DB constraints)
    // Pehle check karo ki is user ne ye game pehle khela hai ya nahi
    const [existing] = await db.query(
      'SELECT lb_id, best_score FROM leaderboard WHERE user_id = ? AND game_id = ?', 
      [user_id, game_id]
    )

    if (existing.length > 0) {
      // Agar khela hai, toh check karo kya naya score purane score se bada hai?
      if (score > existing[0].best_score) {
        await db.query(
          'UPDATE leaderboard SET best_score = ?, updated_at = CURRENT_TIMESTAMP WHERE lb_id = ?',
          [score, existing[0].lb_id]
        )
      }
    } else {
      // Agar pehli baar khela hai, toh nayi entry dalo
      await db.query(
        'INSERT INTO leaderboard (user_id, game_id, best_score) VALUES (?, ?, ?)',
        [user_id, game_id, score]
      )
    }

    res.status(200).json({ message: 'Score saved & Leaderboard synced successfully!' })
  } catch (err) {
    console.error('❌ Save Score Error:', err)
    res.status(500).json({ message: 'Server error while saving score' })
  }
})

// ── 2. GET USER SCORE HISTORY (Fixes the 404 Error) ──
router.get('/history', auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.score_id, s.score, s.played_at, g.game_name, g.game_slug 
      FROM scores s
      JOIN games g ON s.game_id = g.game_id
      WHERE s.user_id = ?
      ORDER BY s.played_at DESC
      LIMIT 50
    `, [req.user.user_id])
    
    res.json(rows)
  } catch (err) {
    console.error('❌ Fetch History Error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// ── 3. GET USER BEST SCORES ──
router.get('/best', auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT g.game_slug, l.best_score 
      FROM leaderboard l
      JOIN games g ON l.game_id = g.game_id
      WHERE l.user_id = ?
    `, [req.user.user_id])
    
    res.json(rows)
  } catch (err) {
    console.error('❌ Fetch Best Scores Error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router