import keyMirror from '../utils/keyMirror'

export const AppConstants = keyMirror(
  {
    ON_MOBILE: null,
    WEB3_ACCOUNT: null,
    WEB3_INTENT: null,
  },
  'APP'
)

export function setMobile(device) {
  return { type: AppConstants.ON_MOBILE, device }
}

export function storeWeb3Account(address) {
  return { type: AppConstants.WEB3_ACCOUNT, address }
}

export function storeWeb3Intent(intent) {
  return { type: AppConstants.WEB3_INTENT, intent }
}
