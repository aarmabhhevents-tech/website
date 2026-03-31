const asyncHandler = require('express-async-handler')
const SiteSettings = require('../models/SiteSettings')

const getSettings = asyncHandler(async (req, res) => {
  const doc = await SiteSettings.findOne({})
  res.json(doc || {})
})

const updateInsertSettings = asyncHandler(async (req, res) => {
  // Fixed: was { updateInsert: true } which is not a valid Mongoose option.
  // Correct option is { upsert: true } — creates the document if it doesn't exist.
  const doc = await SiteSettings.findOneAndUpdate({}, req.body, { upsert: true, new: true })
  res.json(doc)
})

module.exports = { getSettings, updateInsertSettings }