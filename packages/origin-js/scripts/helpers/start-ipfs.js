const bs58 = require('bs58')
const fs = require('fs')
const ipfsAPI = require('ipfs-api')
const HttpIPFS = require('ipfs/src/http')
const ReadableStream = require('stream').Readable

const fixturesDir = __dirname + '/../../test/fixtures'

const startIpfs = () =>
  new Promise((resolve, reject) => {
    const httpAPI = new HttpIPFS(undefined, {
      Addresses: {
        API: '/ip4/0.0.0.0/tcp/5002',
        Gateway: '/ip4/0.0.0.0/tcp/8080'
      }
    })
    console.log('Start IPFS')
    httpAPI.start(true, async err => {
      if (err) {
        return reject(err)
      }
      console.log('Started IPFS')
      await populateIpfs()

      resolve()
    })
  })

/**
 * Populate IPFS with sample listings from the fixtures directory.
 */
const populateIpfs = async () =>
  new Promise((resolve, reject) => {
    const ipfs = ipfsAPI('localhost', '5002', { protocol: 'http' })
    console.log('Populate IPFS:')
    ipfs.util.addFromFs(
      fixturesDir,
      { recursive: true },
      (err, result) => {
        if (err) {
          return reject(err)
        }
        result.forEach(r => console.log(`  ${r.hash} ${r.path}`))
        resolve(result)
      }
    )
  })

module.exports = startIpfs
