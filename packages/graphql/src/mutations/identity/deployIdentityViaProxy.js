import ProxyFactory from '@origin/contracts/build/contracts/ProxyFactory_solc'
import IdentityProxy from '@origin/contracts/build/contracts/IdentityProxy_solc'

import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'
import { resetProxyCache } from '../../utils/proxy'

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

  // const tx = Contract.methods.createProxyWithNonce(proxyAddress, initFn, 0)
  const tx = Contract.methods.createProxyWithSenderNonce(
    proxyAddress,
    initFn,
    owner,
    0
  )
  const gas = await tx.estimateGas()

  return txHelper({
    tx,
    from,
    gas,
    mutation: 'deployIdentityViaProxy',
    onConfirmation: () => resetProxyCache()
  })
}

export default deployIdentityViaProxy
