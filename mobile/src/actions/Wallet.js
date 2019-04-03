import origin from 'services/origin'

import keyMirror from 'utils/keyMirror'

export const WalletConstants = keyMirror(
  {
    INIT: null,
    INIT_SUCCESS: null,
    INIT_ERROR: null,

    BALANCE: null,
    BALANCE_SUCCESS: null,
    BALANCE_ERROR: null,

    OGN_SUCCESS: null,

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

export function getBalance() {
  return async function(dispatch) {
    dispatch({
      type: WalletConstants.BALANCE_SUCCESS,
      balance,
    })
  }
}

export function updateAccounts(accounts) {
  return {
    type: WalletConstants.UPDATE_ACCOUNTS,
    accounts,
  }
}
