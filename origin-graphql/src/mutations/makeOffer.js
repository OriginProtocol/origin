import { post } from '../utils/ipfsHash'
import txHelper, { checkMetaMask } from './_txHelper'
import validator from '../utils/validator'
import contracts from '../contracts'

async function makeOffer(_, data) {
  await checkMetaMask(data.from)

  const ipfsData = {
    schemaId: 'http://schema.originprotocol.com/offer_v1.0.0',
    listingId: data.listingID,
    listingType: 'unit',
    unitsPurchased: 1,
    totalPrice: {
      amount: data.value,
      currency: 'ETH'
    },
    commission: {
      amount: data.commission,
      currency: 'OGN'
    },
    finalizes: data.finalizes
  }

  validator('http://schema.originprotocol.com/offer_v1.0.0', ipfsData)

  const buyer = data.from
  const marketplace = contracts.marketplaceExec

  const affilaiteWhitelistDisabled = await marketplace.methods
    .allowedAffiliates(marketplace.options.address)
    .call()

  if (!affilaiteWhitelistDisabled) {
    const affilaiteAllowed = await marketplace.methods
      .allowedAffiliates(data.affiliate)
      .call()

    if (!affilaiteAllowed) {
      throw new Error('Affiliate not on whitelist')
    }
  }

  const ipfsHash = await post(contracts.ipfsRPC, ipfsData)
  const commission = web3.utils.toWei(data.commission, 'ether')
  const value = web3.utils.toWei(data.value, 'ether')

  const args = [
    data.listingID,
    ipfsHash,
    data.finalizes,
    data.affiliate,
    commission,
    value,
    data.currency,
    data.arbitrator
  ]
  if (data.withdraw) {
    args.push(data.withdraw)
  }

  const tx = marketplace.methods.makeOffer(...args).send({
    gas: 4612388,
    from: buyer,
    value
  })
  return txHelper({ tx, mutation: 'makeOffer' })
}

export default makeOffer

/*
mutation makeOffer(
  $listingID: String,
  $finalizes: String,
  $affiliate: String,
  $commission: String,
  $value: String,
  $currency: String,
  $arbitrator: String
) {
  makeOffer(
    listingID: $listingID,
    finalizes: $finalizes,
    affiliate: $affiliate,
    commission: $commission,
    value: $value,
    currency: $currency,
    arbitrator: $arbitrator
  )
}
{
  "listingID": "0",
  "finalizes": "1536300000",
  "affiliate": "0x7c38A2934323aAa8dAda876Cfc147C8af40F8D0e",
  "commission": "0",
  "value": "100000000000000000",
  "currency": "0x0000000000000000000000000000000000000000",
  "arbitrator": "0x7c38A2934323aAa8dAda876Cfc147C8af40F8D0e"
}
*/
