const express = require('express')
const { listEvents, createEvent, updateEvent, deleteEvent } = require('../controllers/event.controller')
const { requireAuth, requireAdmin } = require('../middleware/auth')

const router = express.Router()

// Public can read published events: /api/events?public=true
router.get('/', listEvents)

// Admin CRUD
router.post('/', requireAuth, requireAdmin, createEvent)
router.patch('/:id', requireAuth, requireAdmin, updateEvent)
router.delete('/:id', requireAuth, requireAdmin, deleteEvent)

module.exports = router

