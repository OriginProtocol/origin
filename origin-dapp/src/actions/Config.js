import keyMirror from 'utils/keyMirror'

export const ConfigConstants = keyMirror(
  {
    FETCH: null,
    FETCH_SUCCESS: null,
    FETCH_ERROR: null
  },
  'CONFIG'
)

export function fetchConfig(url) {
  return async function(dispatch) {
    try {
      dispatch({
        type: ConfigConstants.FETCH_SUCCESS,
        config
      })
    } catch (error) {
      dispatch({ type: ConfigConstants.FETCH_ERROR, error })
    }
  }
}
