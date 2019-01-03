export default function getCurrentProvider(web3) {
  if (!web3 || !web3.version) {
    console.error(
      'Undefined or invalid web3 object provided to getCurrentProvider util.'
    )
    return
  }

  if (web3.currentProvider.isOrigin) return 'Origin Wallet'

  if (web3.currentProvider.isMetaMask) return 'MetaMask'

  if (web3.currentProvider.isTrust) return 'Trust Wallet'

  if (web3.currentProvider.isToshi) return 'Coinbase Wallet'

  if (typeof window.__CIPHER__ !== 'undefined') return 'Cipher'

  if (web3.currentProvider.constructor.name === 'EthereumProvider')
    return 'Mist'

  if (web3.currentProvider.constructor.name === 'Web3FrameProvider')
    return 'Parity'

  if (
    web3.currentProvider.host &&
    web3.currentProvider.host.indexOf('infura') !== -1
  )
    return 'Infura'

  if (
    web3.currentProvider.host &&
    web3.currentProvider.host.indexOf('localhost') !== -1
  )
    return 'Localhost'

  return 'Unknown Provider'
}
