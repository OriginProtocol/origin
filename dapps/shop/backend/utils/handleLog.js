require('dotenv').config()

const Web3 = require('web3')
const openpgp = require('openpgp')

const { getText, getIPFSGateway } = require('./_ipfs')
const abi = require('./_abi')
const sendMail = require('./emailer')
const { upsertEvent, getEventObj } = require('./events')
const encConf = require('./encryptedConfig')
const { Transaction, Order, Shop } = require('../models')

const web3 = new Web3()
const Marketplace = new web3.eth.Contract(abi)
const MarketplaceABI = Marketplace._jsonInterface

function handleError(event, error) {
  console.log(error)
}

const handleLog = async ({
  networkId,
  contractVersion,
  data,
  topics,
  transactionHash,
  blockNumber
}) => {
  const eventAbi = MarketplaceABI.find(i => i.signature === topics[0])
  if (!eventAbi) {
    console.log('Unknown event')
    return
  }

  console.log('fetch existing...', transactionHash)
  const existingTx = await Transaction.findOne({ where: { transactionHash } })
  if (existingTx) {
    console.log('Already handled tx')
    return
  } else {
    Transaction.create({
      networkId,
      transactionHash,
      blockNumber: web3.utils.hexToNumber(blockNumber)
    })
      .then(res => {
        console.log(`Created tx ${res.dataValues.id}`)
      })
      .catch(err => {
        console.error(err)
      })
  }

  const eventObj = getEventObj({
    data,
    topics,
    transactionHash,
    blockNumber
  })

  const listingId = `${networkId}-${contractVersion}-${eventObj.listingId}`
  const offerId = `${listingId}-${eventObj.offerId}`
  const shop = await Shop.findOne({ where: { listingId } })
  if (!shop) {
    console.log(`No shop for listing ${listingId}`)
    return
  }

  const event = await upsertEvent({
    web3,
    shopId: shop.id,
    networkId,
    event: {
      data,
      topics,
      transactionHash,
      blockNumber
    }
  })

  await insertOrderFromEvent({ offerId, event, shop })
}

async function insertOrderFromEvent({ offerId, event, shop }) {
  console.log(`${event.eventName} - ${event.offerId} by ${event.party}`)
  console.log(`IPFS Hash: ${event.ipfsHash}`)

  try {
    const dataUrl = await encConf.get(shop.id, 'dataUrl')
    const ipfsGateway = await getIPFSGateway(dataUrl, event.networkId)
    console.log('IPFS Gateway', ipfsGateway)

    const offerData = await getText(ipfsGateway, event.ipfsHash, 10000)
    const offer = JSON.parse(offerData)
    console.log('Offer:', offer)

    const encrypedHash = offer.encryptedData
    if (!encrypedHash) {
      return handleError(event, 'No encrypted data found')
    }

    const encryptedDataJson = await getText(ipfsGateway, encrypedHash, 10000)
    const encryptedData = JSON.parse(encryptedDataJson)

    const PrivateKey = await encConf.get(shop.id, 'pgpPrivateKey')
    const PrivateKeyPass = await encConf.get(shop.id, 'pgpPrivateKeyPass')

    const privateKey = await openpgp.key.readArmored(PrivateKey)
    const privateKeyObj = privateKey.keys[0]
    await privateKeyObj.decrypt(PrivateKeyPass)

    const message = await openpgp.message.readArmored(encryptedData.data)
    const options = { message, privateKeys: [privateKeyObj] }

    const plaintext = await openpgp.decrypt(options)
    const cart = JSON.parse(plaintext.data)
    cart.offerId = offerId
    cart.tx = event.transactionHash

    // console.log(cart)

    const order = await Order.create({
      networkId: event.networkId,
      shopId: shop.id,
      orderId: offerId,
      data: JSON.stringify(cart)
    })

    console.log(`Saved order ${order.id} to DB.`)
    console.log('sendMail', cart)
    sendMail(shop.id, cart)
  } catch (e) {
    console.error(e)
    handleError(event, e.message)
  }
}

module.exports = {
  handleLog,
  insertOrderFromEvent
}