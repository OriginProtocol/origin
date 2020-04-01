const config = require('../config')
// const get = require('lodash/get')

const Web3 = require('web3')

const { ListingID } = require('../utils/id')
const { Network } = require('../models')
const { post, getBytes32FromIpfsHash } = require('../utils/_ipfs')
const { WEB3_PK, PROVIDER } = require('../utils/const')
const encConf = require('../utils/encryptedConfig')
const abi = require('../utils/_abi')

const ZeroAddress = '0x0000000000000000000000000000000000000000'

// TODO: This needs to be cleaner, all of this conf does
const web3 = new Web3(PROVIDER)
let walletAddress
if (WEB3_PK) {
  const account = web3.eth.accounts.wallet.add(WEB3_PK)
  walletAddress = account.address
  console.log(`using walletAddress ${walletAddress}`)
} else {
  console.log('No wallet key found.')
}

/**
 * req.shop
 * req.body.amount amount in cents
 * req.body.data encrypted IPFS data hash
 */
async function makeOffer(req, res) {
  if (!WEB3_PK) {
    return res.sendStatus(400)
  }

  const network = await Network.findOne({
    where: { networkId: req.shop.networkId }
  })
  if (!network) {
    return res.json({ error: 'Could not find network' })
  }

  const dataURL = await encConf.get(req.shop.id, 'dataUrl')
  const siteConfig = await config.getSiteConfig(dataURL, req.shop.networkId)
  const lid = ListingID.fromFQLID(req.shop.listingId)

  const contractAddr = network.marketplaceContract

  if (!contractAddr) {
    console.error(
      'Contract missing address.  Will be unable to send transaction.'
    )
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
    ires = await post(siteConfig.ipfsApi, offer, true)
  } catch (err) {
    console.error(`Error adding offer to ${siteConfig.ipfsApi}!`)
    console.error(err)
    return res.status(500)
  }
  const Marketplace = new web3.eth.Contract(abi, contractAddr)

  Marketplace.methods
    .makeOffer(
      lid.listingId,
      getBytes32FromIpfsHash(ires),
      offer.finalizes,
      siteConfig.affiliate || ZeroAddress,
      '0',
      '0',
      ZeroAddress,
      siteConfig.arbitrator || walletAddress
    )
    .send({
      from: walletAddress,
      gas: 350000
    })
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
