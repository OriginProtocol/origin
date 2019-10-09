export const SET_SESSION_EXPIRED = 'SET_SESSION_EXPIRED'

export function setSessionExpired(value) {
  return {
    type: SET_SESSION_EXPIRED,
    value
  }
}
