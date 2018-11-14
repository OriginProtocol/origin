import { post } from '../../utils/ipfsHash'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

async function withdrawListing(_, data) {
  await checkMetaMask(data.from)
  const ipfsHash = await post(contracts.ipfsRPC, {
    schemaId: 'http://schema.originprotocol.com/listing-withdraw_v1.0.0'
  })

  const tx = contracts.marketplaceExec.methods
    .withdrawListing(data.listingID, data.target, ipfsHash)
    .send({
      gas: 4612388,
      from: data.from || web3.eth.defaultAccount
    })
  return txHelper({ tx, mutation: 'withdrawListing' })
}

export default withdrawListing
