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
    if (url) {
      return fetch(url)
        .then(response => response.json())
        .then(configJson => {
          dispatch({ type: ConfigConstants.FETCH_SUCCESS, configJson })
        })
        .catch((error) => {
          dispatch({ type: ConfigConstants.FETCH_ERROR, error })
        })
    }
  }
}
