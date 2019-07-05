const base58 = require('./util_base58')
const IpfsClusterAPI = require('./ipfs-cluster-api-service.js')
const ipfsClusterApiService = new IpfsClusterAPI(
  process.env.IPFS_CLUSTER_URL,
  process.env.IPFS_CLUSTER_USERNAME,
  process.env.IPFS_CLUSTER_PASSWORD
)

const pinService = async event => {
  const pubsubMessage = event.data
  const data = pubsubMessage
    ? JSON.parse(Buffer.from(pubsubMessage, 'base64').toString())
    : null

  const eventName = data.log.eventName
  if (
    !['ListingCreated', 'ListingUpdated', 'IdentityUpdated'].includes(eventName)
  ) {
    // Not an event we are interested in pinning anything for
    return
  }

  let pinnedHashes = []
  let unPinnedHashes = []

  if (!Object.is(data, null)) {
    const hashesToPin = parseIncomingData(data)
    for (let i = 0; i < hashesToPin.length; i++) {
      hashToPin = hashesToPin[i]

      pinned = await ipfsClusterApiService.pin(hashToPin)

      if (pinned) {
        pinnedHashes.push(hashToPin)
      } else {
        // Retry pinning 5 times with 500ms as initial interval and double the
        // interval every try. Set fields accordingly.
        let numberOfRetries = 4
        let initialRetryInterval = 500
        let retryIntervalGrowthRate = 2
        let retryPinned = await promiseSetTimeout(
          hashToPin,
          initialRetryInterval
        )
        while (!retryPinned && numberOfRetries > 0) {
          console.log('Retrying Pinning:\n')
          console.log('Retry Interval : ' + initialRetryInterval + 'ms \n')
          console.log('Number of Retry : ' + (5 - numberOfRetries) + '\n')
          numberOfRetries--
          initialRetryInterval *= retryIntervalGrowthRate
          retryPinned = await promiseSetTimeout(hashToPin, initialRetryInterval)
        }
        retryPinned
          ? pinnedHashes.push(hashToPin)
          : unPinnedHashes.push(hashToPin)
      }
    }
  } else {
    console.log('Error retrieving listing data')
  }
  console.log('Pinned following hashes: ', pinnedHashes.join(', '), '\n')
  console.log(
    'Could not pin following hashes: ',
    unPinnedHashes.join(', '),
    '\n'
  )
}

const promiseSetTimeout = async (hashToPin, interval) => {
  return new Promise(resolve => {
    setTimeout(async () => {
      const retryPinned = await ipfsClusterApiService.pin(hashToPin)
      resolve(retryPinned)
    }, interval)
  })
}

const parseIncomingData = data => {
  let hashesToPin = []
  const eventName = data.event.event
  if (eventName === 'ListingCreated' || eventName === 'ListingUpdated') {
    console.log(`Processing event ${eventName}`)
    hashesToPin.push(getIpfsHashFromBytes32(data.event.returnValues.ipfsHash))
    const listing = data.related.listing
    if ('media' in listing && listing.media.length > 0) {
      const mediaData = listing.media
      mediaData.forEach(media => {
        hashesToPin.push(extractIpfsHashFromUrl(media.url))
      })
    } else {
      console.log('No IPFS media hashes found in listing data')
    }
  } else if (eventName === 'IdentityUpdated') {
    console.log(`Processing event ${eventName}`)
    hashesToPin.push(getIpfsHashFromBytes32(data.event.returnValues.ipfsHash))
    const identity = data.related.identity
    if (identity.avatarUrl) {
      hashesToPin.push(extractIpfsHashFromUrl(identity.avatarUrl))
    }
  }

  return hashesToPin
}

const extractIpfsHashFromUrl = url => {
  const pattern = /(?:\:\/\/(?:.*)\/ipfs\/|ipfs:\/\/)(.*)/
  return url.match(pattern)[1]
}

function getIpfsHashFromBytes32(bytes32Hex) {
  // Add our default ipfs values for first 2 bytes:
  // function:0x12=sha2, size:0x20=256 bits
  // and cut off leading "0x"
  const hashHex = '1220' + bytes32Hex.slice(2)
  const hashBytes = Buffer.from(hashHex, 'hex')
  const hashStr = base58.encode(hashBytes)
  return hashStr
}

module.exports = { extractIpfsHashFromUrl, parseIncomingData, pinService }
