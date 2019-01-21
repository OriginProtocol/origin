import { post } from 'origin-ipfs'
import validator from 'origin-validator'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'
import parseId from '../../utils/parseId'
import { validateNewOffer } from './_validation'
const ZeroAddress = '0x0000000000000000000000000000000000000000'

async function makeOffer(_, data) {
  await checkMetaMask(data.from)

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

  const buyer = data.from
  const marketplace = contracts.marketplaceExec

  const affiliateWhitelistDisabled = await marketplace.methods
    .allowedAffiliates(marketplace.options.address)
    .call()

  const affiliate = data.affiliate || contracts.config.affiliate || ZeroAddress
  if (!affiliateWhitelistDisabled) {
    const affiliateAllowed = await marketplace.methods
      .allowedAffiliates(affiliate)
      .call()

    if (!affiliateAllowed) {
      throw new Error('Affiliate not on whitelist')
    }
  }

  await validateNewOffer(listingId, data)

  const ipfsHash = await post(contracts.ipfsRPC, ipfsData)
  const commission = contracts.web3.utils.toWei(
    ipfsData.commission.amount,
    'ether'
  )
  const value = contracts.web3.utils.toWei(data.value, 'ether')
  const arbitrator = data.arbitrator || contracts.config.arbitrator

  const args = [
    listingId,
    ipfsHash,
    ipfsData.finalizes,
    affiliate,
    commission,
    value,
    data.currency || ZeroAddress,
    arbitrator
  ]
  if (data.withdraw) {
    const { offerId } = parseId(data.withdraw)
    args.push(offerId)
  }

  const tx = marketplace.methods.makeOffer(...args).send({
    gas: 4612388,
    from: buyer,
    value
  })
  return txHelper({ tx, from: data.from, mutation: 'makeOffer' })
}

export default makeOffer
