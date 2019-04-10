'use strict'

import { WalletConstants } from 'actions/Wallet'

const initialState = {
  accounts: [],
  accountNameMapping: {}
}

export default function Wallet(state = initialState, action = {}) {
  switch (action.type) {
    case WalletConstants.INIT_SUCCESS:
      return { ...state, address: action.address }

    case WalletConstants.ADD_ACCOUNT:
      return {
        ...state,
        accounts: [action.account, ...state.accounts]
      }

    case WalletConstants.REMOVE_ACCOUNT:
      return {
        ...state,
        accounts: accounts.filter(a => a.address == actions.address)
      }

    case WalletConstants.SET_DEFAULT_ACCOUNT:
      return {
        ...state
      }

    case WalletConstants.SET_ACCOUNT_NAME:
      return {
        ...state,
        accountNameMapping: {
          ...state.accountNameMapping,
          [action.payload.address]: action.payload.name
        }
      }

    case WalletConstants.UPDATE_ACCOUNTS:
      return { ...state, accounts: action.accounts }
  }

  return state
}
