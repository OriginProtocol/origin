const express = require('express')
const Busboy = require('connect-busboy')

const config = require('./config')
const logger = require('./logger')

function validate(req, res, next) {
  const busboy = Busboy({
    limits: {
      fileSize: 2 * 1024 * 1024
    }
  })

  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    file.fileRead = []

    file.on('limit', function() {
      logger.warn(`File too large`)
    })

    file.on('data', function(chunk) {
      file.fileRead.push(chunk)
    })

    file.on('end', function() {
      logger.debug(`Upload complete`)
      var data = Buffer(file.fileRead);
    })

    req.pipe(busboy)
  })
}

function uploadToIpfs(req, res, next) {
  logger.warning(`Uploading file to IPFS`)
}

const app = express()

app.use('/api/v0/add', validate)
app.use('/api/v0/add', uploadToIpfs)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(config.IPFS_PROXY_PORT, () =>
  logger.debug(`Listening on port ${config.IPFS_PROXY_PORT}`)
)

module.exports = app
