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
    refundStr = '0'
  if (data.ruling === 'pay-seller') {
    ruling = 0
  } else if (data.ruling === 'partial-refund') {
    ruling = 0
    refundStr = data.refund
  } else if (data.ruling === 'refund-buyer') {
    ruling = 1
  } else {
    throw new Error(
      'ruling must be one of "pay-seller", "partial-refund", or "refund-buyer"'
    )
  }
  // TODO: Finish support for ERC20 offers
  // Currently assumes refund is priced in ETH
  const refund = contracts.web3.utils.toWei(refundStr, 'ether')

  if (data.commission === 'pay') {
    ruling += 2
  } else if (data.commission === 'refund') {
    // no change needed
  } else {
    throw new Error('commission must be either "pay", or "refund"')
  }

  const tx = contracts.marketplaceExec.methods
    .executeRuling(listingId, offerId, ipfsHash, ruling, refund)
    .send({ gas: cost.executeRuling, from })

  return txHelper({ tx, from, mutation: 'executeRuling' })
}

export default executeRuling
