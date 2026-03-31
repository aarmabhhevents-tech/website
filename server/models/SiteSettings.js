const mongoose = require('mongoose')

const siteSettingsSchema = new mongoose.Schema(
  {
    contact: {
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      phoneTel: { type: String, default: '' },
      address: { type: String, default: '' },
    },
    social: {
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
    },
    branding: {
      founderName: { type: String, default: '' },
      tagline: { type: String, default: '' },
      aboutShort: { type: String, default: '' },
    },
    seo: {
      metaTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      keywords: { type: String, default: '' },
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('SiteSettings', siteSettingsSchema)

