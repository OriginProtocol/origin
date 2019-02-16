import { post } from 'origin-ipfs'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'
import cost from '../_gasCost'
import parseId from '../../utils/parseId'

async function addFunds(_, data) {
  const from = data.from || contracts.defaultLinkerAccount
  await checkMetaMask(data.from)
  const ipfsHash = await post(contracts.ipfsRPC, data)
  const { listingId, offerId } = parseId(data.offerID)

  const tx = contracts.marketplaceExec.methods
    .addFunds(listingId, offerId, ipfsHash, data.amount)
    .send({ gas: cost.addFunds, from, value: data.amount })

  return txHelper({ tx, from, mutation: 'addFunds' })
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
