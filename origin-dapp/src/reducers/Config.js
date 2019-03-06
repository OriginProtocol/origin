import { ConfigConstants } from 'actions/Config'
import { baseConfig } from '../config'

export default function Config(state = baseConfig, action = {}) {
  switch (action.type) {
    case ConfigConstants.FETCH_SUCCESS:
      return Object.assign(state, { ...action.configJson.config, isWhiteLabel: true })

    case ConfigConstants.FETCH_ERROR:
      return state

    default:
      return state
  }
}
