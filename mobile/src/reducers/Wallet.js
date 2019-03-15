import { WalletConstants } from 'actions/Wallet'

const initialState = {
  address: undefined,
  balances: {
    eth: '0',
    ogn: '0',
    // dai: '0',
  },
}

export default function Wallet(state = initialState, action = {}) {
  switch (action.type) {
    case WalletConstants.INIT_SUCCESS:
      return { ...state, address: action.address }

    case WalletConstants.BALANCE_SUCCESS:
      return { ...state, balances: { ...state.balances, eth: action.balance } }

    case WalletConstants.OGN_SUCCESS:
      return { ...state, balances: { ...state.balances, ogn: action.ogns } }
  }

  return state
}
