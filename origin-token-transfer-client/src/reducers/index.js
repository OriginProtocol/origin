import {
  REFRESH_GRANTS,
  SET_GRANTS,
  SET_SESSION_EMAIL,
  SET_TRANSFER_DIALOG_OPEN,
  SET_TRANSFER_DIALOG_GRANT
} from '../constants/action-types'

const initialState = {
  grants: [],
  grantsVersion: 1,
  sessionEmail: '(need to login)',
  transferDialogGrant: undefined,
  transferDialogOpen: false
}

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case REFRESH_GRANTS:
      return { ...state, grantsVersion: state.grantsVersion + 1 }

    case SET_GRANTS:
      return { ...state, grants: action.grants }

    case SET_SESSION_EMAIL:
      return { ...state, sessionEmail: action.email }

    case SET_TRANSFER_DIALOG_GRANT:
      return { ...state, transferDialogGrant: action.grant }

    case SET_TRANSFER_DIALOG_OPEN:
      return { ...state, transferDialogOpen: action.open }

    default:
      return state
  }
}

export default rootReducer
