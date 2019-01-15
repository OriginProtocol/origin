import { post } from 'origin-ipfs'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'
import parseId from '../../utils/parseId'
import { validateOffer } from './_validation'

async function acceptOffer(_, data) {
  await checkMetaMask(data.from)
  const ipfsHash = await post(contracts.ipfsRPC, {
    schemaId: 'https://schema.originprotocol.com/offer-accept_1.0.0.json'
  })
  const { listingId, offerId } = parseId(data.offerID)
  await validateOffer(data, listingId, offerId)

  const tx = contracts.marketplaceExec.methods
    .acceptOffer(listingId, offerId, ipfsHash)
    .send({
      gas: 4612388,
      from: data.from
    })
  return txHelper({ tx, mutation: 'acceptOffer' })
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
