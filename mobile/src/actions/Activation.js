'use strict'

import keyMirror from 'utils/keyMirror'

export const ActivationConstants = keyMirror(
  {
    PROMPT_FOR_NOTIFICATIONS: null,
    UPDATE_NOTIFICATIONS_PERMISSIONS: null,
    UPDATE_BACKUP_WARNING_STATUS: null,
    UPDATE_CAROUSEL_STATUS: null,
  },
  'App'
)

export function promptForNotifications(prompt) {
  return {
    type: ActivationConstants.PROMPT_FOR_NOTIFICATIONS,
    prompt,
  }
}

export function updateNotificationsPermissions(permissions) {
  return {
    type: ActivationConstants.UPDATE_NOTIFICATIONS_PERMISSIONS,
    permissions,
  }
}

export function updateBackupWarningStatus(dismissed, hidden) {
  return {
    type: ActivationConstants.UPDATE_BACKUP_WARNING_STATUS,
    dismissed,
  }
}

export function updateCarouselStatus(completed) {
  return {
    type: ActivationConstants.UPDATE_CAROUSEL_STATUS,
    completed,
  }
}
