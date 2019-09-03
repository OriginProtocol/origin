'use strict'

import { DeviceEventEmitter } from 'react-native'
import { ethers } from 'ethers'

import { generateHdPath } from 'utils/user'
import keyMirror from 'utils/keyMirror'
import Store from '../Store'

export const WalletConstants = keyMirror(
  {
    ADD_ACCOUNT: null,
    REMOVE_ACCOUNT: null,
    SET_ACCOUNTS: null,
    SET_ACCOUNT_ACTIVE: null,
    SET_ACCOUNT_BALANCES: null,
    SET_IDENTITY: null
  },
  'WALLET'
)

export function addAccount(account) {
  global.web3.eth.accounts.wallet.add(account)
  return {
    type: WalletConstants.ADD_ACCOUNT,
    account
  }
}

/* Override the account store with a new array. This is used for integration
 * with Samsung BKS where the store seed hash changes, which indicates the
 * user has done a reset, so none of the old accounts stored are valid.
 */
export function setAccounts(payload) {
  return {
    type: WalletConstants.SET_ACCOUNTS,
    payload
  }
}

/* Generate a new wallet from a random mnemonic and import an account from that
 * mnemonic.
 */
export function createAccount() {
  const mnemonic = ethers.Wallet.createRandom().mnemonic
  return importAccountFromMnemonic(mnemonic)
}

/* Import a new account from a mnemonic, retrying up until a limit is reached
 * or a a free derive path is found.
 */
export function importAccountFromMnemonic(mnemonic, maxRetries = 10) {
  const existingAddresses = Store.getState().wallet.accounts.map(a => a.address)
  // Use a loop to try the next account in the derivation path
  for (let i = 0; i < maxRetries; i++) {
    // This is the default path but explicitly stated here for clarity
    const hdPath = generateHdPath(i)
    // Web3js doesn't support wallet creation from a mnemonic, so somewhat
    // redundantly we have to include ethersjs. Perhaps migrate everything
    // away from web3js to ethersjs or the functionality will be added to web3js
    // sometime in the future, see:
    // https://github.com/ethereum/web3.js/issues/1594
    const account = ethers.Wallet.fromMnemonic(mnemonic, hdPath)
    if (!existingAddresses.includes(account.address)) {
      return addAccount({
        address: account.address,
        mnemonic: account.mnemonic,
        privateKey: account.privateKey
      })
    }
  }
  throw new Error('Maximum addresses for that mnemonic reached.')
}

/* Import a new account from a private key.
 */
export function importAccountFromPrivateKey(privateKey) {
  if (!privateKey.startsWith('0x') && /^[0-9a-fA-F]+$/.test(privateKey)) {
    privateKey = '0x' + privateKey
  }
  const account = new ethers.Wallet(privateKey)
  return addAccount({
    address: account.address,
    mnemonic: account.mnemonic,
    privateKey: account.privateKey
  })
}

/* Remove an account from the accoun store.
 */
export function removeAccount(account) {
  if (account && account.address) {
    global.web3.eth.accounts.wallet.remove(account.address)
  }
  // Emit removeAccount, used by PushNotification component to unregister the
  // account from the notifications server
  DeviceEventEmitter.emit('removeAccount', account)
  return {
    type: WalletConstants.REMOVE_ACCOUNT,
    account
  }
}

export function setAccountBalances(balances) {
  return {
    type: WalletConstants.SET_ACCOUNT_BALANCES,
    balances
  }
}

export function setAccountActive(account) {
  return {
    type: WalletConstants.SET_ACCOUNT_ACTIVE,
    account
  }
}

export function setIdentity(payload) {
  return {
    type: WalletConstants.SET_IDENTITY,
    payload
  }
}
