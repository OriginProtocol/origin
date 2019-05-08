import ProxyFactory from '@origin/contracts/build/contracts/ProxyFactory_solc'
import IdentityProxy from '@origin/contracts/build/contracts/IdentityProxy_solc'

import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

async function deployIdentityViaProxy(
  _,
  { from, factoryAddress, proxyAddress, owner }
) {
  const web3 = contracts.web3Exec
  await checkMetaMask(from)

  factoryAddress = factoryAddress || contracts.config.ProxyFactory
  proxyAddress = proxyAddress || contracts.config.IdentityProxyImplementation
  if (!factoryAddress) {
    throw new Error('No Proxy Factory given')
  }
  if (!proxyAddress) {
    throw new Error('No Identity Proxy Implementation')
  }

  const IdentityContract = new web3.eth.Contract(IdentityProxy.abi)
  const initFn = await IdentityContract.methods.changeOwner(owner).encodeABI()
  const Contract = new web3.eth.Contract(ProxyFactory.abi, factoryAddress)

  console.log('changeOwner', owner, initFn)

  return txHelper({
    tx: Contract.methods.createProxyWithNonce(proxyAddress, initFn, 0),
    from,
    gas: 5500000,
    mutation: 'deployIdentityViaProxy',
    onReceipt: res => {
      console.log('res', res)
    }
  })
}

export default deployIdentityViaProxy
