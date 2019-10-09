'use strict'

import keyMirror from 'utils/keyMirror'

export const SettingsConstants = keyMirror(
  {
    SET_NETWORK: null,
    SET_DEVICE_TOKEN: null,
    SET_PIN: null,
    SET_BIOMETRY_TYPE: null,
    SET_LANGUAGE: null,
    SET_CURRENCY: null,
    SET_PIN_STATUS: null
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

export function setPin(pin) {
  return {
    type: SettingsConstants.SET_PIN,
    pin
  }
}

export function setPinStatus(status) {
  return {
    type: SettingsConstants.SET_PIN_STATUS,
    status
  }
}

export function setBiometryType(biometryType) {
  return {
    type: SettingsConstants.SET_BIOMETRY_TYPE,
    biometryType
  }
}

export function setLanguage(language) {
  return {
    type: SettingsConstants.SET_LANGUAGE,
    language
  }
}

export function setCurrency(currency) {
  return {
    type: SettingsConstants.SET_CURRENCY,
    currency
  }
}
