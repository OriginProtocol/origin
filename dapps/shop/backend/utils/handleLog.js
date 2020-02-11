require('dotenv').config()
const config = require('../config')
const netId = config.network

const Web3 = require('web3')
const openpgp = require('openpgp')

const {
  getIpfsHashFromBytes32,
  getText,
  getIPFSGateway
} = require('./_ipfs')
const encConf = require('./encryptedConfig')
const abi = require('./_abi')
const sendMail = require('./emailer')
const { NETWORK_ID } = require('./const')
const { ListingID, OfferID } = require('./id')
const { addressToVersion } = require('./address')
const { Transactions, Shops, Orders } = require('../data/db')

const web3 = new Web3()
const Marketplace = new web3.eth.Contract(abi)
const MarketplaceABI = Marketplace._jsonInterface

const handleLog = async ({
  data,
  topics,
  transactionHash,
  address,
  blockNumber
}) => {
  const ipfsGateway = await getIPFSGateway()
  const eventAbi = MarketplaceABI.find(i => i.signature === topics[0])
  if (!eventAbi) {
    console.log('Unknown event')
    return
  }
  console.log('fetch existing...', transactionHash)
  const existingTx = await Transactions.findOne({
    where: { transactionHash: transactionHash }
  })
  console.log('existing', existingTx)
  if (existingTx) {
    console.log('Already handled tx')
    return
  } else {
    Transactions.create({
      networkId: netId,
      transactionHash: transactionHash,
      blockNumber: web3.utils.hexToNumber(blockNumber)
    }).then(res => {
      console.log(`Created tx ${res.dataValues.id}`)
    })
  }

  const { name, inputs } = eventAbi
  const decoded = web3.eth.abi.decodeLog(inputs, data, topics.slice(1))
  const { listingID, offerID, ipfsHash, party } = decoded

  const contractVersion = addressToVersion(address)
  const lid = new ListingID(listingID, NETWORK_ID, contractVersion)
  const oid = new OfferID(listingID, offerID, NETWORK_ID, contractVersion)

  console.log(`${name} - ${oid.toString()} by ${party}`)
  console.log(`IPFS Hash: ${getIpfsHashFromBytes32(ipfsHash)}`)

  try {
    const offerData = await getText(ipfsGateway, ipfsHash, 10000)
    const offer = JSON.parse(offerData)
    console.log('Offer:', offer)

    if (!offer.encryptedData) {
      console.log('No encrypted data found')
      return
    }

    const record = await Shops.findOne({
      where: {
        listingId: lid.toString()
      }
    })
    const shopId = record.id

    const encryptedDataJson = await getText(
      ipfsGateway,
      offer.encryptedData,
      10000
    )
    const encryptedData = JSON.parse(encryptedDataJson)
    console.log('Encrypted Data:', encryptedData)

    const PrivateKey = await encConf.get(shopId, 'pgpPrivateKey')
    const PrivateKeyPass = await encConf.get(shopId, 'pgpPrivateKeyPass')

    if (!PrivateKey) {
      console.error(
        `Missing private key for shop ${shopId}. Unable to process event!`
      )
      return
    }
    if (!PrivateKeyPass) {
      console.warn(
        `Missing private key decryption passphrase for shop ${shopId}. This will probably fail!`
      )
    }

    const privateKey = await openpgp.key.readArmored(PrivateKey)

    if (!privateKey || !privateKey.keys || privateKey.keys.length < 1) {
      if (privateKey.err) {
        for (const err of privateKey.err) {
          console.error(err)
        }
      }
      console.error(
        `Unable to load private key for shop ${shopId}. Unable to process event!`
      )
      return
    }

    const privateKeyObj = privateKey.keys[0]
    await privateKeyObj.decrypt(PrivateKeyPass)

    const message = await openpgp.message.readArmored(encryptedData.data)
    const options = { message, privateKeys: [privateKeyObj] }

    const plaintext = await openpgp.decrypt(options)
    const cart = JSON.parse(plaintext.data)
    cart.offerId = oid.toString()
    cart.tx = transactionHash

    console.log(cart)

    Orders.create({
      orderId: cart.offerId,
      shopId: shopId,
      networkId: netId,
      data: JSON.stringify(cart)
    }).then(() => {
      console.log('Saved to DB OK')
    })

    sendMail(shopId, cart)
  } catch (e) {
    console.error(e)
  }
}

module.exports = handleLog
