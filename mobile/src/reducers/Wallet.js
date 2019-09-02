'use strict'

import { WalletConstants } from 'actions/Wallet'
import get from 'lodash.get'

const initialState = {
  accounts: [],
  activeAccount: null,
  accountBalance: {
    eth: 0,
    dai: 0,
    ogn: 0
  },
  identities: {},
  samsungBksSupported: false,
  samsungBksSeedHash: null
}

export default function Wallet(state = initialState, action = {}) {
  switch (action.type) {
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
        activeAccount:
          get(state, 'activeAccount.address') === action.account.address
            ? null
            : state.activeAccount,
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

    case WalletConstants.SET_SAMSUNG_BKS_SUPPORTED:
      return {
        ...state,
        samsungBksSupported: action.payload
      }

    case WalletConstants.SET_SAMSUNG_BKS_SEEDHASH:
      return {
        ...state,
        samsungBksSeedHash: action.payload
      }
  }

  return state
}
