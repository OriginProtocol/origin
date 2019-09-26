'use strict'

import { Platfrom } from 'react-native'

import { ActivationConstants } from 'actions/Activation'

const initialState = {
  // Address to date of backup/dismissal
  backupWarningDismissed: {},
  // Notifications don't require request on Android, so mark as though requested
  notificationsRequested: Platform.OS === 'android'
}

export default function Activation(state = initialState, action = {}) {
  switch (action.type) {
    case ActivationConstants.SET_BACKUP_WARNING_STATUS:
      return {
        ...state,
        backupWarningDismissed: {
          ...state.backupWarningDismissed,
          [action.address]: action.date
        }
      }

    case ActivationConstants.SET_NOTIFICATIONS_REQUESTED:
      return {
        ...state,
        notificationsRequested: action.value
      }
  }

  return state
}
