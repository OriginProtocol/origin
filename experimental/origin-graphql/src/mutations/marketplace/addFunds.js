import { post } from 'origin-ipfs'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

async function addFunds(_, data) {
  await checkMetaMask(data.from)
  const ipfsHash = await post(contracts.ipfsRPC, data)

  const tx = contracts.marketplaceExec.methods
    .addFunds(data.listingID, data.offerID, ipfsHash, data.amount)
    .send({
      gas: 4612388,
      from: data.from || web3.eth.defaultAccount,
      value: data.amount
    })
  return txHelper({ tx, mutation: 'addFunds' })
}

export default addFunds

/*
mutation addFunds($listingID: String, $offerID: String) {
  addFunds(listingID: $listingID, offerID: $offerID)
}
{
  "listingID": "0",
  "offerID": "0"
}
*/
