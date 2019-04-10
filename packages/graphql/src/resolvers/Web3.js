import graphqlFields from 'graphql-fields'
import contracts from '../contracts'
import get from 'lodash/get'
import memoize from 'lodash/memoize'

const netId = memoize(async () => await contracts.web3.eth.net.getId())
const mmNetId = memoize(async () => await contracts.metaMask.eth.net.getId())

import { getTransaction, getTransactionReceipt } from './web3/transactions'

function networkName(netId) {
  if (netId === 1) return 'Ethereum Main Network'
  if (netId === 3) return 'Ropsten Network'
  if (netId === 4) return 'Rinkeby Network'
  if (netId === 42) return 'Kovan Network'
  if (netId === 2222) return 'Origin Network'
  return `Private Network (${netId})`
}

const web3Resolver = {
  networkId: async () => await netId(contracts.net),
  networkName: async () => {
    const id = await netId(contracts.net)
    return networkName(id)
  },
  blockNumber: () => contracts.marketplace.eventCache.getBlockNumber(),
  nodeAccounts: () =>
    new Promise(resolve => {
      contracts.web3.eth
        .getAccounts()
        .then(accts => resolve(accts.map(id => ({ id }))))
        .catch(() => resolve([]))
    }),
  nodeAccount: (_, args) => ({ id: args.id }),
  accounts: async () => {
    const accounts = []
    for (let i = 0; i < contracts.web3.eth.accounts.wallet.length; i++) {
      accounts.push({ id: contracts.web3.eth.accounts.wallet[i].address })
    }
    return accounts
  },
  account: (_, args) => ({ id: args.id }),
  defaultAccount: () =>
    contracts.web3.eth.defaultAccount
      ? { id: contracts.web3.eth.defaultAccount }
      : null,

  transaction: async (_, args, context, info) =>
    getTransaction(args.id, graphqlFields(info)),
  transactionReceipt: (_, args) => getTransactionReceipt(args.id),
  metaMaskAvailable: () => (contracts.metaMask ? true : false),
  metaMaskNetworkId: async () => {
    if (!contracts.metaMask) return null
    return await mmNetId(contracts.net)
  },
  metaMaskNetworkName: async () => {
    if (!contracts.metaMask) return null
    const id = await mmNetId(contracts.net)
    return networkName(id)
  },
  useMetaMask: () => (contracts.metaMaskEnabled ? true : false),
  metaMaskEnabled: async () => {
    const fn = get(window, 'ethereum._metamask.isEnabled')
    if (!fn) return false
    return await fn()
  },
  metaMaskApproved: async () => {
    const fn = get(window, 'ethereum._metamask.isApproved')
    if (!fn) return false
    return await fn()
  },
  metaMaskUnlocked: async () => {
    const fn = get(window, 'ethereum._metamask.isUnlocked')
    if (!fn) return false
    return await fn()
  },
  metaMaskAccount: async () => {
    if (!contracts.metaMask) return null
    const accounts = await contracts.metaMask.eth.getAccounts()
    if (!accounts || !accounts.length) return null
    return { id: accounts[0] }
  },
  walletType: () => {
    if (localStorage.useWeb3Wallet) {
      return 'Web3 Wallet'
    }
    if (contracts.mobileBridge) {
      return 'Mobile'
    }
    if (contracts.metaMaskEnabled) {
      const provider = get(contracts, 'web3Exec.currentProvider') || {}
      if (provider.isOrigin) return 'Origin Wallet'
      if (provider.isMetaMask) return 'MetaMask'
      if (provider.isTrust) return 'Trust Wallet'
      if (provider.isToshi) return 'Coinbase Wallet'
      if (typeof window.__CIPHER__ !== 'undefined') return 'Cipher'
      if (get(provider, 'constructor.name') === 'EthereumProvider')
        return 'Mist'
      if (get(provider, 'constructor.name') === 'Web3FrameProvider')
        return 'Parity'
      return 'Meta Mask'
    }
  },
  mobileWalletAccount: async () => {
    if (!contracts.mobileBridge) return null
    const accounts = await contracts.web3Exec.eth.getAccounts()
    if (!accounts || !accounts.length) return null
    return { id: accounts[0] }
  },
  primaryAccount: async () => {
    if (localStorage.useWeb3Wallet) {
      return { id: localStorage.useWeb3Wallet }
    }
    if (contracts.metaMaskEnabled) {
      return web3Resolver.metaMaskAccount()
    }
    if (contracts.mobileBridge) {
      return web3Resolver.mobileWalletAccount()
    }
    return null
  }
}

export default web3Resolver
