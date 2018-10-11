import keyMirror from 'utils/keyMirror'

import origin from '../services/origin'

export const MessageConstants = keyMirror(
  {
    ADD: null,
    ERROR: null,
    UPDATE: null
  },
  'MESSAGE'
)

export function addMessage(obj) {
  return function(dispatch) {
    try {
      dispatch({
        type: MessageConstants.ADD,
        obj
      })
    } catch (err) {
      dispatch({ type: MessageConstants.ERROR, err })
    }
  }
}

export function updateMessage(obj) {
  return function(dispatch) {
    try {
      origin.messaging.set(obj)

      dispatch({
        type: MessageConstants.UPDATE,
        obj
      })
    } catch (err) {
      dispatch({ type: MessageConstants.ERROR, err })
    }
  }
}
