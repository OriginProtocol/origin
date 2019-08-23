import { post } from '@origin/ipfs'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'
import get from 'lodash/get'

async function addAffiliate(_, data) {
  const from = data.from || contracts.defaultMobileAccount
  const version = data.version || '000'
  await checkMetaMask(from)
  const ipfsHash = await post(contracts.ipfsRPC, data)
  const marketplace = get(contracts, `marketplaces['${version}'].contractExec`)
  const tx = marketplace.methods.addAffiliate(data.affiliate, ipfsHash)
  return txHelper({ tx, from, mutation: 'addAffiliate', gas: 4612388 })
}

export default addAffiliate
