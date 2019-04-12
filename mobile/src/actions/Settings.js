'use strict'

import keyMirror from 'utils/keyMirror'

export const SettingsConstants = keyMirror(
  {
    SET_NETWORK: null
  },
  'SETTINGS'
)

export function setNetwork(network) {
  return {
    type: SettingsConstants.SET_NETWORK,
    network
  }
}
