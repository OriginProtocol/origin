// Misc utilities related to handling marketplace listings.

import ethers from 'ethers'

import { get, getIpfsHashFromBytes32, post } from '@origin/ipfs'

// Marketplace contract ABI.
const abi = [
  'function createListing(bytes32, uint256, address)',
  'function updateListing(uint256, bytes32, uint256)',
  'event ListingCreated (address indexed party, uint indexed listingID, bytes32 ipfsHash)',
  'event ListingUpdated (address indexed party, uint indexed listingID, bytes32 ipfsHash)'
]

// Base template for marketplace listing data.
const baseListing = {
  __typename: 'UnitListing',
  schemaId: 'https://schema.originprotocol.com/listing_3.0.0.json',
  listingType: 'unit',
  category: 'schema.forSale',
  subCategory: 'schema.clothingAccessories',
  language: 'en-US',
  description: 'Origin DShop Store',
  media: [],
  price: { amount: '0', currency: 'fiat-USD' },
  amount: '0',
  currency: 'fiat-USD',
  acceptedTokens: ['token-ETH'],
  commission: { currency: 'OGN', amount: '0' },
  commissionPerUnit: { currency: 'OGN', amount: '0' },
  requiresShipping: false,
  unitsTotal: 1000
}

/**
 * Utility method. Gets a marketplace listing's most recent IPFS hash
 * by querying the ethereum network for relevant logs.
 *
 * Note: In the future we may want to consider storing the listing's most recent
 * hash in the shop back-end DB.
 *
 * @param {Object} provider: ether.js provider.
 * @param {Object} contract: ether.js contract object for the marketplace.
 * @param {Integer} contractEpoch: block number at which contract was created.
 * @param {string} seller: ethereum address of the seller
 * @param {Integer} listingId: id of the listing in the marketplace contract.
 * @returns {Promise<string>} IPFS hash
 * @private
 */
async function _getListingLatestIpfsHash(
  provider,
  contract,
  contractEpoch,
  seller,
  listingId
) {
  // Create a filter to get the ListingCreated events for the listing.
  const listingCreatedFilter = contract.filters.ListingCreated(
    seller,
    listingId,
    null
  )
  listingCreatedFilter.fromBlock = contractEpoch || 0

  // Create a filter to get the ListingUpdated events for the listing.
  const listingUpdatedFilter = contract.filters.ListingCreated(
    seller,
    listingId,
    null
  )
  listingUpdatedFilter.fromBlock = contractEpoch || 0

  // Get all the ListingCreated|Updated events and keep only the most recent.
  const listingCreatedEvents = await provider.getLogs(listingCreatedFilter)
  const listingUpdatedEvents = await provider.getLogs(listingUpdatedFilter)
  let latestEvent
  if (listingUpdatedEvents && listingUpdatedEvents.length > 0) {
    latestEvent = listingUpdatedEvents[listingUpdatedEvents.length - 1]
  } else if (listingCreatedEvents && listingCreatedEvents.length === 1) {
    latestEvent = listingCreatedEvents[0]
  } else {
    throw new Error(
      `Failed getting the listing's latest IPFS hash from contract's events`
    )
  }

  // The IPFS hash for the listing is encoded as bytes32 in the logs data field.
  const bytes32Hash = latestEvent.data
  return getIpfsHashFromBytes32(bytes32Hash)
}

/**
 * Create a new listing on the marketplace contract.
 *
 * @param {string} title: listing title
 * @param {Object} network: network configuration
 * @returns {Promise<string>} Newly created listing id.
 *   Format is <network id>-<contract version>-<listing id>
 *   For example: 1-001-123
 */
export async function createListing({ title, network }) {
  const enabled = await window.ethereum.enable()
  if (!enabled) {
    throw new Error(`Browser is not web3 enabled.`)
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const providerNetwork = await provider.getNetwork()
  if (providerNetwork.chainId !== network.networkId) {
    throw new Error(`Network should be ${network.networkId}`)
  }

  const signer = provider.getSigner()
  const address = await signer.getAddress()

  const bytes32Hash = await post(network.ipfsApi, { ...baseListing, title })
  const contract = new ethers.Contract(network.marketplaceContract, abi, signer)

  const tx = await contract.createListing(bytes32Hash, 0, address)
  await tx.wait()

  // Listen for the ListingCreated event emitted as part of the listing creation.
  // The event includes the listing Id.
  const listingId = await new Promise(resolve => {
    const eventFilter = contract.filters.ListingCreated(address, null, null)
    contract.on(eventFilter, (party, listingId) => {
      const { networkId, marketplaceVersion } = network
      resolve(`${networkId}-${marketplaceVersion}-${Number(listingId)}`)
    })
  })

  return listingId
}

/**
 * Update a marketplace listing's IPFS data by adding a field "shopIpfsHash" that points to
 * the IPFS hash of the DShop associated with the listing.
 *
 * @param {Object} config: shop config
 * @param {string} shopIpfsHash: IPFS hash for the DShop associated with the listing.
 * @returns {Promise<void>}
 */
export async function updateListing({ config, shopIpfsHash }) {
  console.log('updateListing CONFIG=', config)
  if (!shopIpfsHash) {
    console.error('shop IPFS hash not provided')
    return
  }
  if (shopIpfsHash.length !== 46) {
    console.error('Invalid IPFS hash')
    return
  }

  const enabled = await window.ethereum.enable()
  if (!enabled) {
    console.error('No web3 provider detected in the browser')
    return
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const providerNetwork = await provider.getNetwork()
  if (providerNetwork.chainId !== parseInt(config.netId)) {
    console.error(
      `Provider network should be ${config.netId} vs ${providerNetwork.chainId}`
    )
    return
  }

  const signer = provider.getSigner()
  const address = await signer.getAddress()

  // The index of the listing on the markerplace contract is the 3rd element in the listingId.
  const parts = config.listingId.split('-')
  const marketplaceListingId = parseInt(parts[2])
  console.log(
    'Id of the listing on the marketplace contract=',
    marketplaceListingId
  )

  const contract = new ethers.Contract(config.marketplaceContract, abi, signer)

  /*
   Note(Franck): For now we just overwrite the listing data.
   In the future we could load the previous data and only update the fields
   we need to. This would look like this:

    const ipfsHash = await _getListingLatestIpfsHash(
      provider,
      contract,
      config.marketplaceEpoch,
      address,
      marketplaceListingId
    )
    const listingData = await get(config.ipfsApi, ipfsHash)
  */

  // Create listing data using the base listing template.
  // Include a custom title and shopIpfsHash.
  const updatedListingData = {
    ...baseListing,
    title: config.title,
    shopIpfsHash
  }

  // Upload the listing's JSON data to IPFS.
  const bytes32Hash = await post(config.ipfsApi, updatedListingData)
  console.log(
    'Uploaded updated listing data. IPFS hash=',
    getIpfsHashFromBytes32(bytes32Hash)
  )

  // Call the marketplace contract to record the change in data.
  console.log(
    'Calling marketplace updateListing method and waiting for tx to get mined...)'
  )
  const tx = await contract.updateListing(marketplaceListingId, bytes32Hash, 0)
  const receipt = await tx.wait()
  if (receipt.status === 1) {
    console.log('Success. Receipt=', receipt)
  } else {
    console.err('Failure. Receipt=', receipt)
  }
}
