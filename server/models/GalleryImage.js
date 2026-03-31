const mongoose = require('mongoose')

const galleryImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    title: { type: String, default: '' },
    category: { type: String, default: 'Wedding' },
    sort_order: { type: Number, default: 0 },

    // Optional: if you later integrate Cloudinary or similar
    public_id: { type: String, default: '' },

    // Matches your admin UI display (YYYY-MM-DD)
    uploadedAt: { type: String, default: '' },
  },
  { timestamps: true },
)

module.exports = mongoose.model('GalleryImage', galleryImageSchema)

