'use strict'

import { SettingsConstants } from 'actions/Settings'
import { NETWORKS } from '../constants'

const mainnet = NETWORKS.find(n => n.name === 'Mainnet')
const localhost = NETWORKS.find(n => n.name === 'Localhost')

const initialState = {
  // eslint-disable-next-line no-undef
  network: __DEV__ ? localhost : mainnet,
  deviceToken: null
}

export default function Settings(state = initialState, action = {}) {
  switch (action.type) {
    case SettingsConstants.SET_NETWORK:
      return { ...state, network: action.network }

    case SettingsConstants.SET_DEVICE_TOKEN:
      return { ...state, deviceToken: action.deviceToken }
  }

  return state
}
