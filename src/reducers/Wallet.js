import { WalletConstants } from '../actions/Wallet'
import { ProfileConstants } from '../actions/Profile'

const initialState = {
  address: undefined,
  balance: '0',
}

export default function Wallet(state = initialState, action = {}) {
  switch (action.type) {
    case WalletConstants.INIT_SUCCESS:
      return { ...state, address: action.wallet }

    case WalletConstants.BALANCE_SUCCESS:
      return { ...state, balance: action.balance }

    case ProfileConstants.FETCH_SUCCESS:
      return { ...state, address: action.wallet }
  }

  return state
}
