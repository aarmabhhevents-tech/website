const asyncHandler = require('express-async-handler')
const GalleryImage = require('../models/GalleryImage')

const listImages = asyncHandler(async (req, res) => {
  const { category } = req.query
  const filter = {}
  if (category && category !== 'All') filter.category = String(category)

  const rows = await GalleryImage.find(filter).sort({ sort_order: 1, createdAt: 1 })
  res.json(rows)
})

const createImage = asyncHandler(async (req, res) => {
  const { url } = req.body
  if (!url) {
    res.status(400)
    throw new Error('url is required')
  }

  if (!req.body.uploadedAt) {
    req.body.uploadedAt = new Date().toISOString().split('T')[0]
  }
  const created = await GalleryImage.create(req.body)
  res.status(201).json(created)
})

const updateImage = asyncHandler(async (req, res) => {
  const { id } = req.params
  const updated = await GalleryImage.findByIdAndUpdate(id, req.body, { new: true })
  if (!updated) {
    res.status(404)
    throw new Error('Image not found')
  }
  res.json(updated)
})

const deleteImage = asyncHandler(async (req, res) => {
  const { id } = req.params
  const deleted = await GalleryImage.findByIdAndDelete(id)
  if (!deleted) {
    res.status(404)
    throw new Error('Image not found')
  }
  res.json({ ok: true })
})

const bulkDelete = asyncHandler(async (req, res) => {
  const { ids } = req.body
  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400)
    throw new Error('ids[] is required')
  }

  const result = await GalleryImage.deleteMany({ _id: { $in: ids } })
  res.json({ ok: true, deletedCount: result.deletedCount || 0 })
})

module.exports = { listImages, createImage, updateImage, deleteImage, bulkDelete }

