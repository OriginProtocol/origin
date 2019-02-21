import { post } from 'origin-ipfs'
import validator from 'origin-validator'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'
import cost from '../_gasCost'
import parseId from '../../utils/parseId'

const ZeroAddress = '0x0000000000000000000000000000000000000000'

async function makeOffer(_, data) {
  await checkMetaMask(data.from)

  const buyer = data.from || contracts.defaultLinkerAccount
  const marketplace = contracts.marketplaceExec
  const ipfsData = await toIpfsData(data)

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

  // TODO: add defaults for currency, affiliate, etc. so that default invocation
  // is more concise

  const ipfsHash = await post(contracts.ipfsRPC, ipfsData)
  const commission = contracts.web3.utils.toWei(
    ipfsData.commission.amount,
    'ether'
  )
  const value = contracts.web3.utils.toWei(data.value, 'ether')
  const arbitrator = data.arbitrator || contracts.config.arbitrator

  const { listingId } = parseId(data.listingID)
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
    gas: cost.makeOffer,
    from: buyer,
    value
  })
  return txHelper({ tx, from: buyer, mutation: 'makeOffer' })
}

async function toIpfsData(data) {
  const { listingId } = parseId(data.listingID)
  const listing = await contracts.eventSource.getListing(listingId)
  const web3 = contracts.web3

  // Validate units purchased vs. available
  const unitsAvailable = Number(listing.unitsAvailable)
  const offerQuantity = Number(data.quantity)
  if (offerQuantity > unitsAvailable) {
    throw new Error(
      `Insufficient units available (${unitsAvailable}) for offer (${offerQuantity})`
    )
  }

  const commission = { currency: 'OGN', amount: '0' }
  if (data.commission) {
    // Passed in commission takes precedence
    commission.amount = web3.utils.fromWei(data.commission, 'ether')
  } else if (listing.commissionPerUnit) {
    // Default commission to min(depositAvailable, commissionPerUnit)
    const amount = web3.utils
      .toBN(listing.commissionPerUnit)
      .mul(web3.utils.toBN(data.quantity))
    const depositAvailable = web3.utils.toBN(listing.depositAvailable)
    const commissionWei = amount.lt(depositAvailable)
      ? amount.toString()
      : depositAvailable.toString()
    commission.amount = web3.utils.fromWei(commissionWei, 'ether')
  }

  const ipfsData = {
    schemaId: 'https://schema.originprotocol.com/offer_1.0.0.json',
    listingId,
    listingType: 'unit',
    unitsPurchased: Number.parseInt(data.quantity),
    totalPrice: {
      amount: data.value,
      currency: 'ETH'
    },
    commission,
    finalizes:
      data.finalizes || Math.round(+new Date() / 1000) + 60 * 60 * 24 * 365,
    ...(data.fractionalData || {})
  }

  validator('https://schema.originprotocol.com/offer_1.0.0.json', ipfsData)

  return ipfsData
}

export default makeOffer
