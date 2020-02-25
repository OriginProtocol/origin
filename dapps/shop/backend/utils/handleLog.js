require('dotenv').config()

const Web3 = require('web3')
const openpgp = require('openpgp')

const { getIpfsHashFromBytes32, getText, getIPFSGateway } = require('./_ipfs')
const abi = require('./_abi')
const sendMail = require('./emailer')
const encConf = require('./encryptedConfig')
const { Transactions, Orders, Shops } = require('../data/db')

const web3 = new Web3()
const Marketplace = new web3.eth.Contract(abi)
const MarketplaceABI = Marketplace._jsonInterface

const handleLog = async ({
  networkId,
  contractVersion,
  data,
  topics,
  transactionHash,
  blockNumber
}) => {
  const ipfsGateway = await getIPFSGateway()
  console.log('IPFS Gateway', ipfsGateway)
  const eventAbi = MarketplaceABI.find(i => i.signature === topics[0])
  if (!eventAbi) {
    console.log('Unknown event')
    return
  }
  console.log('fetch existing...', transactionHash)
  const existingTx = await Transactions.findOne({ where: { transactionHash } })
  if (existingTx) {
    console.log('Already handled tx')
    return
  } else {
    Transactions.create({
      networkId,
      transactionHash,
      blockNumber: web3.utils.hexToNumber(blockNumber)
    }).then(res => {
      console.log(`Created tx ${res.dataValues.id}`)
    })
  }

  const { name, inputs } = eventAbi
  const decoded = web3.eth.abi.decodeLog(inputs, data, topics.slice(1))
  const { listingID, offerID, ipfsHash, party } = decoded

  const listingId = `${networkId}-${contractVersion}-${listingID}`
  const offerId = `${listingId}-${offerID}`
  const shop = await Shops.findOne({ where: { listingId } })
  if (!shop) {
    console.log(`No shop for listing ${listingId}`)
  }

  console.log(`${name} - ${offerID} by ${party}`)
  console.log(`IPFS Hash: ${getIpfsHashFromBytes32(ipfsHash)}`)

  try {
    const offerData = await getText(ipfsGateway, ipfsHash, 10000)
    const offer = JSON.parse(offerData)
    console.log('Offer:', offer)

    const encrypedHash = offer.encryptedData
    if (!encrypedHash) {
      console.log('No encrypted data found')
      return
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
    cart.tx = transactionHash

    console.log(cart)

    Orders.create({
      networkId,
      shopId: shop.id,
      orderId: offerId,
      data: JSON.stringify(cart)
    })
      .then(() => {
        console.log('Saved to DB OK')
      })
      .catch(e => {
        console.log('Error saving order', e)
      })
    console.log('sendMail', cart)
    // sendMail(cart)
  } catch (e) {
    console.error(e)
  }
}

module.exports = handleLog
