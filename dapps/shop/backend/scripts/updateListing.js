// A script that updates a shop's marketplace listing data.

const fetch = require('node-fetch')
const lget = require('lodash/get')
const Web3 = require('web3')

const marketplaceAbi = require('../utils/_abi')
const proxyAbi = require('../utils/_abi_proxy')
const {
  post,
  get,
  getIpfsHashFromBytes32,
  getBytes32FromIpfsHash
} = require('../utils/_ipfs')

const networkConfig = {
  1: {
    marketplaceContractAddress: '0x698ff47b84837d3971118a369c570172ee7e54c2',
    graphqlUrl: 'https://graphql.originprotocol.com/graphql',
    ipfsGatewayUrl: 'https://ipfs.originprotocol.com'
  },
  4: {
    marketplaceContractAddress: '0x3d608cce08819351ada81fc1550841ebc10686fd',
    graphqlUrl: 'https://graphql.staging.originprotocol.com/graphql',
    ipfsGatewayUrl: 'https://ipfs.staging.originprotocol.com'
  }
}

/**
 * Helper function to query graphql to get data about a listing.
 */
async function _fetchListingInfo(graphqlUrl, ipfsGatewayUrl, listingId) {
  const query = `
    {
      marketplace {
        listing(id: "${listingId}") {
          ... on Listing {
            seller {
              checksumAddress
              proxy {
                checksumAddress
                owner {
                  checksumAddress
                }
              }
            }
            events {
              id
              event
              timestamp
              returnValues {
                ipfsHash
                party
              }
            }
          }
        }
      }
    }
  `

  const res = await fetch(graphqlUrl, {
    headers: { 'content-type': 'application/json' },
    method: 'POST',
    body: JSON.stringify({ query })
  })
  if (res.status !== 200) {
    throw new Error(`Graphql server returned status ${res.status}`)
  }
  const response = await res.json()

  // Extract the seller. It is either the account or the proxy.
  const seller = lget(
    response,
    'data.marketplace.listing.seller.checksumAddress'
  )
  if (!seller) {
    throw new Error('Graphql did not return a seller for the listing')
  }
  const proxy = lget(
    response,
    'data.marketplace.listing.seller.proxy.checksumAddress'
  )
  const owner = lget(
    response,
    'data.marketplace.listing.seller.proxy.owner.checksumAddress'
  )
  console.log('seller=', seller)
  console.log('proxy=', proxy)
  console.log('owner=', owner)

  // Find the most recent ListingCreated or ListingUpdated event.
  const events = lget(response, 'data.marketplace.listing.events', [])
  if (!events) {
    throw new Error('Graphql did not return any event for the listing')
  }
  const filteredEvents = events.filter(e =>
    ['ListingCreated', 'ListingUpdated'].includes(e.event)
  )
  if (!filteredEvents.length) {
    throw new Error(
      'Graphql did not return any ListingCreated or ListingUpdated event'
    )
  }
  const mostRecentEvent = filteredEvents[filteredEvents.length - 1]
  const ipfsHash = getIpfsHashFromBytes32(mostRecentEvent.returnValues.ipfsHash)
  const createdAt = new Date(mostRecentEvent.timestamp * 1000)
  console.log(
    `Most recent listing hash is ${ipfsHash}, created at ${createdAt}`
  )

  // Load the listing data from ipfs.
  const listing = await get(ipfsGatewayUrl, ipfsHash)
  console.log('Loaded listing data from IPFS')
  console.log('  Listing title:', listing.title)
  console.log('  Listing description:', listing.description)

  // TODO: add a check to verify it is a DShop listing.
  // perhaps based on a cutoff timestamp we can verify it has an shopIpfsHash field?

  return {
    seller,
    proxy,
    owner,
    listing
  }
}

/**
 * Calls the marketplace contract updateListing method, either directly or via the account's proxy.
 */
