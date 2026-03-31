const mongoose = require('mongoose')

const serviceSchema = new mongoose.Schema(
  {
    number: { type: String, default: '' },
    icon: { type: String, default: '' },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    sort_order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Service', serviceSchema)

