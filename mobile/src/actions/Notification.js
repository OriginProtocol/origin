'use strict'

import keyMirror from 'utils/keyMirror'

export const NotificationConstants = keyMirror(
  {
    ADD: null,
    REMOVE: null
  },
  'NOTIFICATION'
)

export function addNotification(notification) {
  return {
    type: NotificationConstants.ADD,
    notification
  }
}

export function removeNotification(id) {
  return {
    type: NotificationConstants.REMOVE,
    id
  }
}
