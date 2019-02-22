import { post } from 'origin-ipfs'
import { checkMetaMask, txHelperSend } from '../_txHelper'
import contracts from '../../contracts'

async function addAffiliate(_, data) {
  const from = data.from || contracts.defaultLinkerAccount
  await checkMetaMask(from)
  const ipfsHash = await post(contracts.ipfsRPC, data)
  const tx = contracts.marketplaceExec.methods.addAffiliate(
    data.affiliate,
    ipfsHash
  )
  return txHelperSend({ tx, from, mutation: 'addAffiliate' })
}

export default addAffiliate
