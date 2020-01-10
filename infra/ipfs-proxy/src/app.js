const Busboy = require('busboy')
const fileType = require('file-type')
const isJSON = require('is-json')
const http = require('http')
const httpProxy = require('http-proxy')
const request = require('superagent')
const zlib = require('zlib')
const Unixfs = require('ipfs-unixfs')
const dagPB = require('ipld-dag-pb')
const fs = require('fs')

const config = require('./config')
const logger = require('./logger')

const validImageTypes = [
  'image/jpeg',
  'image/pjpeg',
  'image/gif',
  'image/png',
  'image/vnd.microsoft.icon',
  'image/x-icon',
  // Not valid but sometimes used for icons
  'image/ico',
  'image/icon'
]

const validVideoTypes = ['video/mp4']

function isValidFile(buffer) {
  return (
    isValidImage(buffer) || isValidVideo(buffer) || isJSON(buffer.toString())
  )
}

function isValidImage(buffer) {
  const file = fileType(buffer)
  return file && validImageTypes.includes(file.mime)
}

function isValidVideo(buffer) {
  const file = fileType(buffer)
  return file && validVideoTypes.includes(file.mime)
}

function getMultiHash(buffer) {
  const unixFs = new Unixfs("file", buffer)
  return new Promise((resolve, reject) => {
    dagPB.DAGNode.create(unixFs.marshal(), 
      (err, dagNode) => {
        if(err) reject(err)
        else {
          const node = dagNode.toJSON()
          node.unixfs = unixFs
          resolve(node)
        }
      })
  })
}

const maxChunkSize = 262144

function chunk(buffer, size) {
  const chunks = []
  let start = 0
  const bufferLength = buffer.length
  while (bufferLength - start >= size) {
    const next = Math.min(bufferLength, start + size)
    const slicedBuffer = buffer.slice(start, next)
    chunks.push(slicedBuffer)
    start = next
  }

  if (bufferLength > start) {
    chunks.push(buffer.slice(start, bufferLength))
  }
  return chunks
}


const maxChildren = 174

async function reduceToParents (source, reduce, numChildren) {
  const roots = []

 for (const chunked of chunk(source, numChildren)) {
    roots.push(await reduce(chunked))
  }

  if (roots.length > 1) {
    return reduceToParents(roots, reduce, numChildren)
  }

  return roots[0]
}

async function buildHash(buffer) {
  const buffers = chunk(buffer, maxChunkSize)

  const chunks = await Promise.all(buffers.map(getMultiHash))

  const root = await reduceToParents(chunks, async (leaves) => {
    if (leaves.length == 1) {
      return leaves[0]
    } else {
      const f = new Unixfs('file')
      leaves.map( leaf => {
        if (!leaf.unixfs.data) {
          // node is an intermediate node
          f.addBlockSize(leaf.unixfs.fileSize())
        } else {
          // node is a unixfs 'file' leaf node
          f.addBlockSize(leaf.unixfs.data.length)
        }
      })
      return await new Promise((resolve, reject) => {
        dagPB.DAGNode.create(f.marshal(),
          leaves,
          (err, dagNode) => {
            if(err) reject(err)
            else {
              const node = dagNode.toJSON()
              node.unixfs = f
              resolve(node)
            }
          })
      })
    }
  }, maxChildren)

  return root
}

