'use strict'

import keyMirror from 'utils/keyMirror'

export const WalletConstants = keyMirror(
  {
    ADD_ACCOUNT: null,
    REMOVE_ACCOUNT: null,
    SET_ACCOUNT_ACTIVE: null,
    SET_ACCOUNT_NAME: null,
    UPDATE_ACCOUNTS: null
  },
  'WALLET'
)

export function addAccount(account) {
  return {
    type: WalletConstants.ADD_ACCOUNT,
    account
  }
}

export function removeAccount(account) {
  return {
    type: WalletConstants.REMOVE_ACCOUNT,
    account
  }
}

export function setAccountName(payload) {
  return {
    type: WalletConstants.SET_ACCOUNT_NAME,
    payload
  }
}

export function setAccountActive(account) {
  return {
    type: WalletConstants.SET_ACCOUNT_ACTIVE,
    account
  }
}

export function updateAccounts(accounts) {
  return {
    type: WalletConstants.UPDATE_ACCOUNTS,
    accounts
  }
}
