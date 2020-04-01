const Web3 = require('web3')
const abi = require('./_abi')
const { post, getBytes32FromIpfsHash } = require('./_ipfs')

const baseListing = {
  __typename: 'UnitListing',
  schemaId: 'https://schema.originprotocol.com/listing_3.0.0.json',
  listingType: 'unit',
  category: 'schema.forSale',
  subCategory: 'schema.clothingAccessories',
  language: 'en-US',
  description: 'Origin DShop Store',
  media: [],
  price: {
    amount: '0',
    currency: 'fiat-USD'
  },
  amount: '0',
  currency: 'fiat-USD',
  acceptedTokens: ['token-ETH'],
  commission: {
    currency: 'OGN',
    amount: '0'
  },
  commissionPerUnit: {
    currency: 'OGN',
    amount: '0'
  },
  requiresShipping: false,
  unitsTotal: 1000
}

async function createListing({ network, pk, title }) {
  if (!network) {
    throw new Error('No network specified')
  }
  if (!pk) {
    throw new Error('No private key specified')
  }
  if (!title) {
    throw new Error('No title specified')
  }
  if (!network.ipfsApi) {
    throw new Error('Network has no ipfsApi specified')
  }
  if (!network.marketplaceContract) {
    throw new Error('Network has no marketplaceContract specified')
  }

  const web3 = new Web3(network.providerWs)
  const Marketplace = new web3.eth.Contract(abi, network.marketplaceContract)
  const account = web3.eth.accounts.wallet.add(pk)
  if (!account.address) {
    throw new Error('Error adding wallet')
  }
  console.log(`Using wallet ${account.address}`)

  const balance = await web3.eth.getBalance(account.address)
  if (balance === '0') {
    throw new Error('Not enough balance')
  }

  const listing = { ...baseListing, title }

  let ipfsBytes
  try {
    const ipfsHash = await post(network.ipfsApi, listing, true)
    ipfsBytes = getBytes32FromIpfsHash(ipfsHash)
  } catch (err) {
    throw new Error(`Error adding listing to ${network.ipfsApi}`)
  }

  let tx
  try {
    tx = await Marketplace.methods
      .createListing(ipfsBytes, 0, account.address)
      .send({ from: account.address, gas: 350000 })
  } catch (e) {
    console.log(e)
  }

  web3.currentProvider.connection.close()

  const listingId = tx.events.ListingCreated.returnValues.listingID

  return `${network.networkId}-${network.marketplaceVersion}-${listingId}`
}

module.exports = createListing
