import { WalletConstants } from 'actions/Wallet'

const initialState = {
  address: undefined,
  initialized: false,
  ethBalance: '0',
  ognBalance: '0'
}

export default function Wallet(state = initialState, action = {}) {
  switch (action.type) {

  case WalletConstants.ACCOUNT_ADDRESS:
    return { ...state, address: action.address, initialized: action.initialized }

  case WalletConstants.ETH_BALANCE_SUCCESS:
    return { ...state, ethBalance: action.ethBalance }

  case WalletConstants.OGN_BALANCE_SUCCESS:
    return { ...state, ognBalance: action.ognBalance }

  }

  return state
}
