import keyMirror from 'utils/keyMirror'

import { storeData } from '../tools'

export const ActivationConstants = keyMirror(
  {
    PROMPT_FOR_NOTIFICATIONS: null,
    STORE_NOTIFICATIONS_PERMISSIONS: null,
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

export function storeNotificationsPermissions(permissions) {
  return {
    type: ActivationConstants.STORE_NOTIFICATIONS_PERMISSIONS,
    permissions,
  }
}

export function updateBackupWarningStatus(dismissed, hidden) {
  hidden && storeData('backupWarningDismissed', hidden)

  return {
    type: ActivationConstants.UPDATE_BACKUP_WARNING_STATUS,
    dismissed,
  }
}

export function updateCarouselStatus(completed) {
  storeData('carouselCompleted', completed)

  return {
    type: ActivationConstants.UPDATE_CAROUSEL_STATUS,
    completed,
  }
}
