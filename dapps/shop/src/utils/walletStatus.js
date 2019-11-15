import get from 'lodash/get'

export default function walletStatus(data, loading) {
  if (loading) {
    return 'loading'
  }
  const web3 = get(data, 'web3')
  if (!web3) {
    return 'no-web3'
  }
  const isMetaMask = get(data, 'web3.walletType') === 'MetaMask'

  if (!web3.metaMaskAvailable) {
    return 'no-wallet'
  } else if (isMetaMask && !web3.metaMaskUnlocked) {
    return 'wallet-locked'
  } else if (isMetaMask && !web3.metaMaskApproved) {
    return 'wallet-unapproved'
  } else if (web3.networkId !== web3.metaMaskNetworkId) {
    return 'wrong-network'
  }

  return 'ready'
}