async function _sendTx({
  web3,
  marketplaceListingId,
  ipfsHashBytes,
  fromAddress,
  proxyAddress,
  marketplaceContractAddress
}) {
  let tx
  const marketplaceContract = new web3.eth.Contract(
    marketplaceAbi,
    marketplaceContractAddress
  )
  const txToSend = marketplaceContract.methods.updateListing(
    marketplaceListingId,
    ipfsHashBytes,
    0
  )

  if (proxyAddress) {
    console.log(`Updating listing via proxy at address ${proxyAddress}.`)
    const proxyContract = new web3.eth.Contract(proxyAbi, proxyAddress)

    // Wrap the tx so that we can send it via the proxy contract.
    const txData = await txToSend.encodeABI()
    const wrapTxToSend = proxyContract.methods.execute(
      0,
      marketplaceContractAddress,
      '0',
      txData
    )

    try {
      tx = await wrapTxToSend.send({ from: fromAddress, gas: 500000 })
    } catch (e) {
      console.log('Send tx via proxy error:', e)
      throw new Error('Failed updating the listing on the marketplace')
    }
  } else {
    console.log(`Updating listing directly from address ${fromAddress}`)
    try {
      tx = await txToSend.send({ from: fromAddress, gas: 350000 })
    } catch (e) {
      console.log('Send tx error:', e)
      throw new Error('Failed updating the listing on the marketplace')
    }
  }
  console.log('Sent tx to update the listing:', tx)
  return tx
}

async function updateListing({
  listingId,
  shopIpfsHash,
  providerUrl,
  pk,
  networkId,
  doIt
}) {
  const {
    marketplaceContractAddress,
    ipfsGatewayUrl,
    graphqlUrl
  } = networkConfig[networkId]

  const web3 = new Web3(providerUrl)
  const account = web3.eth.accounts.wallet.add(pk)
  if (!account.address) {
    throw new Error('Error adding wallet')
  }
  console.log('Using account', account.address)

  // Check the format of the listingId
  // We expect <network>-<version>-<id>
  const parts = listingId.split('-')
  if (parts.length !== 3) {
    throw new Error('Invalid listing id format')
  }
  const marketplaceListingId = parseInt(parts[2])

  // Check the wallet has enough balance to pay for gas fees.
  const balance = await web3.eth.getBalance(account.address)
  if (balance === '0') {
    throw new Error('Not enough balance')
  }

  const { seller, proxy, listing } = await _fetchListingInfo(
    graphqlUrl,
    ipfsGatewayUrl,
    listingId
  )
  const useProxy = Boolean(seller === proxy)
  console.log('Using proxy to call the contract.')

  // Add or update the shopIpfsHash field in the listing's data.
  // It stores an IPFS hash that points to the shop's IPFS root hash.
  listing['shopIpfsHash'] = shopIpfsHash

  // Upload the updated listing data to IPFS and get the hash back.
  let ipfsHash, ipfsHashBytes
  if (doIt) {
    ipfsHash = await post(ipfsGatewayUrl, listing, true)
    ipfsHashBytes = getBytes32FromIpfsHash(ipfsHash)
    console.log('Uploaded new listing data to IPFS. Hash=', ipfsHash)
  } else {
    console.log('Would upload new listing data to IPFS')
  }

  // Update the listing on the marketplace contract.
  if (doIt) {
    await _sendTx({
      web3,
      marketplaceListingId,
      ipfsHashBytes,
      fromAddress: account.address,
      proxyAddress: useProxy ? proxy : null,
      marketplaceContractAddress
    })
  } else {
    console.log('Would call the contract to update the listing.')
  }
}

//
// MAIN
//
const args = {}
process.argv.forEach(arg => {
  const t = arg.split('=')
  const argVal = t.length > 1 ? t[1] : true
  args[t[0]] = argVal
})

const config = {
  networkId: args['--networkId'] || '4',
  listingId: args['--listingId'],
  shopIpfsHash: args['--shopIpfsHash'],
  providerUrl: args['--providerUrl'],
  pk: args['--pk'],
  doIt: args['--doIt'] === 'true' || false
}
console.log('Config:', config)

const networkId = parseInt(config.networkId)

const listingId = config.listingId
if (!listingId) {
  throw new Error('Missing listingId arg')
}

const shopIpfsHash = config.shopIpfsHash
if (!shopIpfsHash) {
  throw new Error('Missing shopIpfsHash arg')
}

const providerUrl = config.providerUrl
if (!providerUrl) {
  throw new Error('Missing providerUrl arg')
}

const pk = config.pk
if (!pk) {
  throw new Error('Missing pk arg')
}

updateListing({
  listingId,
  shopIpfsHash,
  providerUrl,
  pk,
  networkId,
  doIt: config.doIt
})
  .then(() => {
    console.log('Finished')
    process.exit()
  })
  .catch(err => {
    console.log('Failure: ', err)
    console.log('Exiting')
    process.exit(-1)
  })
