import { post } from 'origin-ipfs'
import txHelper, { checkMetaMask } from '../_txHelper'
import parseId from '../../utils/parseId'
import contracts from '../../contracts'

async function withdrawListing(_, data) {
  await checkMetaMask(data.from)
  const { listingId } = parseId(data.listingID)
  const ipfsHash = await post(contracts.ipfsRPC, {
    schemaId: 'https://schema.originprotocol.com/listing-withdraw_1.0.0.json'
  })

  const tx = contracts.marketplaceExec.methods
    .withdrawListing(listingId, data.target, ipfsHash)
    .send({
      gas: 4612388,
      from: data.from
    })
  return txHelper({ tx, mutation: 'withdrawListing' })
}

export default withdrawListing
