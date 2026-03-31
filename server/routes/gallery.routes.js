const express = require('express')
const { listImages, createImage, updateImage, deleteImage, bulkDelete } = require('../controllers/gallery.controller')
const { requireAuth, requireAdmin } = require('../middleware/auth')

const router = express.Router()

router.get('/', listImages)
router.delete('/bulk', requireAuth, requireAdmin, bulkDelete)
router.post('/', requireAuth, requireAdmin, createImage)
router.patch('/:id', requireAuth, requireAdmin, updateImage)
router.delete('/:id', requireAuth, requireAdmin, deleteImage)

module.exports = router

