import keyMirror from '../utils/keyMirror'

export const AppConstants = keyMirror(
  {
    ON_MOBILE: null,
    WEB3: null
  },
  'APP'
)

export function setMobile(device) {
  return { type: AppConstants.ON_MOBILE, device }
}

export function storeWeb3Account(address) {
  return { type: AppConstants.WEB3, address }
}
