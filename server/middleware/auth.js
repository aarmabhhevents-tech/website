const jwt = require('jsonwebtoken')

function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    res.status(401)
    return next(new Error('Not authorized'))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    return next()
  } catch (e) {
    res.status(401)
    return next(new Error('Invalid token'))
  }
}

function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) {
    res.status(403)
    return next(new Error('Admin access required'))
  }
  return next()
}

module.exports = { requireAuth, requireAdmin }

