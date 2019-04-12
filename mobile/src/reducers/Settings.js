'use strict'

import { SettingsConstants } from 'actions/Settings'
import { NETWORKS } from '../constants'

const mainnet = NETWORKS.find(n => n.id === 1)
const localhost = NETWORKS.find(n => n.id === 999)

const initialState = {
  network: __DEV__ ? localhost : mainnet
}

export default function Settings(state = initialState, action = {}) {
  switch (action.type) {
    case SettingsConstants.SET_NETWORK:
      return { ...state, network: action.network }
  }

  return state
}
