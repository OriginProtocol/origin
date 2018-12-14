import { AppConstants } from '../actions/App'

const initialState = {
  activated: null
}

export default function App(state = initialState, action = {}) {
  switch (action.type) {
    case AppConstants.STORE_ACTIVATION:
      return { ...state, activated: action.activated }
  }
  
  return state
}
