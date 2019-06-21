'use strict'

import keyMirror from 'utils/keyMirror'

export const ActivationConstants = keyMirror(
  {
    SET_BACKUP_WARNING_STATUS: null
  },
  'ACTIVATION'
)

export function setBackupWarningStatus(address) {
  return {
    type: ActivationConstants.SET_BACKUP_WARNING_STATUS,
    address,
    date: new Date()
  }
}
