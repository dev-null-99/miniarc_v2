const jwt = require('jsonwebtoken')

module.exports = function verifyToken(req, res, next) {
  const token = req.headers['authorization']
  if (!token)
    return res.status(401).json({ message: 'Token required' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}