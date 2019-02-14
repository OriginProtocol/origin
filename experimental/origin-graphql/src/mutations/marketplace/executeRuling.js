import { post } from 'origin-ipfs'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'
import cost from '../_gasCost'
import parseId from '../../utils/parseId'

async function executeRuling(_, data) {
  const from = data.from || contracts.defaultLinkerAccount
  await checkMetaMask(from)
  const ipfsHash = await post(contracts.ipfsRPC, data)
  const { listingId, offerId } = parseId(data.offerID)
  let ruling = 0,
    refund = '0'
  if (data.ruling === 'partial-refund') {
    refund = data.refund
  } else if (data.ruling === 'refund-buyer') {
    ruling = 1
    refund = data.refund
  }
  if (data.commission === 'pay') {
    ruling += 2
  }

  const tx = contracts.marketplaceExec.methods
    .executeRuling(listingId, offerId, ipfsHash, ruling, refund)
    .send({ gas: cost.executeRuling, from })

  return txHelper({ tx, from, mutation: 'executeRuling' })
}

export default executeRuling
