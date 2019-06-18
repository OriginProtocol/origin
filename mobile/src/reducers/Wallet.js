'use strict'

import { WalletConstants } from 'actions/Wallet'

const initialState = {
  accounts: [],
  activeAccount: null,
  accountBalance: {
    eth: 0,
    dai: 0,
    ogn: 0
  },
  identities: {}
}

export default function Wallet(state = initialState, action = {}) {
  switch (action.type) {
    case WalletConstants.INIT_SUCCESS:
      return { ...state, address: action.address }

    case WalletConstants.ADD_ACCOUNT:
      const exists = state.accounts.find(
        a => a.address === action.account.address
      )
      if (!exists && action.account.address && action.account.privateKey) {
        return {
          ...state,
          accounts: [...state.accounts, action.account],
          activeAccount: action.account
        }
      } else {
        return state
      }

    case WalletConstants.REMOVE_ACCOUNT:
      return {
        ...state,
        accounts: state.accounts.filter(
          a => a.address !== action.account.address
        )
      }

    case WalletConstants.SET_ACCOUNT_ACTIVE:
      if (action.account.address && action.account.privateKey) {
        return {
          ...state,
          activeAccount: action.account
        }
      } else {
        return state
      }

    case WalletConstants.SET_ACCOUNT_BALANCES:
      return {
        ...state,
        accountBalance: action.balances
      }

    case WalletConstants.SET_IDENTITY:
      return {
        ...state,
        identities: {
          ...state.identities,
          [action.payload.address]: action.payload.identity
        }
      }
  }

  return state
}