function handleFileUpload(req, res) {
  let busboy

  try {
    busboy = new Busboy({
      headers: req.headers,
      limits: {
        fileSize: 2 * 1024 * 1024
      }
    })
  } catch (error) {
    // Busboy failed to parse request, missing headers?
    logger.error(`Malformed request: ${error}`)
    res.writeHead(400, { Connection: 'close' })
    res.end()
    return
  }

  busboy.on('file', function(fieldname, file) {
    file.fileRead = []

    file.on('data', function(chunk) {
      file.fileRead.push(chunk)
    })

    file.on('limit', function() {
      logger.warn(`File upload too large`)
      res.writeHead(413, { Connection: 'close' })
      res.end()
      req.unpipe(req.busboy)
    })

    file.on('end', function() {
      const buffer = Buffer.concat(file.fileRead)

      if (!isValidFile(buffer)) {
        logger.warn(`Upload of invalid file type attempted`)
        res.writeHead(415, { Connection: 'close' })
        res.end()
        req.unpipe(req.busboy)
      } else {
        if (config.IPFS_SHORT_CIRCUIT) {
          buildHash(buffer).then( node => {
            const Hash = node.multihash
            const Size = node.size
            fs.writeFile(config.IPFS_SHORT_CIRCUIT_DIR + '/' + Hash, buffer, err => {
              if(err){
                logger.error("Cannot write to", config.IPFS_SHORT_CIRCUIT_DIR + '/' + Hash)
                logger.error(err)
              }
            })
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify({Hash, Name:Hash, Size}))
          })
          return
        }
        const url = config.IPFS_API_URL + req.url
        request
          .post(url)
          .set(req.headers)
          .attach('file', buffer)
          .then(
            response => {
              let responseData = response.text
              if (response.headers['content-encoding'] === 'gzip') {
                // Compress the response so the header is correct if necessary
                responseData = zlib.gzipSync(response.text)
              } else if (response.headers['content-encoding'] === 'deflate') {
                responseData = zlib.deflateSync(response.text)
              }
              res.writeHead(response.status, response.headers)
              res.end(responseData)
            },
            error => {
              logger.error(`An error occurred proxying request to IPFS`)
              logger.error(error)
              res.writeHead(500, { Connection: 'close' })
              res.end()
            }
          )
      }
    })
  })

  req.pipe(busboy)
}

function handleFileDownload(req, res) {
  if (config.IPFS_SHORT_CIRCUIT) {
    const fpath = config.IPFS_SHORT_CIRCUIT_DIR + '/' + req.url.slice(6)
    if (fs.existsSync(fpath))
    {
      const stat = fs.statSync(fpath)
      const buffer = fs.readFileSync(fpath)
      const file = fileType(buffer)
      res.writeHead(200, {
        'Content-Type': file? file.mime: 'application/json',
        'Content-Length': stat.size
      })
      res.end(buffer)
      return
    }
  }
  // Proxy download requests to gateway
  proxy.web(req, res, {
    target: config.IPFS_GATEWAY_URL,
    selfHandleResponse: true
  })
}

const proxy = httpProxy.createProxyServer({})

// Validate downloads. It is necessary to inspect the file type for downloads
// because it is possible to add IPFS content to a peer and request it using an
// Origin IPFS server which would cause it to be available.
proxy.on('proxyRes', (proxyResponse, req, res) => {
  let buffer = []

  proxyResponse.on('data', data => {
    buffer.push(data)
  })

  proxyResponse.on('end', () => {
    buffer = Buffer.concat(buffer)

    if (isValidFile(buffer)) {
      res.writeHead(proxyResponse.statusCode, proxyResponse.headers)
      res.end(buffer)
    } else {
      res.writeHead(415, { Connection: 'close' })
      res.end()
    }
  })
})

proxy.on('error', err => {
  logger.error(err)
})

const server = http
  .createServer((req, res) => {
    logger.info(req.url)
    if (req.url.startsWith('/api/v0/add')) {
      handleFileUpload(req, res)
    } else if (req.url.startsWith('/ipfs')) {
      handleFileDownload(req, res)
    } else {
      res.writeHead(404, { Connection: 'close' })
      res.end()
    }
  })
  .listen(config.IPFS_PROXY_PORT, config.IPFS_PROXY_ADDRESS)

logger.debug(`Listening on ${config.IPFS_PROXY_PORT}`)
logger.debug(`Proxying to IPFS gateway ${config.IPFS_GATEWAY_URL}`)
logger.debug(`Proxying to IPFS API ${config.IPFS_API_URL}`)

process.on('SIGINT', function() {
  logger.debug('\nGracefully shutting down from SIGINT (Ctrl+C)')
  server.close(() => {
    process.exit()
  })
})

module.exports = server
