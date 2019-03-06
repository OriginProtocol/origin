import { post } from 'origin-ipfs'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'
import cost from '../_gasCost'
import parseId from '../../utils/parseId'

async function disputeOffer(_, data) {
  const from = data.from || contracts.defaultLinkerAccount
  await checkMetaMask(from)
  const ipfsHash = await post(contracts.ipfsRPC, data)
  const { listingId, offerId } = parseId(data.offerID)

  const tx = contracts.marketplaceExec.methods
    .dispute(listingId, offerId, ipfsHash)
    .send({ gas: cost.disputeOffer, from })

  return txHelper({ tx, from, mutation: 'disputeOffer' })
}

export default disputeOffer
