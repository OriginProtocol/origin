'use strict'

import keyMirror from 'utils/keyMirror'

export const ActivationConstants = keyMirror(
  {
    PROMPT_FOR_NOTIFICATIONS: null,
    SET_NOTIFICATIONS_PERMISSIONS: null,
    SET_BACKUP_WARNING_STATUS: null,
    SET_CAROUSEL_STATUS: null
  },
  'App'
)

export function promptForNotifications(prompt) {
  return {
    type: ActivationConstants.PROMPT_FOR_NOTIFICATIONS,
    prompt
  }
}

export function setNotificationsPermissions(permissions) {
  return {
    type: ActivationConstants.SET_NOTIFICATIONS_PERMISSIONS,
    permissions
  }
}

export function setBackupWarningStatus(dismissed) {
  return {
    type: ActivationConstants.SET_BACKUP_WARNING_STATUS,
    dismissed
  }
}

export function setCarouselStatus(completed) {
  return {
    type: ActivationConstants.SET_CAROUSEL_STATUS,
    completed
  }
}
