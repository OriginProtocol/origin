import { SET_SESSION_EXPIRED } from '../actions/session'

const initialState = {
  expired: false
}

export default function Session(state = initialState, action) {
  switch (action.type) {
    case SET_SESSION_EXPIRED:
      return {
        ...state,
        expired: action.value
      }
    default:
      return state
  }
}

export const getSessionExpired = state => state.expired
