import { post } from '@origin/ipfs'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'
import cost from '../_gasCost'
import parseId from '../../utils/parseId'

async function updateRefund(_, data) {
  const from = data.from || contracts.defaultMobileAccount
  await checkMetaMask(from)
  const ipfsHash = await post(contracts.ipfsRPC, data)
  const { listingId, offerId } = parseId(data.offerID)

  const tx = contracts.marketplaceExec.methods.updateRefund(
    listingId,
    offerId,
    data.amount,
    ipfsHash
  )

  return txHelper({
    tx,
    from,
    mutation: 'updateRefund',
    gas: cost.updateRefund
  })
}

export default updateRefund
