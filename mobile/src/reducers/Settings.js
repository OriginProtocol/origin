'use strict'

import { SettingsConstants } from 'actions/Settings'
import { NETWORKS } from '../constants'

const defaultNetwork = NETWORKS.find(n => n.name === 'Mainnet')
// const defaultNetwork = NETWORKS.find(n => n.name === 'Rinkeby')

const initialState = {
  biometryType: null,
  currency: null,
  deviceToken: null,
  language: null,
  network: defaultNetwork,
  pin: null
}

export default function Settings(state = initialState, action = {}) {
  switch (action.type) {
    case SettingsConstants.SET_BIOMETRY_TYPE:
      return { ...state, biometryType: action.biometryType }

    case SettingsConstants.SET_CURRENCY:
      return { ...state, currency: action.currency }

    case SettingsConstants.SET_DEVICE_TOKEN:
      return { ...state, deviceToken: action.deviceToken }

    case SettingsConstants.SET_LANGUAGE:
      return { ...state, language: action.language }

    case SettingsConstants.SET_NETWORK:
      return { ...state, network: action.network }

    case SettingsConstants.SET_PIN:
      return { ...state, pin: action.pin }
  }

  return state
}
