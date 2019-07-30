import {
  REFRESH_GRANTS,
  SET_GRANTS,
  SET_SESSION_EMAIL
} from '../constants/action-types'

const initialState = {
  grants: [],
  grantsVersion: 1,
  sessionEmail: false
}

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case REFRESH_GRANTS:
      return { ...state, grantsVersion: state.grantsVersion + 1 }

    case SET_GRANTS:
      return { ...state, grants: action.grants }

    case SET_SESSION_EMAIL:
      return { ...state, sessionEmail: action.email }

    default:
      return state
  }
}

export default rootReducer
