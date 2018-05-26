import { AppConstants } from '../actions/App'

const initialState = {
  onMobile: null,
  web3: {
    account: null,
  },
}

export default function App(state = initialState, action = {}) {
  switch (action.type) {

    case AppConstants.ON_MOBILE:

      return { ...state, onMobile: action.device }

    case AppConstants.WEB3:
      return { ...state, web3: { ...web3, account: action.address }}

    default:
      return state
  }
}
