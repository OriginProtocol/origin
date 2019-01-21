import { post } from 'origin-ipfs'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'
import parseId from '../../utils/parseId'

async function acceptOffer(_, data) {
  const { from } = data
  await checkMetaMask(from)
  const ipfsHash = await post(contracts.ipfsRPC, {
    schemaId: 'https://schema.originprotocol.com/offer-accept_1.0.0.json'
  })
  const { listingId, offerId } = parseId(data.offerID)

  const tx = contracts.marketplaceExec.methods
    .acceptOffer(listingId, offerId, ipfsHash)
    .send({ gas: 4612388, from })
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
