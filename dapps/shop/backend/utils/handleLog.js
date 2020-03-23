require('dotenv').config()

const Web3 = require('web3')
const openpgp = require('openpgp')

const { getText, getIPFSGateway } = require('./_ipfs')
const abi = require('./_abi')
const sendMail = require('./emailer')
const { upsertEvent, getEventObj } = require('./events')
const encConf = require('./encryptedConfig')
const { Order, Shop } = require('../models')

const web3 = new Web3()
const Marketplace = new web3.eth.Contract(abi)
const MarketplaceABI = Marketplace._jsonInterface

const handleLog = async ({
  web3,
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

  // console.log('fetch existing...', transactionHash)
  // const existingTx = await Transaction.findOne({ where: { transactionHash } })
  // if (existingTx) {
  //   console.log('Already handled tx')
  //   return
  // } else {
  //   Transaction.create({
  //     networkId,
  //     transactionHash,
  //     blockNumber: web3.utils.hexToNumber(blockNumber)
  //   })
  //     .then(res => {
  //       console.log(`Created tx ${res.dataValues.id}`)
  //     })
  //     .catch(err => {
  //       console.error(err)
  //     })
  // }

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

  let order = await Order.findOne({
    where: {
      networkId: event.networkId,
      shopId: shop.id,
      orderId: offerId
    }
  })

  if (event.eventName.indexOf('Offer') < 0) {
    console.log(`Ignoring event ${event.eventName}`)
    return
  }

  if (order) {
    console.log(`Order ${order.orderId} exists in DB.`)
    // if (event.eventName !== 'OfferCreated') {
    await order.update({ statusStr: event.eventName })
    // }
    return
  }

  try {
    const dataUrl = await encConf.get(shop.id, 'dataUrl')
    const ipfsGateway = await getIPFSGateway(dataUrl, event.networkId)
    console.log('IPFS Gateway', ipfsGateway)

    const offerData = await getText(ipfsGateway, event.ipfsHash, 10000)
    const offer = JSON.parse(offerData)
    console.log('Offer:', offer)

    const encrypedHash = offer.encryptedData
    if (!encrypedHash) {
      throw new Error('No encrypted data found')
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
    const data = JSON.parse(plaintext.data)
    data.offerId = offerId
    data.tx = event.transactionHash

    const fields = {
      data: JSON.stringify(data),
      statusStr: event.eventName,
      updatedBlock: event.blockNumber
    }
    if (event.eventName === 'OfferCreated') {
      fields.createdBlock = event.blockNumber
      fields.ipfsHash = event.ipfsHash
      fields.encryptedIpfsHash = encrypedHash
    }
    // console.log(data)
    if (order) {
      await order.update(fields)
      console.log(`Updated order ${order.orderId}.`)
    } else {
      order = await Order.create({
        networkId: event.networkId,
        shopId: shop.id,
        orderId: offerId,
        ...fields
      })
      console.log(`Saved order ${order.orderId} to DB.`)
    }

    console.log('sendMail', data)
    sendMail(shop.id, data)
  } catch (e) {
    console.error(e)
    const fields = {
      statusStr: 'error',
      data: JSON.stringify({ error: e.message })
    }
    if (order) {
      await order.update(fields)
    } else {
      order = await Order.create({
        networkId: event.networkId,
        shopId: shop.id,
        orderId: offerId,
        ...fields
      })
    }
  }
}

module.exports = {
  handleLog,
  insertOrderFromEvent
}
