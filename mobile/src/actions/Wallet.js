'use strict'

import keyMirror from 'utils/keyMirror'

export const WalletConstants = keyMirror(
  {
    ADD_ACCOUNT: null,
    REMOVE_ACCOUNT: null,
    SET_ACCOUNT_ACTIVE: null,
    SET_ACCOUNT_NAME: null,
    SET_ACCOUNT_BALANCES: null,
    SET_ACCOUNT_SERVER_NOTIFICATIONS: null
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

export function setAccountActive(account) {
  return {
    type: WalletConstants.SET_ACCOUNT_ACTIVE,
    account
  }
}

export function setAccountBalances(payload) {
  return {
    type: WalletConstants.SET_ACCOUNT_BALANCES,
    payload
  }
}

export function setAccountName(payload) {
  return {
    type: WalletConstants.SET_ACCOUNT_NAME,
    payload
  }
}
