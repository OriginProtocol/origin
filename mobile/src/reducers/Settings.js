'use strict'

import { SettingsConstants } from 'actions/Settings'
import { NETWORKS } from '../constants'

const initialState = {
  network: NETWORKS.find(n => n.name === 'Mainnet'),
  deviceToken: null,
  language: null,
  // Onboarding
  pin: null,
  biometryType: null,
  email: null,
  firstName: null,
  lastName: null,
  profileImage: null
}

export default function Settings(state = initialState, action = {}) {
  switch (action.type) {
    case SettingsConstants.SET_NETWORK:
      return {
        ...state,
        network: action.network
      }

    case SettingsConstants.SET_DEVICE_TOKEN:
      return { ...state, deviceToken: action.deviceToken }

    case SettingsConstants.SET_EMAIL:
      return { ...state, email: action.email }

    case SettingsConstants.SET_PIN:
      return { ...state, pin: action.pin }

    case SettingsConstants.SET_BIOMETRY_TYPE:
      return { ...state, biometryType: action.biometryType }

    case SettingsConstants.SET_LANGUAGE:
      return { ...state, language: action.language }

    case SettingsConstants.SET_NAME:
      return {
        ...state,
        firstName: action.payload.firstName,
        lastName: action.payload.lastName
      }

    case SettingsConstants.SET_PROFILE_IMAGE:
      return { ...state, profileImage: action.profileImage }
  }

  return state
}
