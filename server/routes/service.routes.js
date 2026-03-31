const express = require('express')
const { listServices, createService, updateService, deleteService } = require('../controllers/service.controller')
const { requireAuth, requireAdmin } = require('../middleware/auth')

const router = express.Router()

// Public can read published services: /api/services?public=true
router.get('/', listServices)

// Admin CRUD
router.post('/', requireAuth, requireAdmin, createService)
router.patch('/:id', requireAuth, requireAdmin, updateService)
router.delete('/:id', requireAuth, requireAdmin, deleteService)

module.exports = router

