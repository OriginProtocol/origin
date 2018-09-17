import keyMirror from 'utils/keyMirror'

export const AlertConstants = keyMirror(
  {
    SHOW: null,
    HIDE: null
  },
  'ALERT'
)

export function showAlert(message) {
  return { type: AlertConstants.SHOW, message }
}

export function hideAlert() {
  return { type: AlertConstants.HIDE }
}
