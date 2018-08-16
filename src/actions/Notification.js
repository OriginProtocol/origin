import keyMirror from 'utils/keyMirror'

import origin from '../services/origin'

export const NotificationConstants = keyMirror(
  {
    ERROR: null,
    FETCH: null,
  },
  'NOTIFICATION'
)

export function fetchNotifications() {
  return async function(dispatch) {
    try {
      const notifications = await origin.notifications.all()

      dispatch({
        type: NotificationConstants.FETCH,
        notifications,
      })
    } catch(err) {
      dispatch({ type: NotificationConstants.ERROR, err })
    }
  }
}
