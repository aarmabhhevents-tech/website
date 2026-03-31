const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')
const AdminUser = require('../models/AdminUser')

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email, isAdmin: !!user.isAdmin, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  )
}

const registerAdmin = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body
  if (!email || !password) {
    res.status(400)
    throw new Error('email and password are required')
  }

  const exists = await AdminUser.findOne({ email: email.toLowerCase() })
  if (exists) {
    res.status(409)
    throw new Error('admin already exists')
  }

  const passwordHash = await AdminUser.hashPassword(password)
  const user = await AdminUser.create({ email, passwordHash, name: name || 'Admin', isAdmin: true })
  const token = signToken(user)

  res.status(201).json({
    token,
    user: { id: user._id, email: user.email, name: user.name, isAdmin: user.isAdmin },
  })
})

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400)
    throw new Error('email and password are required')
  }

  const user = await AdminUser.findOne({ email: email.toLowerCase() })
  if (!user) {
    res.status(401)
    throw new Error('invalid credentials')
  }

  const ok = await user.comparePassword(password)
  if (!ok) {
    res.status(401)
    throw new Error('invalid credentials')
  }

  const token = signToken(user)
  res.json({
    token,
    user: { id: user._id, email: user.email, name: user.name, isAdmin: user.isAdmin },
  })
})

const me = asyncHandler(async (req, res) => {
  const user = await AdminUser.findById(req.user.sub).select('-passwordHash')
  if (!user) {
    res.status(404)
    throw new Error('user not found')
  }
  res.json({ user })
})

module.exports = { registerAdmin, loginAdmin, me }

