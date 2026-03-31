const express = require('express')
const { requireAuth, requireAdmin } = require('../middleware/auth')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

const router = express.Router()

const upload = multer({ storage: multer.memoryStorage() })

router.post('/gallery', requireAuth, requireAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'image file is required (field: image)' })
  }

  const ext = path.extname(req.file.originalname || '').toLowerCase() || '.jpg'
  const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg'

  const dir = path.join(__dirname, '..', 'uploads', 'gallery')
  fs.mkdirSync(dir, { recursive: true })

  const filename = `${crypto.randomUUID()}${safeExt}`
  const fullPath = path.join(dir, filename)
  fs.writeFileSync(fullPath, req.file.buffer)

  // Served by app.js as /uploads/...
  const url = `/uploads/gallery/${filename}`
  res.status(201).json({ url, public_id: filename })
})

module.exports = router

