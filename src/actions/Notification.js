import { showAlert } from 'actions/Alert'

import keyMirror from 'utils/keyMirror'

import origin from '../services/origin'

export const NotificationConstants = keyMirror(
  {
    ERROR: null,
    FETCH: null,
    UPDATE: null
  },
  'NOTIFICATION'
)

export function fetchNotifications() {
  return async function(dispatch) {
    try {
      const notifications = await origin.marketplace.getNotifications()

      dispatch({
        type: NotificationConstants.FETCH,
        notifications
      })
    } catch (error) {
      dispatch(showAlert(error.message))
      dispatch({ type: NotificationConstants.ERROR, error })
    }
  }
}

export function updateNotification(id, status) {
  return async function(dispatch) {
    try {
      await origin.marketplace.setNotification({
        id,
        status
      })

      dispatch({
        type: NotificationConstants.UPDATE,
        id,
        status
      })
    } catch (error) {
      dispatch(showAlert(error.message))
      dispatch({ type: NotificationConstants.ERROR, error })
    }
  }
}
