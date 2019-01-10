import { post } from 'origin-ipfs'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'
import parseId from '../../utils/parseId'

async function finalizeOffer(_, data) {
  await checkMetaMask(data.from)
  const ipfsData = {
    schemaId: 'https://schema.originprotocol.com/review_1.0.0.json',
  }
  const { listingId, offerId } = parseId(data.offerID)

  if (data.rating !== undefined) { ipfsData.rating = data.rating }
  if (data.review !== undefined) { ipfsData.text = data.review }

  const ipfsHash = await post(contracts.ipfsRPC, ipfsData)
  const tx = contracts.marketplaceExec.methods
    .finalize(listingId, offerId, ipfsHash)
    .send({
      gas: 4612388,
      from: data.from
    })
  return txHelper({ tx, mutation: 'finalizeOffer' })
}

export default finalizeOffer

/*
mutation finalizeOffer($listingID: String, $offerID: String) {
  finalizeOffer(listingID: $listingID, offerID: $offerID)
}
{
  "listingID": "0",
  "offerID": "0"
}
*/
