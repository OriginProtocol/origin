'use strict'

import keyMirror from 'utils/keyMirror'

export const SettingsConstants = keyMirror(
  {
    SET_NETWORK: null,
    SET_DEVICE_TOKEN: null,
    SET_EMAIL: null,
    SET_PIN: null
  },
  'SETTINGS'
)

export function setNetwork(network) {
  return {
    type: SettingsConstants.SET_NETWORK,
    network
  }
}

export function setDeviceToken(deviceToken) {
  return {
    type: SettingsConstants.SET_DEVICE_TOKEN,
    deviceToken
  }
}

export function setEmail(email) {
  return {
    type: SettingsConstants.SET_EMAIL,
    email
  }
}

export function setPin(pin) {
  return {
    type: SettingsConstants.SET_PIN,
    pin
  }
}
