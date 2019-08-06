import { SET_SESSION_EMAIL } from '../actions/session'

const initialState = {
  email: false
}

export default function Session(state = initialState, action) {
  switch (action.type) {
    case SET_SESSION_EMAIL:
      return { ...state, email: action.email }

    default:
      return state
  }
}
