const Busboy = require('busboy')
const imageType = require('image-type')
const isJSON = require('is-json')
const http = require('http')
const request = require('superagent')
const zlib = require('zlib')

const config = require('./config')
const logger = require('./logger')

const validImageTypes = ['image/jpeg', 'image/gif', 'image/png']

function isValidImage(data) {
  const image = imageType(data)
  return image && validImageTypes.includes(image.mime)
}

function handleFileUpload (req, res) {
  const busboy = new Busboy({
    headers: req.headers,
    limits: {
      fileSize: 2 * 1024 * 1024
    }
  })

  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    file.fileRead = []

    file.on('data', function(chunk) {
      file.fileRead.push(chunk)
    })

    file.on('limit', function() {
      logger.warn(`File upload too large`)
      res.writeHead(413, { 'Connection': 'close' });
      res.end()
      req.unpipe(req.busboy)
    })

    file.on('end', function() {
      let buffer = Buffer.concat(file.fileRead);

      if (!isValidImage(buffer) && !isJSON(buffer.toString())) {
        logger.warn(`Invalid upload attempted`)
        res.writeHead(415, { 'Connection': 'close' })
        res.end()
        req.unpipe(req.busboy)
      } else {
        const url = config.IPFS_API_URL + req.url + '?stream=false'
        request.post(url)
          .set(req.headers)
          .attach('file', buffer)
          .then((response) => {
            let responseData = response.text
            if (response.headers['content-encoding'] == 'gzip') {
              // Compress the response so the header is correct if necessary
              responseData = zlib.gzipSync(response.text)
            }
            res.writeHead(response.status, response.headers)
            res.end(responseData)
          }, (error) => {
            logger.error(`An error occurred proxying request to IPFS`)
            logger.error(error)
            res.writeHead(500, { 'Connection': 'close' })
            res.end()
          })
      }
    })
  })

  req.pipe(busboy)
}

function handleFileDownload(req, res) {
}

const server = http.createServer((req, res) => {
  if (req.url == '/api/v0/add') {
    handleFileUpload(req, res)
  } else {
    handleFileDownload(req, res)
  }
}).listen(config.IPFS_PROXY_PORT)

module.exports = server
