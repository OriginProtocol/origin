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
const populateIpfs = async () => {
  const ipfs = ipfsAPI('localhost', '5002', { protocol: 'http' })

  console.log('Populating IPFS...')

  // fs.readdirSync always returns results sorted on unix based platforms
  // so the IPFS hashes will always be the same
  const listingDirectories = fs.readdirSync(fixturesDir)

  for (const listingDirectoryName of listingDirectories) {
    // Iterate over each directory in the fixtures dir
    const listingDirectory = fixturesDir + '/' + listingDirectoryName
    const stat = fs.statSync(listingDirectory)

    // Only process directories in the fixtures directory
    if (stat.isDirectory()) {
      // Grab the schema filename
      const schemaFilename = fs.readdirSync(listingDirectory).find(file => {
        return file.endsWith('json')
      })
      if (!schemaFilename) {
        // No schema, don't proceed
        throw new Error(`Schema not found in ${listingDirectory}`)
      }

      // Get all the images from the listing directory
      const imagePaths = fs
        .readdirSync(listingDirectory)
        .filter(file => {
          return file.endsWith('jpg') || file.endsWith('png')
        })
        .map(imageFilename => {
          return listingDirectory + '/' + imageFilename
        })

      // Read the listing data
      const dataJson = fs.readFileSync(listingDirectory + '/' + schemaFilename)
      const data = JSON.parse(dataJson)
      // Preserve order of uploaded images to maintain IPFS hash
      // This is necessary because the hashes are hardcoded in contract migrations
      data.media = []
      for (const imagePath of imagePaths) {
        const imageUpload = await ipfs.util.addFromFs(imagePath)
        const contentType = imagePath.endsWith('jpg')
          ? 'image/jpeg'
          : 'image/png'
        const medium = {
          url: `ipfs://${imageUpload[0]['hash']}`,
          contentType: contentType
        }
        data.media.push(medium)
      }

      // Update listing data to IPFS
      const stream = new ReadableStream()
      stream.push(JSON.stringify(data))
      stream.push(null)
      const resp = await ipfs.add(stream)

      // Log some data.
      // TODO(franck): re-use ContractService.getBytes32FromIpfsHash
      const ipfsHash = resp[0].hash
      const bytes32 =
        '0x' +
        bs58
          .decode(ipfsHash)
          .slice(2)
          .toString('hex')
      console.log(`Uploaded fixture listing ${listingDirectoryName} to IPFS`)
      console.log(`  IPFS Hash=${ipfsHash}`)
      console.log(`  Bytes32  =${bytes32}`)
    }
  }
}

module.exports = startIpfs
