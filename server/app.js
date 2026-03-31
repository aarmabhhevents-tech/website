const express      = require('express')
const cors         = require('cors')
const cookieParser = require('cookie-parser')
const morgan       = require('morgan')
const path         = require('path')
const rateLimit    = require('express-rate-limit')       // FIXED: added rate limiting
const mongoSanitize = require('express-mongo-sanitize')  // FIXED: added NoSQL injection protection
require('dotenv').config()

const { connectDb }     = require('./config/db')
const { notFound, errorHandler } = require('./middleware/error')

const authRoutes     = require('./routes/auth.routes')
const inquiryRoutes  = require('./routes/inquiry.routes')
const serviceRoutes  = require('./routes/service.routes')
const eventRoutes    = require('./routes/event.routes')
const galleryRoutes  = require('./routes/gallery.routes')
const bookingRoutes  = require('./routes/booking.routes')
const settingsRoutes = require('./routes/settings.routes')
const uploadRoutes   = require('./routes/upload.routes')

connectDb()

const app = express()

app.use(morgan('dev'))
app.use(cookieParser())

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

// FIXED: Sanitize request body/params/query against NoSQL injection (e.g. $where, $gt attacks)
app.use(mongoSanitize())

app.use(
  cors({
    origin: (origin, cb) => {
      const allowed = (process.env.CLIENT_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean)
      if (!origin) return cb(null, true)
      if (allowed.length === 0) return cb(null, true)
      if (allowed.includes(origin)) return cb(null, true)
      return cb(new Error('Not allowed by CORS'))
    },
    credentials: true,
  }),
)

// ── FIXED: Rate limiters ──────────────────────────────────────────────────────

// Auth routes: strict limit — 10 attempts per 15 minutes per IP
// Protects against brute-force password attacks on the admin login
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Inquiry/contact form: 5 submissions per 10 minutes per IP
// Prevents spam from the public contact form
const inquiryLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: { error: 'Too many submissions. Please wait a few minutes and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
  // Only apply to POST (submission), not GET (admin reads)
  skip: (req) => req.method !== 'POST',
})

// General API: generous limit to prevent abuse but not block normal use
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

// ── Static uploads (dev / simple production) ─────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ── Routes — with rate limiters applied ──────────────────────────────────────
app.use('/api/auth',      authLimiter,    authRoutes)
app.use('/api/inquiries', inquiryLimiter, inquiryRoutes)
app.use('/api/services',  generalLimiter, serviceRoutes)
app.use('/api/events',    generalLimiter, eventRoutes)
app.use('/api/gallery',   generalLimiter, galleryRoutes)
app.use('/api/bookings',  generalLimiter, bookingRoutes)
app.use('/api/settings',  generalLimiter, settingsRoutes)
app.use('/api/upload',    generalLimiter, uploadRoutes)

app.use(notFound)
app.use(errorHandler)

module.exports = app