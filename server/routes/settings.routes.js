const express = require('express')
const { getSettings, updateInsertSettings } = require('../controllers/settings.controller')
const { requireAuth, requireAdmin } = require('../middleware/auth')

const router = express.Router()

// Public: allow read-only settings for footer/contact
router.get('/', getSettings)

// Admin: update settings
router.put('/', requireAuth, requireAdmin, updateInsertSettings)

module.exports = router

