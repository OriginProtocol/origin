require('dotenv').config()
const config = require('../config')
const netId = config.network

const Web3 = require('web3')
const openpgp = require('openpgp')

const { getIpfsHashFromBytes32, getText } = require('./_ipfs')
const abi = require('./_abi')
const sendMail = require('./emailer')
const { Transactions, Orders } = require('../data/db')

const web3 = new Web3()
const Marketplace = new web3.eth.Contract(abi)
const MarketplaceABI = Marketplace._jsonInterface

const PrivateKeyPass = process.env.PGP_PRIVATE_KEY_PASS
const PrivateKeyVar = process.env.PGP_PRIVATE_KEY || ''
const PrivateKey = PrivateKeyVar.startsWith('--')
  ? PrivateKeyVar
  : Buffer.from(PrivateKeyVar, 'base64').toString('ascii')

const handleLog = async ({ data, topics, transactionHash, blockNumber }) => {
  const siteConfig = await config.getSiteConfig()
  const eventAbi = MarketplaceABI.find(i => i.signature === topics[0])
  if (!eventAbi) {
    console.log('Unknown event')
    return
  }
  console.log('fetch existing...', transactionHash)
  const existingTx = await Transactions.findOne({
    where: { transaction_hash: transactionHash }
  })
  console.log('existing', existingTx)
  if (existingTx) {
    console.log('Already handled tx')
    return
  } else {
    Transactions.create({
      network_id: netId,
      transaction_hash: transactionHash,
      block_number: web3.utils.hexToNumber(blockNumber)
    }).then(res => {
      console.log(`Created tx ${res.dataValues.id}`)
    })
  }

  const { name, inputs } = eventAbi
  const decoded = web3.eth.abi.decodeLog(inputs, data, topics.slice(1))
  const { offerID, ipfsHash, party } = decoded

  console.log(`${name} - ${siteConfig.listingId}-${offerID} by ${party}`)
  console.log(`IPFS Hash: ${getIpfsHashFromBytes32(ipfsHash)}`)

  try {
    const offerData = await getText(siteConfig.ipfsGateway, ipfsHash, 10000)
    const offer = JSON.parse(offerData)
    console.log('Offer:', offer)

    if (!offer.encryptedData) {
      console.log('No encrypted data found')
      return
    }

    const encryptedDataJson = await getText(
      siteConfig.ipfsGateway,
      offer.encryptedData,
      10000
    )
    const encryptedData = JSON.parse(encryptedDataJson)
    console.log('Encrypted Data:', encryptedData)

    const privateKey = await openpgp.key.readArmored(PrivateKey)
    const privateKeyObj = privateKey.keys[0]
    await privateKeyObj.decrypt(PrivateKeyPass)

    const message = await openpgp.message.readArmored(encryptedData.data)
    const options = { message, privateKeys: [privateKeyObj] }

    const plaintext = await openpgp.decrypt(options)
    const cart = JSON.parse(plaintext.data)
    cart.offerId = `${siteConfig.listingId}-${offerID}`
    cart.tx = transactionHash

    console.log(cart)

    Orders.create({
      order_id: cart.offerId,
      network_id: netId,
      data: JSON.stringify(cart)
    }).then(() => {
      console.log('Saved to DB OK')
    })
    console.log('sendMail', cart)
    sendMail(cart)
  } catch (e) {
    console.error(e)
  }
}

module.exports = handleLog
