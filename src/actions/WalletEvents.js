import keyMirror from 'utils/keyMirror'
import origin from '../services/origin'

export const WalletEventsConstants = keyMirror(
  {
    NEW_EVENT:null,
    UPDATE_EVENT:null,
    PROCESSED_EVENT:null
  },
  "WalletEvents"
)
 

export function newEvent(matcher, event) {
  return {type:WalletEventsConstants.NEW_EVENT, matcher, event}
}

export function updateEvent(matcher, update) {
  return {type:WalletEventsConstants.UPDATE_EVENT, matcher}
}

export function processedEvent(matcher, update, new_event) {
  return {type:WalletEventsConstants.PROCESSED_EVENT, matcher, update, new_event}
}
