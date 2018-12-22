import { ProfileConstants } from 'actions/Profile'
import { WalletConstants } from 'actions/Wallet'

const initialState = {
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
      return { ...state, address: action.wallet }

    case WalletConstants.BALANCE_SUCCESS:
      return { ...state, balances: { ...state.balances, eth: action.balance } }

    case ProfileConstants.FETCH_SUCCESS:
      return { ...state, address: action.wallet }
  }

  return state
}
