import { post } from 'origin-ipfs'
import validator from 'origin-validator'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'
import parseId from '../../utils/parseId'
const ZeroAddress = '0x0000000000000000000000000000000000000000'

async function makeOffer(_, data) {
  const { from } = data
  await checkMetaMask(from)

  const { listingId } = parseId(data.listingID)

  const ipfsData = {
    schemaId: 'https://schema.originprotocol.com/offer_1.0.0.json',
    listingId,
    listingType: 'unit',
    unitsPurchased: Number.parseInt(data.quantity),
    totalPrice: {
      amount: data.value,
      currency: 'ETH'
    },
    commission: {
      amount: data.commission || '0',
      currency: 'OGN'
    },
    finalizes:
      data.finalizes || Math.round(+new Date() / 1000) + 60 * 60 * 24 * 365
  }

  validator('https://schema.originprotocol.com/offer_1.0.0.json', ipfsData)

  const marketplace = contracts.marketplaceExec

  const affiliateWhitelistDisabled = await marketplace.methods
    .allowedAffiliates(marketplace.options.address)
    .call()

  if (!affiliateWhitelistDisabled) {
    const affiliateAllowed = await marketplace.methods
      .allowedAffiliates(data.affiliate)
      .call()

    if (!affiliateAllowed) {
      throw new Error('Affiliate not on whitelist')
    }
  }

  const ipfsHash = await post(contracts.ipfsRPC, ipfsData)
  const commission = contracts.web3.utils.toWei(
    ipfsData.commission.amount,
    'ether'
  )
  const value = contracts.web3.utils.toWei(data.value, 'ether')

  const args = [
    listingId,
    ipfsHash,
    ipfsData.finalizes,
    data.affiliate || ZeroAddress,
    commission,
    value,
    data.currency || ZeroAddress,
    data.arbitrator || ZeroAddress
  ]
  if (data.withdraw) {
    const { offerId } = parseId(data.withdraw)
    args.push(offerId)
  }

  const tx = marketplace.methods.makeOffer(...args).send({
    gas: 4612388,
    from,
    value
  })
  return txHelper({ tx, from, mutation: 'makeOffer' })
}

export default makeOffer
