const asyncHandler = require('express-async-handler')
const Booking = require('../models/Booking')

const listBookings = asyncHandler(async (req, res) => {
  const rows = await Booking.find({}).sort({ eventDate: 1, createdAt: -1 })
  res.json(rows)
})

const createBooking = asyncHandler(async (req, res) => {
  const { clientName, eventDate } = req.body
  if (!clientName || !eventDate) {
    res.status(400)
    throw new Error('clientName and eventDate are required')
  }

  const created = await Booking.create(req.body)
  res.status(201).json(created)
})

const updateBooking = asyncHandler(async (req, res) => {
  const { id } = req.params
  const updated = await Booking.findByIdAndUpdate(id, req.body, { new: true })
  if (!updated) {
    res.status(404)
    throw new Error('Booking not found')
  }
  res.json(updated)
})

const deleteBooking = asyncHandler(async (req, res) => {
  const { id } = req.params
  const deleted = await Booking.findByIdAndDelete(id)
  if (!deleted) {
    res.status(404)
    throw new Error('Booking not found')
  }
  res.json({ ok: true })
})

module.exports = { listBookings, createBooking, updateBooking, deleteBooking }

