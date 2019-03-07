import { post } from 'origin-ipfs'
import txHelper, { checkMetaMask } from '../_txHelper'
import parseId from '../../utils/parseId'
import contracts from '../../contracts'
import cost from '../_gasCost'

async function withdrawListing(_, data) {
  const from = data.from || contracts.defaultLinkerAccount
  await checkMetaMask(from)
  const { listingId } = parseId(data.listingID)
  const ipfsHash = await post(contracts.ipfsRPC, {
    schemaId: 'https://schema.originprotocol.com/listing-withdraw_1.0.0.json'
  })

  const tx = contracts.marketplaceExec.methods
    .withdrawListing(listingId, data.target, ipfsHash)
    .send({ gas: cost.withdrawListing, from })

  return txHelper({ tx, from, mutation: 'withdrawListing' })
}

export default withdrawListing
