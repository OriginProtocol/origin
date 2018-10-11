import { AlertConstants } from 'actions/Alert'

const initialState = {
  message: ''
}

export default function Alert(state = initialState, action = {}) {
  switch (action.type) {
  case AlertConstants.SHOW:
    return { ...state, message: action.message, show: true }

  case AlertConstants.HIDE:
    return { ...state, message: '', show: false }

  default:
    return state
  }
}
