'use strict'

import { WalletConstants } from 'actions/Wallet'
import get from 'lodash.get'

const initialState = {
  accounts: [],
  activeAccount: null,
  accountBalance: {},
  identities: {}
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

    case WalletConstants.SET_ACCOUNTS:
      // Verify there is a valid active account, and if not set one
      let hasValidActiveAccount = false
      if (state.activeAccount) {
        hasValidActiveAccount = state.accounts.find(
          a => a.address === state.activeAccount.address
        )
      }
      const activeAccount = hasValidActiveAccount
        ? state.activeAccount
        : action.payload[0]
      return {
        ...state,
        accounts: action.payload,
        activeAccount
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
      return {
        ...state,
        activeAccount: action.account
      }

    case WalletConstants.SET_ACCOUNT_BALANCES:
      return {
        ...state,
        accountBalance: {
          ...state.accountBalance,
          [action.payload.network]: {
            ...state.accountBalance[action.payload.network],
            [action.payload.address]: action.payload.balances
          }
        }
      }

    case WalletConstants.SET_IDENTITY:
      return {
        ...state,
        identities: {
          ...state.identities,
          [action.payload.network]: {
            ...state.identities[action.payload.network],
            [action.payload.address]: action.payload.identity
          }
        }
      }
  }

  return state
}
