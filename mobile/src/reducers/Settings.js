'use strict'

import { SettingsConstants } from 'actions/Settings'
import { NETWORKS } from '../constants'

const mainnet = NETWORKS.find(n => n.name === 'Mainnet')
const docker = NETWORKS.find(n => n.name === 'Docker')
const defaultNetwork = __DEV__ ? docker : mainnet

const initialState = {
  network: defaultNetwork,
  deviceToken: null
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
  }

  return state
}
