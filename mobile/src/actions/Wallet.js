'use strict'

import keyMirror from 'utils/keyMirror'

export const WalletConstants = keyMirror(
  {
    INIT: null,
    INIT_SUCCESS: null,
    INIT_ERROR: null,
    ADD_ACCOUNT: null,
    REMOVE_ACCOUNT: null,
    UPDATE_ACCOUNTS: null,
  },
  'WALLET'
)

export function init(address) {
  return {
    type: WalletConstants.INIT_SUCCESS,
    address,
  }
}

export function addAccount(account) {
  return {
    type: WalletConstants.ADD_ACCOUNT,
    account
  }
}

export function removeAccount(address) {
  return {
    type: WalletConstants.REMOVE_ACCOUNT,
    address
  }
}

export function updateAccounts(accounts) {
  return {
    type: WalletConstants.UPDATE_ACCOUNTS,
    accounts
  }
}
