import graphqlFields from 'graphql-fields'
import contracts from '../contracts'
import get from 'lodash/get'

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
  networkId: () => contracts.web3.eth.net.getId(),
  networkName: async () => {
    const netId = await contracts.web3.eth.net.getId()
    return networkName(netId)
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
    return new Promise(resolve => {
      contracts.metaMask.eth.net
        .getId()
        .then(id => resolve(id))
        .catch(() => resolve(null))
    })
  },
  metaMaskNetworkName: async () => {
    if (!contracts.metaMask) return null
    const netId = await contracts.metaMask.eth.net.getId()
    return networkName(netId)
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
    if (!contracts.linker) return null
    return contracts.linker.session.linked && contracts.linker.session.accounts
      ? 'mobile-linked'
      : 'mobile-unlinked'
  },
  mobileWalletAccount: async () => {
    if (
      !contracts.linker ||
      !contracts.linker.session.linked ||
      contracts.linker.session.accounts.length == 0
    ) {
      return null
    }
    return {
      id: contracts.linker.session.accounts[0]
    }
  },
  primaryAccount: async () => {
    if (localStorage.useWeb3Wallet) {
      return { id: localStorage.useWeb3Wallet }
    }
    if (contracts.metaMaskEnabled) {
      return web3Resolver.metaMaskAccount()
    }
    if (contracts.linker) {
      return web3Resolver.mobileWalletAccount()
    }
    return null
  }
}

export default web3Resolver
