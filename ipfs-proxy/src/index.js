const express = require('express')
const imageType = require('image-type')
const Busboy = require('connect-busboy')

const config = require('./config')
const logger = require('./logger')

function validate(req, res, next) {
  req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    file.fileRead = []

    file.on('limit', function() {
      logger.warn(`File too large`)
      res.writeHead(413, { 'Connection': 'close' });
      res.end()
      req.unpipe(req.busboy)
    })

    file.on('data', function(chunk) {
      file.fileRead.push(chunk)
    })

    file.on('end', function() {
      logger.debug(`Upload complete`)
      const buffer = Buffer.concat(file.fileRead);
      const image = imageType(buffer)
      if (image) {
        logger.debug(`Detected image of type ${image.mime}`)
        next()
      } else {
        // Not an image, must be JSON
        try {
          JSON.parse(data)
        } catch (error) {
          logger.error('Could not parse JSON')
          res.writeHead(415, { 'Connection': 'close' })
          res.end()
          req.unpipe(req.busboy)
        }
      }
      res.writeHead(200, { 'Connection': 'close' })
      res.end()
    })
  })

  req.pipe(req.busboy)
}

function uploadToIpfs(req, res, next) {
  logger.debug(`Uploading file to IPFS`)
}

const app = express()

app.use(Busboy({
  limits: {
    fileSize: 2 * 1024 * 1024
  }
}))

app.use('/api/v0/add', validate)
app.use('/api/v0/add', uploadToIpfs)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const server = app.listen(config.IPFS_PROXY_PORT, () =>
  logger.debug(`Listening on port ${config.IPFS_PROXY_PORT}`)
)

module.exports = server
