import contracts from '../contracts'
import IdentityProxyContract from '@origin/contracts/build/contracts/IdentityProxy'

import { isProxy, proxyOwnerOrNull, setProxy } from '../utils/identityProxy'

export default async function relayerHelper({ tx, from, address }) {
  let nonce = 0
  const proxy = isProxy(from) ? from : null
  from = isProxy(from) ? proxyOwnerOrNull(from) : from

  if (proxy) {
    const IdentityProxy = new contracts.web3Exec.eth.Contract(
      IdentityProxyContract.abi,
      proxy
    )
    nonce = await IdentityProxy.methods.nonce(from).call()
  }
  const txData = tx.encodeABI()
  const dataToSign = contracts.web3.utils.soliditySha3(
    { t: 'address', v: from }, // Signer
    { t: 'address', v: address }, // Marketplace address
    { t: 'uint256', v: contracts.web3.utils.toWei('0', 'ether') }, // value
    { t: 'bytes', v: txData },
    { t: 'uint256', v: nonce } // nonce
  )

  const signature = await contracts.web3Exec.eth.personal.sign(dataToSign, from)

  // const signedAlt = await new Promise(resolve =>
  //   setTimeout(() => {
  //     context.web3Exec.currentProvider.sendAsync(
  //       {
  //         method: 'eth_signTypedData',
  //         params: [
  //           [
  //             {
  //               type: 'bytes',
  //               name: 'Create Listing Hash',
  //               value: dataToSign
  //             }
  //           ],
  //           from
  //         ],
  //         from
  //       },
  //       (err, res) => resolve(res.result)
  //     )
  //   }, 500)
  // )
  //
  // console.log(signature)
  // console.log(signedAlt)

  const response = await fetch(contracts.config.relayer, {
    headers: { 'content-type': 'application/json' },
    method: 'POST',
    body: JSON.stringify({
      to: address,
      from,
      signature,
      txData,
      provider: contracts.web3.currentProvider.host,
      identity: proxy
    })
  })

  if (contracts.automine) {
    setTimeout(() => {
      contracts.web3.currentProvider.send({ method: 'evm_mine' }, () => {})
    }, contracts.automine)
  }

  const data = await response.json()
  if (data.userProxy) {
    setProxy(from, data.userProxy)
  }

  return { id: data.id }
}
