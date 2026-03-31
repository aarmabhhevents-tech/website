const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true, trim: true },
    email: { type: String, default: '', lowercase: true, trim: true },
    phone: { type: String, default: '', trim: true },
    eventType: { type: String, default: 'Wedding', trim: true },
    eventDate: { type: Date, required: true },
    budget: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ['pending', 'advance', 'paid', 'refunded'], default: 'pending' },
    advancePaid: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    fromInquiryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inquiry', default: null },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Booking', bookingSchema)

