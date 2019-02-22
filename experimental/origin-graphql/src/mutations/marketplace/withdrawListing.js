import { post } from 'origin-ipfs'
import { checkMetaMask, txHelperSend } from '../_txHelper'
import parseId from '../../utils/parseId'
import contracts from '../../contracts'

async function withdrawListing(_, data) {
  const from = data.from || contracts.defaultLinkerAccount
  await checkMetaMask(from)
  const { listingId } = parseId(data.listingID)
  const ipfsHash = await post(contracts.ipfsRPC, {
    schemaId: 'https://schema.originprotocol.com/listing-withdraw_1.0.0.json'
  })

  const tx = contracts.marketplaceExec.methods.withdrawListing(
    listingId,
    data.target,
    ipfsHash
  )

  return txHelperSend({ tx, from, mutation: 'withdrawListing' })
}

export default withdrawListing
