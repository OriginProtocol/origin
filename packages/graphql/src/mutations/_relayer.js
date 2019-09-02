import contracts from '../contracts'
import IdentityProxyContract from '@origin/contracts/build/contracts/IdentityProxy_solc'
import createDebug from 'debug'
import mineBlock from '../utils/mineBlock'

const debug = createDebug('origin:relayer:')
const addr = address => (address ? address.substr(0, 8) : '')

export default async function relayerHelper({ tx, from, proxy, to }) {
  debug(`send tx from ${addr(from)}.${proxy ? ` Proxy: ${addr(proxy)}` : ''}`)

  const provider = contracts.web3.currentProvider.host
  let nonce = 0

  if (proxy) {
    const IdentityProxy = new contracts.web3Exec.eth.Contract(
      IdentityProxyContract.abi,
      proxy
    )
    nonce = await IdentityProxy.methods.nonce(from).call()
  }

  const txData = tx.encodeABI()

  // Check if the relayer is available and willing to pay gas for this tx
  const relayerUrl = contracts.config.relayer + '/relay'
  const relayerAvailable = await fetch(relayerUrl, {
    headers: { 'content-type': 'application/json' },
    method: 'POST',
    body: JSON.stringify({
      to,
      from,
      txData,
      provider,
      proxy,
      preflight: true
    })
  })
  const availableData = await relayerAvailable.json()
  if (availableData.errors) {
    debug(`relayer unavailable: ${availableData.errors[0]}`)
    throw new Error(availableData.errors[0])
  } else if (!availableData.success) {
    debug(`relayer unavailable.`)
    throw new Error('Relayer server unavailable')
  }

  let dataToSign
  if (
    window.ReactNativeWebView &&
    contracts.web3Exec.currentProvider.isOrigin
  ) {
    // Marketplace mobile app, send the complete object so the mobile app can
    // verify what it is signing, and then generate the sha3 hash
    dataToSign = JSON.stringify({
      to,
      from,
      txData,
      provider,
      proxy,
      nonce
    })
  } else {
    dataToSign = contracts.web3.utils.soliditySha3(
      { t: 'address', v: from },
      { t: 'address', v: to },
      { t: 'uint256', v: contracts.web3.utils.toWei('0', 'ether') },
      { t: 'bytes', v: txData },
      { t: 'uint256', v: nonce }
    )
  }

  // Fall back to eth.sign... but if that fails too, throw original error
  let signature, sigErr
  try {
    signature = await contracts.web3Exec.eth.personal.sign(dataToSign, from)
  } catch (err) {
    // Don't try fallback if user declined signature
    if (String(err).match(/denied message signature/)) {
      sigErr = err
    } else {
      try {
        signature = await contracts.web3Exec.eth.sign(dataToSign, from)
      } catch (err) {
        sigErr = err
      }
    }
  }
  if (!signature) {
    throw sigErr
  }

  const response = await fetch(relayerUrl, {
    headers: { 'content-type': 'application/json' },
    method: 'POST',
    body: JSON.stringify({
      to,
      from,
      signature,
      txData,
      provider,
      proxy
    })
  })

  if (contracts.automine) {
    setTimeout(() => mineBlock(contracts.web3), contracts.automine)
  }

  const data = await response.json()
  if (data.errors) {
    debug(`error: ${data.errors[0]}`)
    throw new Error(data.errors[0])
  }

  debug(`success. tx hash: ${data.id}`)
  return { id: data.id }
}
