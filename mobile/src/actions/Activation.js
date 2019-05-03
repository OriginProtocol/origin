'use strict'

import keyMirror from 'utils/keyMirror'

export const ActivationConstants = keyMirror(
  {
    SET_BACKUP_WARNING_STATUS: null,
    SET_CAROUSEL_STATUS: null
  },
  'App'
)

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
