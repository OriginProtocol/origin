import { post } from 'origin-ipfs'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

async function addData(_, data) {
  await checkMetaMask(data.from)
  const ipfsHash = await post(contracts.ipfsRPC, data)

  let args = [ipfsHash]
  if (data.offerID) {
    args = [data.listingID, data.offerID, ipfsHash]
  } else if (data.listingID) {
    args = [data.listingID, ipfsHash]
  }

  const tx = contracts.marketplaceExec.methods.addData(...args).send({
    gas: 4612388,
    from: data.from || web3.eth.defaultAccount
  })
  return txHelper({ tx, mutation: 'addData' })
}

export default addData
