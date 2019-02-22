import { post } from 'origin-ipfs'
import { checkMetaMask, txHelperSend } from '../_txHelper'
import contracts from '../../contracts'
import parseId from '../../utils/parseId'

async function updateRefund(_, data) {
  const from = data.from || contracts.defaultLinkerAccount
  await checkMetaMask(from)
  const ipfsHash = await post(contracts.ipfsRPC, data)
  const { listingId, offerId } = parseId(data.offerID)

  const tx = contracts.marketplaceExec.methods.updateRefund(
    listingId,
    offerId,
    data.amount,
    ipfsHash
  )

  return txHelperSend({ tx, from, mutation: 'updateRefund' })
}

export default updateRefund
