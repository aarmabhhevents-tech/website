const express = require('express')
const { listBookings, createBooking, updateBooking, deleteBooking } = require('../controllers/booking.controller')
const { requireAuth, requireAdmin } = require('../middleware/auth')

const router = express.Router()

router.get('/', requireAuth, requireAdmin, listBookings)
router.post('/', requireAuth, requireAdmin, createBooking)
router.patch('/:id', requireAuth, requireAdmin, updateBooking)
router.delete('/:id', requireAuth, requireAdmin, deleteBooking)

module.exports = router

