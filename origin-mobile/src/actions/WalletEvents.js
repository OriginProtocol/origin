import origin from 'services/origin'

import keyMirror from 'utils/keyMirror'

export const WalletEventsConstants = keyMirror(
  {
    NEW_EVENT: null,
    UPDATE_EVENT: null,
    PROCESSED_EVENT: null,
    SET_ACTIVE_EVENT: null,
  },
  'WalletEvents'
)

export function newEvent(matcher, event) {
  return { type: WalletEventsConstants.NEW_EVENT, matcher, event }
}

export function processedEvent(matcher, update, new_event) {
  return { type: WalletEventsConstants.PROCESSED_EVENT, matcher, update, new_event }
}

export function setActiveEvent(event) {
  return { type: WalletEventsConstants.SET_ACTIVE_EVENT, event }
}

export function updateEvent(matcher, update) {
  return { type: WalletEventsConstants.UPDATE_EVENT, matcher, update }
}
