const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const adminUserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: 'Admin' },
    isAdmin: { type: Boolean, default: true },
  },
  { timestamps: true },
)

adminUserSchema.methods.comparePassword = async function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash)
}

adminUserSchema.statics.hashPassword = async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

module.exports = mongoose.model('AdminUser', adminUserSchema)

