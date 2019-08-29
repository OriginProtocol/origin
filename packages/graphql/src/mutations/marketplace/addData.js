import { post } from '@origin/ipfs'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'
import cost from '../_gasCost.js'
import parseId from '../../utils/parseId'

async function addData(_, data) {
  const from = data.from || contracts.defaultMobileAccount
  await checkMetaMask(from)
  const ipfsHash = await post(contracts.ipfsRPC, data)
  const listingId = data.listingID,
    offerId = data.offerID

  let args = [ipfsHash],
    parsed = {}
  if (offerId) {
    parsed = parseId(offerId, contracts)
    args = [parsed.listingId, parsed.offerId, ipfsHash]
  } else if (listingId) {
    parsed = parseId(listingId, contracts)
    args = [parsed.listingId, ipfsHash]
  }

  if (!parsed.marketplace) {
    throw new Error('Unknown marketplace contract')
  }
  const tx = parsed.marketplace.contractExec.methods.addData(...args)
  return txHelper({ tx, from, mutation: 'addData', gas: cost.addData })
}

export default addData
