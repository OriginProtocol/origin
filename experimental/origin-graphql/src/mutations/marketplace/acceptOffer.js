import { post } from 'origin-ipfs'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'
import cost from '../_gasCost'
import parseId from '../../utils/parseId'

async function acceptOffer(_, data) {
  const from = data.from || contracts.defaultLinkerAccount
  await checkMetaMask(from)
  const ipfsHash = await post(contracts.ipfsRPC, {
    schemaId: 'https://schema.originprotocol.com/offer-accept_1.0.0.json'
  })
  const { listingId, offerId } = parseId(data.offerID)

  const offer = await contracts.eventSource.getOffer(listingId, offerId)
  if (!offer.valid) {
    throw new Error(`Invalid offer: ${offer.validationError}`)
  }

  const tx = contracts.marketplaceExec.methods
    .acceptOffer(listingId, offerId, ipfsHash)
    .send({ gas: cost.acceptOffer, from })
  return txHelper({ tx, from, mutation: 'acceptOffer' })
}

export default acceptOffer

/*
mutation makeOffer($listingID: String, $offerID: String) {
  acceptOffer(listingID: $listingID, offerID: $offerID)
}
{
  "listingID": "0",
  "offerID": "0"
}
*/
