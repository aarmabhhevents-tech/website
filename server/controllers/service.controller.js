const asyncHandler = require('express-async-handler')
const Service = require('../models/Service')

const listServices = asyncHandler(async (req, res) => {
  const { public: isPublic } = req.query
  const filter = {}
  if (String(isPublic).toLowerCase() === 'true') filter.is_active = true
  const rows = await Service.find(filter).sort({ sort_order: 1, createdAt: 1 })
  res.json(rows)
})

const createService = asyncHandler(async (req, res) => {
  const created = await Service.create(req.body)
  res.status(201).json(created)
})

const updateService = asyncHandler(async (req, res) => {
  const { id } = req.params
  const updated = await Service.findByIdAndUpdate(id, req.body, { new: true })
  if (!updated) {
    res.status(404)
    throw new Error('Service not found')
  }
  res.json(updated)
})

const deleteService = asyncHandler(async (req, res) => {
  const { id } = req.params
  const deleted = await Service.findByIdAndDelete(id)
  if (!deleted) {
    res.status(404)
    throw new Error('Service not found')
  }
  res.json({ ok: true })
})

module.exports = { listServices, createService, updateService, deleteService }

