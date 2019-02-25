import { post } from 'origin-ipfs'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'
import cost from '../_gasCost'
import parseId from '../../utils/parseId'

async function finalizeOffer(_, data) {
  const from = data.from || contracts.defaultLinkerAccount
  await checkMetaMask(from)

  const ipfsData = {
    schemaId: 'https://schema.originprotocol.com/review_1.0.0.json'
  }
  const { listingId, offerId } = parseId(data.offerID)

  if (data.rating !== undefined) {
    ipfsData.rating = data.rating
  }
  if (data.review !== undefined) {
    ipfsData.text = data.review
  }

  const ipfsHash = await post(contracts.ipfsRPC, ipfsData)
  const tx = contracts.marketplaceExec.methods
    .finalize(listingId, offerId, ipfsHash)
    .send({ gas: cost.finalizeOffer, from })

  return txHelper({ tx, from, mutation: 'finalizeOffer' })
}

export default finalizeOffer
