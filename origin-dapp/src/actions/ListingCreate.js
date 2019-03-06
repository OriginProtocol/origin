import keyMirror from 'utils/keyMirror'

export const ListingCreateConstants = keyMirror(
  {
    UPDATE: null,
    CLEAR: null
  },
  'LISTING_CREATE'
)

export function updateState(payload){
  return {
    type: ListingCreateConstants.UPDATE,
    payload
  }
}

export function clearState(){
  return {
    type: ListingCreateConstants.CLEAR
  }
}