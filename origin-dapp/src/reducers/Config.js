import { ConfigConstants } from 'actions/Config'
import { baseConfig } from '../config'

export default function Config(state = baseConfig, action = {}) {
  switch (action.type) {
    case ConfigConstants.FETCH_ERROR:
      return state

    case ConfigConstants.FETCH_SUCCESS:
      return state

    default:
      return state
  }
}
