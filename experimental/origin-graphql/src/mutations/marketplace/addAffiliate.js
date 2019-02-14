import { post } from 'origin-ipfs'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

async function addAffiliate(_, data) {
  const from = data.from || contracts.defaultLinkerAccount
  await checkMetaMask(from)
  const ipfsHash = await post(contracts.ipfsRPC, data)
  const tx = contracts.marketplaceExec.methods
    .addAffiliate(data.affiliate, ipfsHash)
    .send({ gas: 4612388, from })
  return txHelper({ tx, from, mutation: 'addAffiliate' })
}

export default addAffiliate
