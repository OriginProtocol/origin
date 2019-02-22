import { post } from 'origin-ipfs'
import { checkMetaMask, txHelperSend } from '../_txHelper'
import contracts from '../../contracts'
import parseId from '../../utils/parseId'

async function addData(_, data) {
  const from = data.from || contracts.defaultLinkerAccount
  await checkMetaMask(from)
  const ipfsHash = await post(contracts.ipfsRPC, data)
  const listingId = data.listingID,
    offerId = data.offerID

  let args = [ipfsHash]
  if (offerId) {
    const parsed = parseId(offerId)
    args = [parsed.listingId, parsed.offerId, ipfsHash]
  } else if (listingId) {
    const parsed = parseId(listingId)
    args = [parsed.listingId, ipfsHash]
  }

  const tx = contracts.marketplaceExec.methods.addData(...args)
  return txHelperSend({ tx, from, mutation: 'addData' })
}

export default addData
