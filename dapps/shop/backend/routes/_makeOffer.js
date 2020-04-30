const Web3 = require('web3')

const { ListingID } = require('../utils/id')
const { Network } = require('../models')
const { post, getBytes32FromIpfsHash } = require('../utils/_ipfs')
const encConf = require('../utils/encryptedConfig')
const abi = require('../utils/_abi')

const ZeroAddress = '0x0000000000000000000000000000000000000000'

/**
 * req.shop
 * req.amount amount in cents
 * req.body.data encrypted IPFS data hash
 */
async function makeOffer(req, res) {
  const network = await Network.findOne({
    where: { networkId: req.shop.networkId, active: true }
  })
  if (!network) {
    return res.json({ error: `Could not find network ${req.shop.networkId}` })
  }

  const shopConfig = encConf.getConfig(req.shop.config)
  if (!shopConfig.web3Pk) {
    return res.json({ error: 'No PK configured' })
  }

  const web3 = new Web3(network.provider)
  const account = web3.eth.accounts.wallet.add(shopConfig.web3Pk)
  const walletAddress = account.address
  console.log(`using walletAddress ${walletAddress}`)

  const lid = ListingID.fromFQLID(req.shop.listingId)

  if (!network.marketplaceContract) {
    console.error('Contract missing address. Unable to send transaction.')
    return res.status(500)
  }

  const offer = {
    schemaId: 'https://schema.originprotocol.com/offer_2.0.0.json',
    listingId: lid.toString(),
    listingType: 'unit',
    unitsPurchased: 1,
    totalPrice: {
      amount: req.amount / 100,
      currency: 'fiat-USD'
    },
    commission: { currency: 'OGN', amount: '0' },
    finalizes: 60 * 60 * 24 * 14, // 2 weeks after offer accepted
    encryptedData: req.body.data
  }

  let ires
  try {
    ires = await post(network.ipfsApi, offer, true)
  } catch (err) {
    console.error(`Error adding offer to ${network.ipfsApi}!`)
    console.error(err)
    return res.status(500)
  }
  const Marketplace = new web3.eth.Contract(abi, network.marketplaceContract)

  Marketplace.methods
    .makeOffer(
      lid.listingId,
      getBytes32FromIpfsHash(ires),
      offer.finalizes,
      ZeroAddress, // Affiliate
      '0',
      '0',
      ZeroAddress,
      walletAddress // Arbitrator
    )
    .send({ from: walletAddress, gas: 350000 })
    .then(tx => {
      console.log('Make offer:')
      console.log(tx)
    })
    .catch(err => {
      console.log(err)
    })

  res.sendStatus(200)
}

module.exports = makeOffer
