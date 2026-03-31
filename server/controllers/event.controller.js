const asyncHandler = require('express-async-handler')
const Event = require('../models/Event')

const listEvents = asyncHandler(async (req, res) => {
  const { public: isPublic } = req.query
  const filter = {}
  if (String(isPublic).toLowerCase() === 'true') filter.is_active = true
  const rows = await Event.find(filter).sort({ sort_order: 1, createdAt: 1 })
  res.json(rows)
})

const createEvent = asyncHandler(async (req, res) => {
  const created = await Event.create(req.body)
  res.status(201).json(created)
})

const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params
  const updated = await Event.findByIdAndUpdate(id, req.body, { new: true })
  if (!updated) {
    res.status(404)
    throw new Error('Event not found')
  }
  res.json(updated)
})

const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params
  const deleted = await Event.findByIdAndDelete(id)
  if (!deleted) {
    res.status(404)
    throw new Error('Event not found')
  }
  res.json({ ok: true })
})

module.exports = { listEvents, createEvent, updateEvent, deleteEvent }

