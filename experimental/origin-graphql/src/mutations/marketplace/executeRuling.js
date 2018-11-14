import { post } from '../../utils/ipfsHash'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

async function executeRuling(_, data) {
  await checkMetaMask(data.from)
  const ipfsHash = await post(contracts.ipfsRPC, data)
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
    .executeRuling(data.listingID, data.offerID, ipfsHash, ruling, refund)
    .send({
      gas: 4612388,
      from: data.from || web3.eth.defaultAccount
    })
  return txHelper({
    tx,
    mutation: 'executeRuling'
  })
}

export default executeRuling
