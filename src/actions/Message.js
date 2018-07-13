import keyMirror from 'utils/keyMirror'
import origin from '../services/origin'

export const MessageConstants = keyMirror(
  {
    ADD: null,
    ERROR: null,
  },
  'MESSAGE'
)

export function addMessage(obj) {
  return async function(dispatch) {
    try {
      dispatch({
        type: MessageConstants.ADD,
        obj,
      })
    } catch(error) {
      dispatch({ type: MessageConstants.ERROR, error })
    }
  }
}
