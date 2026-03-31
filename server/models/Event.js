const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true },
    tag: { type: String, default: '' },
    headline: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    image_url: { type: String, default: '' },
    sort_order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Event', eventSchema)

