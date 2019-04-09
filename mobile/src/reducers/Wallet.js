import { WalletConstants } from 'actions/Wallet'

const initialState = {
  accounts: [],
  address: undefined,
  balances: {
    eth: '0',
    ogn: '0',
    dai: '0',
  },
}

export default function Wallet(state = initialState, action = {}) {
  switch (action.type) {
    case WalletConstants.INIT_SUCCESS:
      return { ...state, address: action.address }

    case WalletConstants.BALANCE_SUCCESS:
      return { ...state, balances: { ...state.balances, eth: action.balance } }

    case WalletConstants.DAI_SUCCESS:
      return { ...state, balances: { ...state.balances, dai: action.dais } }

    case WalletConstants.OGN_SUCCESS:
      return { ...state, balances: { ...state.balances, ogn: action.ogns } }

    case WalletConstants.UPDATE_ACCOUNTS:
      return { ...state, accounts: action.accounts }
  }

  return state
}
