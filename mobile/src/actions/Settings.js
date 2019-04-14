'use strict'

import keyMirror from 'utils/keyMirror'

export const SettingsConstants = keyMirror(
  {
    SET_NETWORK: null,
    SET_DEVICE_TOKEN: null
  },
  'SETTINGS'
)

export function setNetwork(network) {
  return {
    type: SettingsConstants.SET_NETWORK,
    network
  }
}

export function setDeviceToken(payload) {
  return {
    type: SettingsConstants.SET_DEVICE_TOKEN,
    payload
  }
}
