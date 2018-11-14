import { post } from '../../utils/ipfsHash'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

async function updateRefund(_, data) {
  await checkMetaMask(data.from)
  const ipfsHash = await post(contracts.ipfsRPC, data)

  const tx = contracts.marketplaceExec.methods
    .updateRefund(data.listingID, data.offerID, data.amount, ipfsHash)
    .send({
      gas: 4612388,
      from: data.from || web3.eth.defaultAccount
    })
  return txHelper({ tx, mutation: 'updateRefund' })
}

export default updateRefund

/*
mutation addFunds($listingID: String, $offerID: String) {
  addFunds(listingID: $listingID, offerID: $offerID)
}
{
  "listingID": "0",
  "offerID": "0"
}
*/
