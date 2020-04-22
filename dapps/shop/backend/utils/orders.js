const Web3 = require('web3')
const { Order } = require('../models')
const config = require('../config')
const { ListingID } = require('../utils/id')

const { post, getBytes32FromIpfsHash } = require('../utils/_ipfs')
const abi = require('../utils/_abi')
const encConf = require('../utils/encryptedConfig')
const ZeroAddress = '0x0000000000000000000000000000000000000000'
const { WEB3_PK, PROVIDER } = require('../utils/const')

const web3 = new Web3(PROVIDER)
let walletAddress
if (WEB3_PK) {
  const account = web3.eth.accounts.wallet.add(WEB3_PK)
  walletAddress = account.address
  console.log(`using walletAddress ${walletAddress}`)
} else {
  console.log('No wallet key found.')
}

function findOrder(req, res, next) {
  const { orderId } = req.params
  Order.findOne({ where: { orderId, shopId: req.shop.id } }).then(order => {
    if (!order) {
      return res.status(404).send({ success: false })
    }
    req.order = order
    next()
  })
}

async function makeOffer({ shop, amount, encryptedData }) {
  const lid = ListingID.fromFQLID(shop.listingId)
  const dataURL = await encConf.get(shop.id, 'dataUrl')
  const siteConfig = await config.getSiteConfig(dataURL, shop.networkId)
  console.log({ dataURL, net: shop.networkId, siteConfig })
  const contractAddr = siteConfig.marketplaceContract

  if (!contractAddr) {
    throw new Error(
      'Contract missing address.  Will be unable to send transaction.'
    )
  }

  const offer = {
    schemaId: 'https://schema.originprotocol.com/offer_2.0.0.json',
    listingId: lid.toString(),
    listingType: 'unit',
    unitsPurchased: 1,
    totalPrice: {
      amount: amount || '0',
      currency: 'fiat-USD'
    },
    commission: { currency: 'OGN', amount: '0' },
    finalizes: 60 * 60 * 24 * 14, // 2 weeks after offer accepted
    encryptedData
  }

  let ires
  try {
    ires = await post(siteConfig.ipfsApi, offer, true)
  } catch (err) {
    throw new Error(`Error adding offer to ${siteConfig.ipfsApi}!`)
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
}

module.exports = {
  findOrder,
  makeOffer
}
