import keyMirror from 'utils/keyMirror'

import origin from '../services/origin'

export const UserConstants = keyMirror(
  {
    FETCH: null,
    FETCH_SUCCESS: null,
    FETCH_ERROR: null
  },
  'USER'
)

export function fetchUser(address) {
  return async function(dispatch) {
    try {
      const user = await origin.users.get(address)

      dispatch({
        type: UserConstants.FETCH_SUCCESS,
        user
      })
    } catch (error) {
      dispatch({ type: UserConstants.FETCH_ERROR, error })
    }
  }
}
