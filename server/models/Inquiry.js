const mongoose = require('mongoose')

const inquirySchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    eventType: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
    notes: { type: String, default: '' },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Inquiry', inquirySchema)

