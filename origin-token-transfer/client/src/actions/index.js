import {
  REFRESH_GRANTS,
  SET_GRANTS,
  SET_SESSION_EMAIL,
  SET_TRANSFER_DIALOG_GRANT,
  SET_TRANSFER_DIALOG_OPEN
} from '../constants/action-types'

export const refreshGrants = () => ({ type: REFRESH_GRANTS })
export const setGrants = grants => ({ type: SET_GRANTS, grants })
export const setSessionEmail = email => ({ type: SET_SESSION_EMAIL, email })
export const setTransferDialogGrant = grant => ({ type: SET_TRANSFER_DIALOG_GRANT, grant })
export const setTransferDialogOpen = open => ({ type: SET_TRANSFER_DIALOG_OPEN, open })
