import { post } from '@origin/ipfs'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

async function addAffiliate(_, data) {
  const from = data.from || contracts.defaultMobileAccount
  await checkMetaMask(from)
  const ipfsHash = await post(contracts.ipfsRPC, data)
  const tx = contracts.marketplaceExec.methods
    .addAffiliate(data.affiliate, ipfsHash)
  return txHelper({ tx, from, mutation: 'addAffiliate', gas: 4612388 })
}

export default addAffiliate
