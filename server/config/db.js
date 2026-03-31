const mongoose = require('mongoose')

let connectingPromise = null

async function connectDb() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is required')

  // Prevent parallel connection attempts during nodemon restarts.
  if (connectingPromise) return connectingPromise

  connectingPromise = (async () => {
    const maxAttempts = 8
    const delayMs = 2000

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 45000,
        })
        // eslint-disable-next-line no-console
        console.log('MongoDB connected')
        return
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`MongoDB connection attempt ${attempt}/${maxAttempts} failed`, err?.message || err)
        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, delayMs))
        }
      }
    }

    // Keep the app running; DB may come back later. Requests will still fail
    // until the connection succeeds, but we keep retrying.
    console.error('MongoDB connection could not be established after retries')
    connectingPromise = null
    setTimeout(() => {
      // Fire and forget retry
      connectDb().catch(() => {})
    }, 5000)
  })()

  return connectingPromise
}

module.exports = { connectDb }

