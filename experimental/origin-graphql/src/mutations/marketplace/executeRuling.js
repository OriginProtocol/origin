import { post } from 'origin-ipfs'
import { checkMetaMask, txHelperSend } from '../_txHelper'
import contracts from '../../contracts'
import parseId from '../../utils/parseId'

async function executeRuling(_, data) {
  const from = data.from || contracts.defaultLinkerAccount
  await checkMetaMask(from)
  const ipfsHash = await post(contracts.ipfsRPC, data)
  const { listingId, offerId } = parseId(data.offerID)

  let ruling = 0,
    refund = contracts.web3.utils.toWei('0', 'ether')
  if (data.ruling === 'pay-seller') {
    ruling = 0
  } else if (data.ruling === 'partial-refund') {
    ruling = 0
    refund = data.refund
  } else if (data.ruling === 'refund-buyer') {
    ruling = 1
  } else {
    throw new Error(
      'ruling must be one of "pay-seller", "partial-refund", or "refund-buyer"'
    )
  }

  if (data.commission === 'pay') {
    ruling += 2
  } else if (data.commission === 'refund') {
    // no change needed
  } else {
    throw new Error('commission must be either "pay", or "refund"')
  }

  const tx = contracts.marketplaceExec.methods.executeRuling(
    listingId,
    offerId,
    ipfsHash,
    ruling,
    refund
  )

  return txHelperSend({ tx, from, mutation: 'executeRuling' })
}

export default executeRuling
