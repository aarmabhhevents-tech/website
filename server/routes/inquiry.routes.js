const express = require('express')
const { createInquiry, listInquiries, updateInquiry, deleteInquiry } = require('../controllers/inquiry.controller')
const { requireAuth, requireAdmin } = require('../middleware/auth')

const router = express.Router()

// Public: contact form submit
router.post('/', createInquiry)

// Admin
router.get('/', requireAuth, requireAdmin, listInquiries)
router.patch('/:id', requireAuth, requireAdmin, updateInquiry)
router.delete('/:id', requireAuth, requireAdmin, deleteInquiry)

module.exports = router

