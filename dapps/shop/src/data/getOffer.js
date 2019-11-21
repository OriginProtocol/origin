import { get } from '@origin/ipfs'
const ListingId = process.env.LISTING_ID
const MarketplaceId = ListingId.split('-')[1]

async function getOfferFromReceipt(tx, password) {
  let encryptedHash, fullOfferId, offer
  if (tx.indexOf('0x') === 0) {
    const web3 = context.web3
    const receipt = await web3.eth.getTransactionReceipt(tx)
    if (!receipt) {
      console.log('Could not find receipt')
      return null
    }

    const offerLog = receipt.logs.find(
      l => l.topics[0].indexOf('0x6ee68') === 0
    )
    if (!offerLog) {
      console.log('Could not find log')
      return null
    }

    const listingId = web3.utils.hexToNumber(offerLog.topics[2])
    const offerId = web3.utils.hexToNumber(offerLog.topics[3])
    const ipfsHash = offerLog.data

    const ipfsData = await get(context.config.ipfsRPC, ipfsHash, 10000)
    encryptedHash = ipfsData.encryptedData

    fullOfferId = `${ListingId}-${offerId}`
    offer = await context.marketplaces[MarketplaceId].contract.methods
      .offers(listingId, offerId)
      .call()
  } else {
    encryptedHash = tx
  }

  try {
    const encryptedData = await get(
      context.config.ipfsRPC,
      encryptedHash,
      10000
    )

    const msg = await openpgp.message.readArmored(encryptedData.buyerData)
    const decrypted = await openpgp.decrypt({
      message: msg,
      passwords: [password]
    })
    const cart = JSON.parse(decrypted.data)
    cart.offerId = fullOfferId

    return { cart, offer }
  } catch (err) {
    return null
  }
}

export default getOfferFromReceipt
