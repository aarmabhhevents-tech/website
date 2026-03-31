const http = require('http')
const app = require('./app')

const PORT = Number(process.env.PORT || 5000)

const server = http.createServer(app)

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${PORT}`)
})

