const asyncHandler = require('express-async-handler')
const Inquiry = require('../models/Inquiry')

const createInquiry = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, eventType, message } = req.body
  if (!firstName || !lastName || !email || !phone || !eventType || !message) {
    res.status(400)
    throw new Error('Missing required fields')
  }

  const inquiry = await Inquiry.create({
    firstName,
    lastName,
    email,
    phone,
    eventType,
    message,
  })

  res.status(201).json(inquiry)
})

const listInquiries = asyncHandler(async (req, res) => {
  const { status, q } = req.query
  const filter = {}
  if (status && ['new', 'contacted', 'closed'].includes(status)) filter.status = status
  if (q) {
    const s = String(q).trim()
    filter.$or = [
      { firstName: new RegExp(s, 'i') },
      { lastName: new RegExp(s, 'i') },
      { email: new RegExp(s, 'i') },
      { phone: new RegExp(s, 'i') },
      { eventType: new RegExp(s, 'i') },
    ]
  }

  const rows = await Inquiry.find(filter).sort({ createdAt: -1 })
  res.json(rows)
})

const updateInquiry = asyncHandler(async (req, res) => {
  const { id } = req.params
  const patch = {}
  if (typeof req.body.status === 'string') patch.status = req.body.status
  if (typeof req.body.notes === 'string') patch.notes = req.body.notes

  const updated = await Inquiry.findByIdAndUpdate(id, patch, { new: true })
  if (!updated) {
    res.status(404)
    throw new Error('Inquiry not found')
  }
  res.json(updated)
})

const deleteInquiry = asyncHandler(async (req, res) => {
  const { id } = req.params
  const deleted = await Inquiry.findByIdAndDelete(id)
  if (!deleted) {
    res.status(404)
    throw new Error('Inquiry not found')
  }
  res.json({ ok: true })
})

module.exports = { createInquiry, listInquiries, updateInquiry, deleteInquiry }

