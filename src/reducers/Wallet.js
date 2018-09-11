import { ProfileConstants } from 'actions/Profile'
import { WalletConstants } from 'actions/Wallet'

const initialState = {
  address: undefined,
  ethBalance: '0',
  ognBalance: '0'
}

export default function Wallet(state = initialState, action = {}) {
  switch (action.type) {
  case WalletConstants.INIT_SUCCESS:
    return { ...state, address: action.wallet }

  case WalletConstants.ETH_BALANCE_SUCCESS:
    return { ...state, ethBalance: action.ethBalance }

  case WalletConstants.OGN_BALANCE_SUCCESS:
    return { ...state, ognBalance: action.ognBalance }

  case ProfileConstants.FETCH_SUCCESS:
    return { ...state, address: action.wallet }
  }

  return state
}
