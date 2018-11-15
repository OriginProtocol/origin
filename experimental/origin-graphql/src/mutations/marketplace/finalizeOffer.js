import { post } from '../../utils/ipfsHash'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

async function finalizeOffer(_, data) {
  await checkMetaMask(data.from)
  const ipfsData = {
    schemaId: 'http://schema.originprotocol.com/review_v1.0.0',
  }
  if (data.rating !== undefined) { ipfsData.rating = data.rating }
  if (data.review !== undefined) { ipfsData.review = data.review }

  const ipfsHash = await post(contracts.ipfsRPC, ipfsData)
  const tx = contracts.marketplaceExec.methods
    .finalize(data.listingID, data.offerID, ipfsHash)
    .send({
      gas: 4612388,
      from: data.from || web3.eth.defaultAccount
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
