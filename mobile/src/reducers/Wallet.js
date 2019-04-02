import { WalletConstants } from 'actions/Wallet'

const initialState = {
  accounts: [],
  address: undefined
}

export default function Wallet(state = initialState, action = {}) {
  switch (action.type) {
    case WalletConstants.INIT_SUCCESS:
      return { ...state, address: action.address }

    case WalletConstants.UPDATE_ACCOUNTS:
      return { ...state, accounts: action.accounts }
  }

  return state
}
