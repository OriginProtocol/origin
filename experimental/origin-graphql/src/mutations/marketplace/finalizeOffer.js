import { post } from 'origin-ipfs'
import { checkMetaMask, txHelperSend } from '../_txHelper'
import contracts from '../../contracts'
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
  const tx = contracts.marketplaceExec.methods.finalize(
    listingId,
    offerId,
    ipfsHash
  )

  return txHelperSend({ tx, from, mutation: 'finalizeOffer' })
}

export default finalizeOffer
