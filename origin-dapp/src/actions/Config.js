import keyMirror from 'utils/keyMirror'

export const ConfigConstants = keyMirror(
  {
    FETCH: null,
    FETCH_SUCCESS: null,
    FETCH_ERROR: null
  },
  'CONFIG'
)

function timeoutPromise(timeout, err, promise) {
  return new Promise(function(resolve, reject) {
    promise.then(resolve, reject)
    setTimeout(reject.bind(null, err), timeout)
  })
}

export function fetchConfig(url) {
  return async function(dispatch) {
    if (url) {
      // Use a timeout so that the default styling gets applied if no config
      // could be retrieved. If the hash of the config can't be found IPFS will
      // block for a long time while it searches peers leading to an unstyled DApp.
      return timeoutPromise(5000, new Error('Timeout'), fetch(url))
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
