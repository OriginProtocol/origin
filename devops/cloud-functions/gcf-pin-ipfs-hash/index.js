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
  if (!['ListingCreated', 'ListingUpdated'].includes(eventName)) {
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
  const eventName = data.log.eventName

  if (eventName === 'ListingCreated' || eventName === 'ListingUpdated') {
    console.log(`Processing event ${eventName}`)
    const ipfsData = data.related.listing.ipfs
    hashesToPin.push(ipfsData.hash)
    if ('media' in ipfsData.data && ipfsData.data.media.length > 0) {
      const mediaData = ipfsData.data.media
      mediaData.forEach(media => {
        hashesToPin.push(extractIpfsHashFromUrl(media.url))
      })
    } else {
      console.log('No IPFS media hashes found in listing data')
    }
  } else if (eventName === 'IdentityUpdated') {
    console.log(`Processing event ${eventName}`)
    const ipfsData = data.related.user.ipfs
    hashesToPin.push(ipfsData.hash)
  }

  return hashesToPin
}

const extractIpfsHashFromUrl = url => {
  const pattern = /(?:\:\/\/(?:.*)\/ipfs\/|ipfs:\/\/)(.*)/
  return url.match(pattern)[1]
}

module.exports = { extractIpfsHashFromUrl, parseIncomingData, pinService }
