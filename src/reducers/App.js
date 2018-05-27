import { AppConstants } from '../actions/App'

const initialState = {
  onMobile: null,
  web3: {
    account: null,
    intent: null,
  },
}

export default function App(state = initialState, action = {}) {
  switch (action.type) {

    case AppConstants.ON_MOBILE:

      return { ...state, onMobile: action.device }

    case AppConstants.WEB3_ACCOUNT:
      return { ...state, web3: { ...state.web3, account: action.address }}

    case AppConstants.WEB3_INTENT:
      return { ...state, web3: { ...state.web3, intent: action.intent }}

    default:
      return state
  }
}
