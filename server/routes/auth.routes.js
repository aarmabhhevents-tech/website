const express    = require('express')
const { loginAdmin, registerAdmin, me } = require('../controllers/auth.controller')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

// POST /api/auth/login
// Rate limited by authLimiter in app.js (10 attempts / 15 min per IP)
router.post('/login', loginAdmin)

// POST /api/auth/register
// FIXED: requireAuth guard added so only an already-authenticated admin
// can create new admin accounts. This prevents public account creation.
router.post('/register', requireAuth, registerAdmin)

// GET /api/auth/me
router.get('/me', requireAuth, me)

module.exports = router