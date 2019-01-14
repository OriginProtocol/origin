import keyMirror from 'utils/keyMirror'

import origin from '../services/origin'

export const NotificationConstants = keyMirror(
  {
    ADD: null,
    REMOVE: null,
  },
  'NOTIFICATION'
)

export function add(notification) {
  return {
    type: NotificationConstants.ADD,
    notification,
  }
}

export function remove(id) {
  return {
    type: NotificationConstants.REMOVE,
    id,
  }
}
