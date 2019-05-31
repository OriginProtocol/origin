import contracts from '../contracts'
import IdentityProxyContract from '@origin/contracts/build/contracts/IdentityProxy_solc'

export default async function relayerHelper({ tx, from, proxy, to }) {
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
    throw new Error(availableData.errors[0])
  } else if (!availableData.success) {
    throw new Error('Relayer server unavailable')
  }

  const dataToSign = contracts.web3.utils.soliditySha3(
    { t: 'address', v: from },
    { t: 'address', v: to },
    { t: 'uint256', v: contracts.web3.utils.toWei('0', 'ether') },
    { t: 'bytes', v: txData },
    { t: 'uint256', v: nonce }
  )

  let signature
  try {
    signature = await contracts.web3Exec.eth.personal.sign(dataToSign, from)
  } catch (e) {
    signature = await contracts.web3Exec.eth.sign(
      '\x19Ethereum Signed Message:\n' + dataToSign.length + dataToSign,
      from
    )
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
    setTimeout(() => {
      contracts.web3.currentProvider.send({ method: 'evm_mine' }, () => {})
    }, contracts.automine)
  }

  const data = await response.json()
  if (data.errors) {
    throw new Error(data.errors[0])
  }

  return { id: data.id }
}
