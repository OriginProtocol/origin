import { post } from '@origin/ipfs'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'
import cost from '../_gasCost'
import parseId from '../../utils/parseId'

async function withdrawOffer(_, data) {
  const from = data.from || contracts.defaultMobileAccount
  await checkMetaMask(from)

  const ipfsHash = await post(contracts.ipfsRPC, data)
  const { listingId, offerId } = parseId(data.offerID)
  const { withdrawOffer } = contracts.marketplaceExec.methods

  return txHelper({
    tx: withdrawOffer(listingId, offerId, ipfsHash),
    from,
    mutation: 'withdrawOffer',
    gas: cost.finalizeOffer
  })
}

export default withdrawOffer
