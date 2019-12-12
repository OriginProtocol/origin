import contracts from '../contracts'

export const getMetaMaskAccount = async () => {
  if (!contracts.metaMask) return null
  const accounts = await contracts.metaMask.eth.getAccounts()
  if (!accounts || !accounts.length) return null
  return { id: accounts[0] }
}

export const getMobileWalletAccount = async () => {
  if (!contracts.mobileBridge) return null
  const accounts = await contracts.web3Exec.eth.getAccounts()
  if (!accounts || !accounts.length) return null
  return { id: accounts[0] }
}

export const getPrimaryAccount = async () => {
  if (typeof localStorage !== 'undefined' && localStorage.useWeb3Wallet) {
    return { id: localStorage.useWeb3Wallet }
  }
  if (contracts.metaMaskEnabled) {
    return getMetaMaskAccount()
  }
  if (contracts.mobileBridge) {
    return getMobileWalletAccount()
  }
  return null
}
